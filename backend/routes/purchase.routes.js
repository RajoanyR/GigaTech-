const router = require('express').Router();
const { body } = require('express-validator');
const validate = require('../middlewares/validate');
const { protect, authorize } = require('../middlewares/auth');
const c = require('../controllers/purchase.controller');
const { ROLES } = require('../config/constants');

router.use(protect);
router.get('/', c.list);
router.get('/:id', c.detail);
router.post('/', authorize(ROLES.ADMIN, ROLES.MANAGER, ROLES.STOCK), [
  body('fournisseur_id').isInt({ min: 1 }).withMessage('Fournisseur requis'),
  body('lignes').isArray({ min: 1 }).withMessage('Au moins une ligne'),
  body('lignes.*.produit_id').isInt({ min: 1 }),
  body('lignes.*.quantite').isInt({ min: 1 }),
  body('lignes.*.prix_unitaire').isFloat({ min: 0 }),
], validate, c.create);
router.patch('/:id/validate', authorize(ROLES.ADMIN, ROLES.MANAGER), c.validate);
router.delete('/:id', authorize(ROLES.ADMIN, ROLES.MANAGER), c.remove);

module.exports = router;
