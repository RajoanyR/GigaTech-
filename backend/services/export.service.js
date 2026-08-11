const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { pool } = require('../config/db');

// Les polices standard PDF ne contiennent pas l'espace insecable etroit utilise par
// toLocaleString('fr-FR') : il s'affichait comme un "/" dans le PDF. On le remplace.
const money = (n) =>
  Number(n || 0)
    .toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    .replace(/[\u00a0\u202f\u2009]/g, ' ');

/** Parametres de l'entreprise (nom, logo, devise) pour l'en-tete des documents. */
async function companyInfo() {
  try {
    const [[params]] = await pool.query('SELECT * FROM parametres WHERE id = 1');
    return params || {};
  } catch {
    return {};
  }
}

/** Chemin disque du logo enregistre en base (/uploads/xxx.png), s'il existe. */
function logoPath(logo) {
  if (!logo) return null;
  const file = path.join(__dirname, '..', logo.replace(/^\/+/, ''));
  return fs.existsSync(file) ? file : null;
}


/** Export Excel du rapport de ventes. */
exports.salesToExcel = async function (lignes, periode, res) {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'GigaTech';
  const ws = wb.addWorksheet('Ventes');
  ws.mergeCells('A1:F1');
  ws.getCell('A1').value = `GigaTech — Rapport de ventes du ${periode.from} au ${periode.to}`;
  ws.getCell('A1').font = { bold: true, size: 13 };
  ws.addRow([]);
  ws.addRow(['Periode', 'Nb ventes', 'Sous-total', 'Remises', 'TVA', 'Total']).font = { bold: true };
  lignes.forEach((l) => ws.addRow([l.periode, l.nb_ventes, Number(l.sous_total), Number(l.remises), Number(l.tva), Number(l.total)]));
  ws.columns.forEach((c) => { c.width = 18; });
  ws.addRow([]);
  ws.addRow(['TOTAL', '', '', '', '', lignes.reduce((s, l) => s + Number(l.total), 0)]).font = { bold: true };

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="rapport-ventes-${Date.now()}.xlsx"`);
  await wb.xlsx.write(res);
  res.end();
};

/**
 * Export PDF professionnel du rapport de ventes :
 * logo, entete entreprise, date d'edition, tableau zebre, total et pagination.
 */
exports.salesToPdf = async function (lignes, periode, res) {
  const params = await companyInfo();
  const devise = params.devise || 'USD';
  const logo = logoPath(params.logo);

  const doc = new PDFDocument({ size: 'A4', margin: 40, bufferPages: true });
  res.setHeader('Content-Type', 'application/pdf');
  // "attachment" : le navigateur telecharge le fichier au lieu de tenter un rendu.
  res.setHeader('Content-Disposition', `attachment; filename="rapport-ventes-${Date.now()}.pdf"`);
  doc.pipe(res);

  const LEFT = 40;
  const RIGHT = 555;
  const COLS = [
    { key: 'periode', label: 'Periode', x: 48, w: 120 },
    { key: 'nb_ventes', label: 'Ventes', x: 180, w: 55, align: 'right' },
    { key: 'sous_total', label: 'Sous-total', x: 245, w: 85, align: 'right' },
    { key: 'remises', label: 'Remises', x: 340, w: 70, align: 'right' },
    { key: 'tva', label: 'TVA', x: 415, w: 60, align: 'right' },
    { key: 'total', label: 'Total', x: 480, w: 70, align: 'right' },
  ];

  function header() {
    let y = 42;
    if (logo) {
      try { doc.image(logo, LEFT, y, { fit: [54, 54] }); } catch { /* logo illisible : ignore */ }
    }
    const textX = logo ? LEFT + 66 : LEFT;
    doc.font('Helvetica-Bold').fontSize(17).fillColor('#0f172a')
      .text(params.entreprise || 'GigaTech', textX, y);
    doc.font('Helvetica').fontSize(9).fillColor('#64748b')
      .text(params.adresse || 'Vente de materiels informatiques', textX, y + 21)
      .text(`Tel : ${params.telephone || '-'}  |  Email : ${params.email || '-'}`, textX, y + 33);

    doc.font('Helvetica-Bold').fontSize(13).fillColor('#2563eb')
      .text('RAPPORT DE VENTES', LEFT, y, { width: RIGHT - LEFT, align: 'right' });
    doc.font('Helvetica').fontSize(9).fillColor('#475569')
      .text(`Periode : ${periode.from} au ${periode.to}`, LEFT, y + 21, { width: RIGHT - LEFT, align: 'right' })
      .text(`Edite le ${new Date().toLocaleString('fr-FR')}`, LEFT, y + 33, { width: RIGHT - LEFT, align: 'right' });

    doc.moveTo(LEFT, y + 58).lineTo(RIGHT, y + 58).strokeColor('#e2e8f0').lineWidth(1).stroke();
    return y + 74;
  }

  function tableHead(y) {
    doc.rect(LEFT, y, RIGHT - LEFT, 22).fill('#f1f5f9');
    doc.font('Helvetica-Bold').fontSize(9).fillColor('#0f172a');
    COLS.forEach((c) => doc.text(c.label, c.x, y + 7, { width: c.w, align: c.align || 'left' }));
    doc.font('Helvetica').fillColor('#334155');
    return y + 26;
  }

  let y = tableHead(header());
  let total = 0;
  let rowIndex = 0;

  for (const l of lignes) {
    if (y > 720) {
      doc.addPage();
      y = tableHead(header());
    }
    if (rowIndex % 2 === 1) doc.rect(LEFT, y - 4, RIGHT - LEFT, 18).fill('#fafbfc');
    doc.fillColor('#334155').fontSize(9);
    const values = {
      periode: String(l.periode ?? '-'),
      nb_ventes: String(l.nb_ventes ?? 0),
      sous_total: money(l.sous_total),
      remises: money(l.remises),
      tva: money(l.tva),
      total: money(l.total),
    };
    COLS.forEach((c) => doc.text(values[c.key], c.x, y, { width: c.w, align: c.align || 'left' }));
    total += Number(l.total || 0);
    y += 18;
    rowIndex += 1;
  }

  if (!lignes.length) {
    doc.fillColor('#94a3b8').fontSize(10).text('Aucune vente sur la periode selectionnee', LEFT, y + 6, {
      width: RIGHT - LEFT, align: 'center',
    });
    y += 26;
  }

  // Bloc total
  doc.moveTo(LEFT, y + 4).lineTo(RIGHT, y + 4).strokeColor('#e2e8f0').stroke();
  doc.rect(RIGHT - 220, y + 12, 220, 26).fill('#0f172a');
  doc.font('Helvetica-Bold').fontSize(11).fillColor('#ffffff')
    .text(`TOTAL : ${money(total)} ${devise}`, RIGHT - 210, y + 20, { width: 200, align: 'right' });

  // Pagination (apres coup : le nombre total de pages est alors connu).
  const range = doc.bufferedPageRange();
  for (let i = 0; i < range.count; i += 1) {
    doc.switchToPage(range.start + i);
    doc.font('Helvetica').fontSize(8).fillColor('#94a3b8')
      .text(`${params.entreprise || 'GigaTech'} — Rapport genere automatiquement`, LEFT, 788, { width: 300, lineBreak: false })
      .text(`Page ${i + 1} / ${range.count}`, LEFT, 788, { width: RIGHT - LEFT, align: 'right', lineBreak: false });
  }

  doc.end();
};
