const asyncHandler = require('../utils/asyncHandler');
const { ok } = require('../utils/response');
const ReportModel = require('../models/report.model');
const exportService = require('../services/export.service');

/**
 * Normalise la plage de dates.
 * Si l'utilisateur envoie seulement une date (YYYY-MM-DD),
 * on ajoute automatiquement l'heure de début et de fin.
 */
const range = (q) => {
  const from = q.from
    ? `${q.from} 00:00:00`
    : `${new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10)} 00:00:00`;

  const to = q.to
    ? `${q.to} 23:59:59`
    : `${new Date().toISOString().slice(0, 10)} 23:59:59`;

  return { from, to };
};

exports.sales = asyncHandler(async (req, res) => {
  const { from, to } = range(req.query);
  const groupBy = req.query.groupBy || 'day';

  const [lignes, marge] = await Promise.all([
    ReportModel.sales({ from, to, groupBy }),
    ReportModel.profit({ from, to }),
  ]);

  ok(res, {
    periode: { from, to, groupBy },
    lignes,
    marge,
  });
});

exports.purchases = asyncHandler(async (req, res) => {
  const { from, to } = range(req.query);

  ok(res, {
    periode: { from, to },
    lignes: await ReportModel.purchases({ from, to }),
  });
});

/** GET /api/reports/export/excel */
exports.exportExcel = asyncHandler(async (req, res) => {
  const { from, to } = range(req.query);

  const lignes = await ReportModel.sales({
    from,
    to,
    groupBy: req.query.groupBy || 'day',
  });

  await exportService.salesToExcel(lignes, { from, to }, res);
});

/** GET /api/reports/export/pdf */
exports.exportPdf = asyncHandler(async (req, res) => {
  const { from, to } = range(req.query);

  const lignes = await ReportModel.sales({
    from,
    to,
    groupBy: req.query.groupBy || 'day',
  });

  await exportService.salesToPdf(lignes, { from, to }, res);
});