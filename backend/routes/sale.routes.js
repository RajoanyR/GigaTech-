const router = require('express').Router();
const { body } = require('express-validator');
const validate = require('../middlewares/validate');
const { protect, authorize } = require('../middlewares/auth');
const c = require('../controllers/sale.controller');
const { ROLES, PAYMENT_METHODS } = require('../config/constants');

router.use(protect);
router.get('/', c.list);
router.get('/:id', c.detail);
router.get('/:id/invoice', c.invoice);
router.post('/', authorize(ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER), [
  body('client_id').optional({ values: 'null' }).isInt({ min: 1 }),
  body('lignes').isArray({ min: 1 }).withMessage('Au moins une ligne de vente'),
  body('lignes.*.produit_id').isInt({ min: 1 }).withMessage('Produit invalide'),
  body('lignes.*.quantite').isInt({ min: 1 }).withMessage('Quantite invalide'),
  body('remise').optional().isFloat({ min: 0, max: 100 }).withMessage('Remise entre 0 et 100'),
  body('tva').optional().isFloat({ min: 0, max: 100 }),
  body('mode_paiement').optional().isIn(PAYMENT_METHODS).withMessage('Mode de paiement invalide'),
], validate, c.create);
router.patch('/:id/cancel', authorize(ROLES.ADMIN, ROLES.MANAGER), c.cancel);

module.exports = router;
