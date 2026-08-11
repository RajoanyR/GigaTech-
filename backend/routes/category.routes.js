const router = require('express').Router();
const { body } = require('express-validator');
const validate = require('../middlewares/validate');
const { protect, authorize } = require('../middlewares/auth');
const crudController = require('../controllers/crud.controller');
const { Category } = require('../models/generic.models');
const { ROLES } = require('../config/constants');

const c = crudController(Category, 'Categorie');
const rules = [
  body('nom').trim().notEmpty().withMessage('Nom requis').isLength({ max: 100 }),
  body('description').optional().trim().isLength({ max: 255 }),
];

router.use(protect);
router.get('/', c.list);
router.get('/:id', c.detail);
router.post('/', authorize(ROLES.ADMIN, ROLES.MANAGER), rules, validate, c.create);
router.put('/:id', authorize(ROLES.ADMIN, ROLES.MANAGER), rules, validate, c.update);
router.delete('/:id', authorize(ROLES.ADMIN), c.remove);

module.exports = router;
