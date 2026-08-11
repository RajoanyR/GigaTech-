const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { ok, created, paginate } = require('../utils/response');
const { parseListQuery } = require('../utils/query');
const ProductModel = require('../models/product.model');

exports.list = asyncHandler(async (req, res) => {
  const opts = parseListQuery(req.query, ProductModel.sortable, 'id');
  const { rows, total, page, limit } = await ProductModel.search({
    ...opts,
    categorie_id: req.query.categorie_id,
    marque_id: req.query.marque_id,
    fournisseur_id: req.query.fournisseur_id,
    stock: req.query.stock,
  });
  paginate(res, rows, total, page, limit);
});

exports.detail = asyncHandler(async (req, res) => {
  const row = await ProductModel.findById(req.params.id);
  if (!row) throw ApiError.notFound('Produit introuvable');
  ok(res, row);
});

exports.create = asyncHandler(async (req, res) => {
  const payload = { ...req.body };
  if (req.file) payload.image = `/uploads/${req.file.filename}`;
  created(res, await ProductModel.create(payload), 'Produit cree');
});

exports.update = asyncHandler(async (req, res) => {
  if (!(await ProductModel.findById(req.params.id))) throw ApiError.notFound('Produit introuvable');
  const payload = { ...req.body };
  if (req.file) payload.image = `/uploads/${req.file.filename}`;
  ok(res, await ProductModel.update(req.params.id, payload), 'Produit modifie');
});

exports.remove = asyncHandler(async (req, res) => {
  if (!(await ProductModel.findById(req.params.id))) throw ApiError.notFound('Produit introuvable');
  await ProductModel.remove(req.params.id);
  ok(res, { id: Number(req.params.id) }, 'Produit supprime');
});

exports.lowStock = asyncHandler(async (_req, res) => ok(res, await ProductModel.lowStock(50)));
