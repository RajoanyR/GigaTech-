const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');
const UserModel = require('../models/user.model');

/** Verifie le JWT (header Authorization: Bearer <token>) et charge l'utilisateur. */
async function protect(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    if (!header.startsWith('Bearer ')) throw ApiError.unauthorized();
    const payload = jwt.verify(header.slice(7), process.env.JWT_SECRET);
    const user = await UserModel.findById(payload.id);
    if (!user || !user.actif) throw ApiError.unauthorized('Compte inactif ou supprime');
    req.user = user;
    next();
  } catch (e) { next(e); }
}

/** Restreint l'acces a certains roles. Usage : authorize('administrateur','gestionnaire') */
const authorize = (...roles) => (req, _res, next) => {
  if (!req.user) return next(ApiError.unauthorized());
  if (roles.length && !roles.includes(req.user.role)) {
    return next(ApiError.forbidden(`Role "${req.user.role}" non autorise pour cette action`));
  }
  next();
};

module.exports = { protect, authorize };
