const express = require('express');
const router = express.Router();

router.use('/user', require('./userRoutes'));
router.use('/admin', require('./adminRoutes'));
router.use('/admin', require('./vendorRoutes'));

module.exports = router;