/** Erreur applicative typee, transformee en reponse JSON par le middleware d'erreurs. */
class ApiError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
  static badRequest(m, d) { return new ApiError(400, m, d); }
  static unauthorized(m = 'Non authentifie') { return new ApiError(401, m); }
  static forbidden(m = 'Acces refuse') { return new ApiError(403, m); }
  static notFound(m = 'Ressource introuvable') { return new ApiError(404, m); }
  static conflict(m) { return new ApiError(409, m); }
}
module.exports = ApiError;
