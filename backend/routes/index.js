const router = require('express').Router();

router.use('/auth', require('./auth.routes'));
router.use('/users', require('./user.routes'));
router.use('/dashboard', require('./dashboard.routes'));
router.use('/categories', require('./category.routes'));
router.use('/brands', require('./brand.routes'));
router.use('/suppliers', require('./supplier.routes'));
router.use('/clients', require('./client.routes'));
router.use('/employees', require('./employee.routes'));
router.use('/products', require('./product.routes'));
router.use('/stock', require('./stock.routes'));
router.use('/purchases', require('./purchase.routes'));
router.use('/sales', require('./sale.routes'));
router.use('/payments', require('./payment.routes'));
router.use('/reports', require('./report.routes'));
router.use('/settings', require('./setting.routes'));

module.exports = router;
