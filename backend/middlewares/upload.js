const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ApiError = require('../utils/ApiError');

const dir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, dir),
  filename: (_req, file, cb) => {
    const ext = (path.extname(file.originalname) || '').toLowerCase() || '.jpg';
    const base = path.basename(file.originalname, path.extname(file.originalname))
      .replace(/[^a-zA-Z0-9\-_]/g, '_')
      .slice(0, 40);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e6)}-${base}${ext}`);
  },
});

const ALLOWED = ['image/jpeg', 'image/jpg', 'image/pjpeg', 'image/png', 'image/webp'];

const fileFilter = (_req, file, cb) => {
  if (!ALLOWED.includes((file.mimetype || '').toLowerCase())) {
    return cb(ApiError.badRequest('Format image non supporte : utilisez JPG, PNG ou WEBP'));
  }
  cb(null, true);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 3 * 1024 * 1024 } });
// Reference vers la methode d'origine : `module.exports.single` est remplace plus bas.
const multerSingle = upload.single.bind(upload);

/**
 * Enveloppe `upload.single` : les erreurs Multer (mauvais format, fichier trop lourd,
 * champ inattendu) sont transformees en ApiError lisibles au lieu d'un 500 opaque.
 */
const single = (field) => (req, res, next) =>
  multerSingle(field)(req, res, (err) => {
    if (!err) return next();
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') return next(ApiError.badRequest('Image trop lourde (3 Mo maximum)'));
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return next(ApiError.badRequest(`Champ de fichier inattendu : utilisez "${field}"`));
      }
      return next(ApiError.badRequest(`Erreur d'upload : ${err.message}`));
    }
    return next(err);
  });

module.exports = upload;
module.exports.single = single;
module.exports.ALLOWED_MIME = ALLOWED;
module.exports.UPLOAD_DIR = dir;
