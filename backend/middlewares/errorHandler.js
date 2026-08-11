const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

/** 404 pour toute route inconnue. */
function notFound(req, res, next) {
  next(ApiError.notFound(`Route introuvable : ${req.originalUrl}`));
}

/** Gestionnaire d'erreurs centralise. */
function errorHandler(err, req, res, _next) {
  let error = err;
  if (err.code === 'ER_DUP_ENTRY') error = ApiError.conflict('Cet enregistrement existe deja');
  if (err.code === 'ER_ROW_IS_REFERENCED_2') error = ApiError.conflict('Suppression impossible : enregistrement utilise ailleurs');
  if (err.name === 'MulterError') {
    error = ApiError.badRequest(
      err.code === 'LIMIT_FILE_SIZE' ? 'Image trop lourde (3 Mo maximum)' : `Erreur d'upload : ${err.message}`
    );
  }
  if (err.code === 'ER_NO_REFERENCED_ROW_2') error = ApiError.badRequest('Reference liee inexistante (categorie, marque ou fournisseur)');
  if (err.code === 'ECONNREFUSED' || err.code === 'ER_ACCESS_DENIED_ERROR') {
    error = ApiError.badRequest('Connexion MySQL impossible : verifiez le fichier .env et que MySQL est demarre');
  }
  if (err.name === 'JsonWebTokenError') error = ApiError.unauthorized('Token invalide');
  if (err.name === 'TokenExpiredError') error = ApiError.unauthorized('Session expiree');

  const status = error.statusCode || 500;
  if (status >= 500) logger.error(err);

  res.status(status).json({
    success: false,
    message: error.message || 'Erreur serveur interne',
    ...(error.details ? { errors: error.details } : {}),
    ...(process.env.NODE_ENV === 'development' && status >= 500 ? { stack: err.stack } : {}),
  });
}
module.exports = { notFound, errorHandler };
