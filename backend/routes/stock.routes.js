const router = require('express').Router();
const { body } = require('express-validator');
const validate = require('../middlewares/validate');
const { protect, authorize } = require('../middlewares/auth');
const c = require('../controllers/stock.controller');
const { ROLES, MOVEMENT_TYPES } = require('../config/constants');

router.use(protect);
router.get('/history', c.history);
router.get('/alerts', c.alerts);
router.post('/move', authorize(ROLES.ADMIN, ROLES.MANAGER, ROLES.STOCK), [
  body('produit_id').isInt({ min: 1 }).withMessage('Produit requis'),
  body('type').isIn(MOVEMENT_TYPES).withMessage('Type de mouvement invalide'),
  body('quantite').isInt({ min: 0 }).withMessage('Quantite invalide'),
  body('motif').optional().trim().isLength({ max: 255 }),
], validate, c.move);

module.exports = router;
