const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { ok, created, paginate } = require('../utils/response');
const { parseListQuery } = require('../utils/query');
const SaleModel = require('../models/sale.model');
const invoiceService = require('../services/invoice.service');

exports.list = asyncHandler(async (req, res) => {
  const opts = parseListQuery(req.query, ['id'], 'id');
  const { rows, total, page, limit } = await SaleModel.list({
    ...opts, from: req.query.from, to: req.query.to, statut: req.query.statut,
  });
  paginate(res, rows, total, page, limit);
});

exports.detail = asyncHandler(async (req, res) => {
  const vente = await SaleModel.findById(req.params.id);
  if (!vente) throw ApiError.notFound('Vente introuvable');
  ok(res, vente);
});

exports.create = asyncHandler(async (req, res) => {
  const id = await SaleModel.create(req.body, req.user.id);
  created(res, await SaleModel.findById(id), 'Vente enregistree');
});

exports.cancel = asyncHandler(async (req, res) => {
  await SaleModel.cancel(req.params.id, req.user.id);
  ok(res, null, 'Vente annulee, stock restitue');
});

/** GET /api/sales/:id/invoice — facture PDF (logo, QR code, TVA) */
exports.invoice = asyncHandler(async (req, res) => {
  const vente = await SaleModel.findById(req.params.id);
  if (!vente) throw ApiError.notFound('Vente introuvable');
  await invoiceService.streamInvoice(vente, res);
});
