const asyncHandler = require('../utils/asyncHandler');
const { ok, paginate } = require('../utils/response');
const { parseListQuery } = require('../utils/query');
const StockModel = require('../models/stock.model');

exports.history = asyncHandler(async (req, res) => {
  const opts = parseListQuery(req.query, ['id'], 'id');
  const { rows, total, page, limit } = await StockModel.history({
    ...opts, produit_id: req.query.produit_id, type: req.query.type,
  });
  paginate(res, rows, total, page, limit);
});

exports.move = asyncHandler(async (req, res) => {
  await StockModel.move(req.body, req.user.id);
  ok(res, null, 'Mouvement de stock enregistre');
});

exports.alerts = asyncHandler(async (_req, res) => ok(res, await StockModel.alerts()));
