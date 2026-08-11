const router = require('express').Router();
const { body } = require('express-validator');
const validate = require('../middlewares/validate');
const { protect, authorize } = require('../middlewares/auth');
const c = require('../controllers/user.controller');
const { ROLES } = require('../config/constants');

router.use(protect, authorize(ROLES.ADMIN));

router.get('/', c.list);
router.get('/:id', c.detail);
router.post('/', [
  body('nom').trim().notEmpty(), body('email').isEmail(),
  body('mot_de_passe').isLength({ min: 6 }), body('role').isIn(Object.values(ROLES)),
], validate, c.create);
router.put('/:id', [body('email').optional().isEmail(), body('role').optional().isIn(Object.values(ROLES))], validate, c.update);
router.patch('/:id/status', c.toggleStatus);
router.delete('/:id', c.remove);

module.exports = router;
