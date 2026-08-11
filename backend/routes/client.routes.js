const router = require('express').Router();
const { body } = require('express-validator');
const validate = require('../middlewares/validate');
const { protect, authorize } = require('../middlewares/auth');
const crudController = require('../controllers/crud.controller');
const { Client } = require('../models/generic.models');
const { ROLES } = require('../config/constants');

const c = crudController(Client, 'Client');
const rules = [
  body('nom').trim().notEmpty().withMessage('Nom requis'),
  body('telephone').trim().notEmpty().withMessage('Telephone requis'),
  body('email').optional({ values: 'falsy' }).isEmail().withMessage('Email invalide'),
  body('type_client').optional().isIn(['particulier', 'entreprise', 'revendeur']).withMessage('Type de client invalide'),
];

router.use(protect);
router.get('/', c.list);
router.get('/:id', c.detail);
router.post('/', authorize(ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER), rules, validate, c.create);
router.put('/:id', authorize(ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER), rules, validate, c.update);
router.delete('/:id', authorize(ROLES.ADMIN), c.remove);

module.exports = router;
