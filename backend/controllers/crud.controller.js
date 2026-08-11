const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { ok, created, paginate } = require('../utils/response');
const { parseListQuery } = require('../utils/query');

/**
 * Fabrique de controleur CRUD generique (DRY).
 * Chaque module (categories, marques, clients, ...) reutilise ces 5 actions.
 */
module.exports = function crudController(model, label = 'Element') {
  return {
    list: asyncHandler(async (req, res) => {
      const opts = parseListQuery(req.query, model.sortable, 'id');
      const { rows, total, page, limit } = await model.findAll(opts);
      paginate(res, rows, total, page, limit);
    }),

    detail: asyncHandler(async (req, res) => {
      const row = await model.findById(req.params.id);
      if (!row) throw ApiError.notFound(`${label} introuvable`);
      ok(res, row);
    }),

    create: asyncHandler(async (req, res) => {
      const row = await model.create(req.body);
      created(res, row, `${label} cree avec succes`);
    }),

    update: asyncHandler(async (req, res) => {
      const existing = await model.findById(req.params.id);
      if (!existing) throw ApiError.notFound(`${label} introuvable`);
      const row = await model.update(req.params.id, req.body);
      ok(res, row, `${label} modifie avec succes`);
    }),

    remove: asyncHandler(async (req, res) => {
      const existing = await model.findById(req.params.id);
      if (!existing) throw ApiError.notFound(`${label} introuvable`);
      await model.remove(req.params.id);
      ok(res, { id: Number(req.params.id) }, `${label} supprime avec succes`);
    }),
  };
};
