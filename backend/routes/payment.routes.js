const router = require('express').Router();
const { body } = require('express-validator');
const validate = require('../middlewares/validate');
const { protect, authorize } = require('../middlewares/auth');
const crudController = require('../controllers/crud.controller');
const { Payment } = require('../models/generic.models');
const { ROLES, PAYMENT_METHODS } = require('../config/constants');

const c = crudController(Payment, 'Paiement');
const rules = [
  body('vente_id').isInt({ min: 1 }).withMessage('Vente requise'),
  body('montant').isFloat({ min: 0 }).withMessage('Montant invalide'),
  body('mode').isIn(PAYMENT_METHODS).withMessage('Mode de paiement invalide'),
];

router.use(protect);
router.get('/', c.list);
router.get('/:id', c.detail);
router.post('/', authorize(ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER), rules, validate, c.create);
router.put('/:id', authorize(ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER), rules, validate, c.update);
router.delete('/:id', authorize(ROLES.ADMIN), c.remove);

module.exports = router;
