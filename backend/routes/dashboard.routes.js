const router = require('express').Router();
const { protect } = require('../middlewares/auth');
const c = require('../controllers/dashboard.controller');

router.get('/', protect, c.overview);
module.exports = router;
