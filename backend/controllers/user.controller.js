const bcrypt = require('bcryptjs');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { ok, created, paginate } = require('../utils/response');
const { parseListQuery } = require('../utils/query');
const UserModel = require('../models/user.model');

exports.list = asyncHandler(async (req, res) => {
  const opts = parseListQuery(req.query, UserModel.sortable, 'id');
  const { rows, total, page, limit } = await UserModel.findAll(opts);
  paginate(res, rows, total, page, limit);
});

exports.detail = asyncHandler(async (req, res) => {
  const user = await UserModel.findById(req.params.id);
  if (!user) throw ApiError.notFound('Utilisateur introuvable');
  ok(res, user);
});

exports.create = asyncHandler(async (req, res) => {
  const { mot_de_passe, email, ...rest } = req.body;
  if (await UserModel.findByEmailWithPassword(email.toLowerCase())) throw ApiError.conflict('Email deja utilise');
  const user = await UserModel.create({
    ...rest, email: email.toLowerCase(), mot_de_passe: await bcrypt.hash(mot_de_passe, 12),
  });
  created(res, await UserModel.findById(user.id), 'Utilisateur cree');
});

exports.update = asyncHandler(async (req, res) => {
  const { mot_de_passe, ...rest } = req.body;
  if (!(await UserModel.findById(req.params.id))) throw ApiError.notFound('Utilisateur introuvable');
  if (mot_de_passe) rest.mot_de_passe = await bcrypt.hash(mot_de_passe, 12);
  ok(res, await UserModel.update(req.params.id, rest), 'Utilisateur modifie');
});

exports.remove = asyncHandler(async (req, res) => {
  if (Number(req.params.id) === req.user.id) throw ApiError.badRequest('Vous ne pouvez pas supprimer votre propre compte');
  if (!(await UserModel.findById(req.params.id))) throw ApiError.notFound('Utilisateur introuvable');
  await UserModel.remove(req.params.id);
  ok(res, { id: Number(req.params.id) }, 'Utilisateur supprime');
});

/** PATCH /api/users/:id/status — activer / desactiver */
exports.toggleStatus = asyncHandler(async (req, res) => {
  const user = await UserModel.findById(req.params.id);
  if (!user) throw ApiError.notFound('Utilisateur introuvable');
  ok(res, await UserModel.update(user.id, { actif: user.actif ? 0 : 1 }), 'Statut mis a jour');
});
