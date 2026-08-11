const router = require('express').Router();
const { protect, authorize } = require('../middlewares/auth');
const upload = require('../middlewares/upload');
const c = require('../controllers/setting.controller');
const { ROLES } = require('../config/constants');

router.get('/', protect, c.get);
router.put('/', protect, authorize(ROLES.ADMIN), upload.single('logo'), c.update);
router.get('/backup', protect, authorize(ROLES.ADMIN), c.backup);

module.exports = router;
