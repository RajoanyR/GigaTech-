/** Enveloppe un controleur async pour propager les rejets vers next(). */
module.exports = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
