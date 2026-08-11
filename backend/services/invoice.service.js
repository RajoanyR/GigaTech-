const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const { pool } = require('../config/db');

// Les espaces insecables etroits de toLocaleString('fr-FR') ne sont pas presents dans
// les polices PDF standard (ils s'affichaient comme "/") : on les normalise.
const money = (n, devise = 'USD') =>
  `${Number(n || 0)
    .toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    .replace(/[\u00a0\u202f\u2009]/g, ' ')} ${devise}`;

/** Genere et diffuse la facture PDF d'une vente (logo, QR code, TVA, totaux). */
exports.streamInvoice = async function streamInvoice(vente, res) {
  const [[params]] = await pool.query('SELECT * FROM parametres WHERE id = 1');
  const devise = params?.devise || 'USD';

  const qr = await QRCode.toBuffer(
    `GIGATECH|${vente.numero}|${vente.total}|${new Date(vente.date_vente).toISOString()}`,
    { width: 140, margin: 1 }
  );

  const doc = new PDFDocument({ size: 'A4', margin: 40 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="facture-${vente.numero}.pdf"`);
  doc.pipe(res);

  // En-tete
  doc.fontSize(22).fillColor('#0f172a').text(params?.entreprise || 'GigaTech', 40, 45);
  doc.fontSize(9).fillColor('#64748b')
    .text(params?.adresse || 'Vente de materiels informatiques')
    .text(`Tel : ${params?.telephone || '-'} | Email : ${params?.email || '-'}`)
    .text(`RCCM : ${params?.rccm || '-'} | NIF : ${params?.nif || '-'}`);

  doc.fontSize(16).fillColor('#2563eb').text('FACTURE', 420, 48, { align: 'right' });
  doc.fontSize(9).fillColor('#334155')
    .text(`N° ${vente.numero}`, { align: 'right' })
    .text(new Date(vente.date_vente).toLocaleString('fr-FR'), { align: 'right' });

  // Client
  doc.moveTo(40, 130).lineTo(555, 130).strokeColor('#e2e8f0').stroke();
  doc.fontSize(10).fillColor('#0f172a').text('Client', 40, 145);
  doc.fontSize(9).fillColor('#475569')
    .text(vente.client_nom || 'Client comptant')
    .text(vente.client_telephone || '')
    .text(vente.client_adresse || '');
  doc.image(qr, 455, 140, { width: 90 });

  // Tableau des lignes
  let y = 235;
  doc.rect(40, y, 515, 22).fill('#f1f5f9');
  doc.fillColor('#0f172a').fontSize(9)
    .text('Produit', 48, y + 7).text('Qte', 330, y + 7)
    .text('P.U.', 385, y + 7).text('Total', 480, y + 7);
  y += 28;
  doc.fillColor('#334155');
  for (const l of vente.lignes) {
    doc.text(`${l.produit_nom} (${l.reference})`, 48, y, { width: 270 })
      .text(String(l.quantite), 330, y)
      .text(money(l.prix_unitaire, devise), 385, y)
      .text(money(l.total_ligne, devise), 470, y, { width: 85, align: 'right' });
    y += 18;
    if (y > 700) { doc.addPage(); y = 60; }
  }

  // Totaux
  y += 12;
  doc.moveTo(320, y).lineTo(555, y).strokeColor('#e2e8f0').stroke();
  const line = (label, value, bold = false) => {
    y += 16;
    doc.font(bold ? 'Helvetica-Bold' : 'Helvetica').fillColor(bold ? '#0f172a' : '#475569')
      .text(label, 330, y).text(value, 440, y, { width: 115, align: 'right' });
  };
  line('Sous-total', money(vente.sous_total, devise));
  line(`Remise (${vente.remise}%)`, `- ${money(vente.montant_remise, devise)}`);
  line(`TVA (${vente.tva}%)`, money(vente.montant_tva, devise));
  line('TOTAL A PAYER', money(vente.total, devise), true);

  doc.font('Helvetica').fontSize(8).fillColor('#94a3b8')
    .text(`Mode de paiement : ${vente.mode_paiement} — Merci de votre confiance. ${params?.site_web || ''}`,
      40, 760, { align: 'center', width: 515 });

  doc.end();
};
