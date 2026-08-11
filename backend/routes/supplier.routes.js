const router = require('express').Router();
const { body } = require('express-validator');
const validate = require('../middlewares/validate');
const { protect, authorize } = require('../middlewares/auth');
const crudController = require('../controllers/crud.controller');
const { Supplier } = require('../models/generic.models');
const { ROLES } = require('../config/constants');

const c = crudController(Supplier, 'Fournisseur');
const rules = [
  body('nom').trim().notEmpty().withMessage('Nom requis'),
  body('telephone').trim().notEmpty().withMessage('Telephone requis'),
  body('email').optional({ values: 'falsy' }).isEmail().withMessage('Email invalide'),
  body('ville').optional().trim(),
  body('pays').optional().trim(),
];

router.use(protect);
router.get('/', c.list);
router.get('/:id', c.detail);
router.post('/', authorize(ROLES.ADMIN, ROLES.MANAGER), rules, validate, c.create);
router.put('/:id', authorize(ROLES.ADMIN, ROLES.MANAGER), rules, validate, c.update);
router.delete('/:id', authorize(ROLES.ADMIN), c.remove);

module.exports = router;
