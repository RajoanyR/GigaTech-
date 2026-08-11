const router = require('express').Router();
const { body } = require('express-validator');
const validate = require('../middlewares/validate');
const { protect, authorize } = require('../middlewares/auth');
const crudController = require('../controllers/crud.controller');
const { Employee } = require('../models/generic.models');
const { ROLES } = require('../config/constants');

const c = crudController(Employee, 'Employe');
const rules = [
  body('nom').trim().notEmpty().withMessage('Nom requis'),
  body('poste').trim().notEmpty().withMessage('Poste requis'),
  body('email').optional({ values: 'falsy' }).isEmail(),
  body('salaire').optional().isFloat({ min: 0 }).withMessage('Salaire invalide'),
];

router.use(protect);
router.get('/', c.list);
router.get('/:id', c.detail);
router.post('/', authorize(ROLES.ADMIN, ROLES.MANAGER), rules, validate, c.create);
router.put('/:id', authorize(ROLES.ADMIN, ROLES.MANAGER), rules, validate, c.update);
router.delete('/:id', authorize(ROLES.ADMIN), c.remove);

module.exports = router;
