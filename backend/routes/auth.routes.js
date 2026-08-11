const router = require('express').Router();
const { body } = require('express-validator');
const validate = require('../middlewares/validate');
const { protect, authorize } = require('../middlewares/auth');
const upload = require('../middlewares/upload');
const c = require('../controllers/auth.controller');
const { ROLES } = require('../config/constants');

const password = (field) => body(field)
  .isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caracteres');

router.post('/login', [
  body('email').isEmail().withMessage('Email invalide').normalizeEmail(),
  body('mot_de_passe').notEmpty().withMessage('Mot de passe requis'),
], validate, c.login);

router.post('/register', protect, authorize(ROLES.ADMIN), [
  body('nom').trim().notEmpty().withMessage('Nom requis'),
  body('email').isEmail().withMessage('Email invalide'),
  password('mot_de_passe'),
  body('role').isIn(Object.values(ROLES)).withMessage('Role invalide'),
], validate, c.register);

router.post('/forgot-password', [body('email').isEmail()], validate, c.forgotPassword);
router.post('/reset-password', [body('token').notEmpty(), password('nouveau_mot_de_passe')], validate, c.resetPassword);
router.post('/logout', protect, c.logout);
router.get('/me', protect, c.me);
router.put('/profile', protect, upload.single('avatar'), c.updateProfile);
router.put('/password', protect, [
  body('ancien_mot_de_passe').notEmpty(), password('nouveau_mot_de_passe'),
], validate, c.changePassword);

module.exports = router;
