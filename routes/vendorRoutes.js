const express = require('express');
const router = express.Router();
const vendor = require('../controllers/vendorController');
const authMiddleware = require('../middlewares/authMiddleware');

// Register a new vendor
router.post('/register', vendor.register_vendor);

// Login a vendor
router.post('/login', vendor.login_vendor);

// Update vendor's address
router.post('/address', authMiddleware, vendor.vendor_address);

// Logout a vendor
router.patch('/logout', authMiddleware, vendor.logout_vendor);

// Change vendor's password
router.post('/change-password', authMiddleware, vendor.changePassword);

// Forgot password for a vendor
router.post('/forget-password', vendor.forgetPassword);

// Reset password for a vendor
router.patch('/reset-password/:id/:token', vendor.resetPassword);

// Update vendor's location
router.post('/location', authMiddleware, vendor.vendor_location);

module.exports = router;
