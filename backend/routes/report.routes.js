const router = require('express').Router();
const { protect, authorize } = require('../middlewares/auth');
const c = require('../controllers/report.controller');
const { ROLES } = require('../config/constants');

router.use(protect, authorize(ROLES.ADMIN, ROLES.MANAGER));
router.get('/sales', c.sales);
router.get('/purchases', c.purchases);
router.get('/export/excel', c.exportExcel);
router.get('/export/pdf', c.exportPdf);

module.exports = router;
