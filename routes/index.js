const express = require('express');
const router = express.Router();

router.use('/user', require('./userRoutes'));
router.use('/admin', require('./categoryRoutes'));
router.use('/admin', require('./vendorRoutes'));

module.exports = router;