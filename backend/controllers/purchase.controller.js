const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { ok, created, paginate } = require('../utils/response');
const { parseListQuery } = require('../utils/query');
const PurchaseModel = require('../models/purchase.model');

exports.list = asyncHandler(async (req, res) => {
  const opts = parseListQuery(req.query, ['id'], 'id');
  const { rows, total, page, limit } = await PurchaseModel.list({ ...opts, statut: req.query.statut });
  paginate(res, rows, total, page, limit);
});

exports.detail = asyncHandler(async (req, res) => {
  const achat = await PurchaseModel.findById(req.params.id);
  if (!achat) throw ApiError.notFound('Achat introuvable');
  ok(res, achat);
});

exports.create = asyncHandler(async (req, res) => {
  const id = await PurchaseModel.create(req.body, req.user.id);
  created(res, await PurchaseModel.findById(id), 'Achat cree (brouillon)');
});

exports.validate = asyncHandler(async (req, res) => {
  await PurchaseModel.validate(req.params.id, req.user.id);
  ok(res, await PurchaseModel.findById(req.params.id), 'Achat valide, stock mis a jour');
});

exports.remove = asyncHandler(async (req, res) => {
  await PurchaseModel.remove(req.params.id);
  ok(res, { id: Number(req.params.id) }, 'Achat supprime');
});
