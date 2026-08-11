const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

/** Transforme les erreurs express-validator en ApiError 400. */
module.exports = (req, _res, next) => {
  const result = validationResult(req);
  if (result.isEmpty()) return next();
  const details = result.array().map((e) => ({ champ: e.path, message: e.msg }));
  next(ApiError.badRequest('Donnees invalides', details));
};
