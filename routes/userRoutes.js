const express = require('express');
const router = express.Router();
const user = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');


router.post('/register', user.register_user);

router.post('/login', user.login_user);

router.post('/address', authMiddleware, user.user_address);

router.patch('/logout',authMiddleware, user.logout_user);

router.post('/change-password', authMiddleware, user.changePassword);


router.post('/forget-password', user.forgetPassword);

router.patch('/reset-password/:id/:token', user.resetPassword);

router.post('/location', authMiddleware, user.user_location);


router.get('/nearby_vendors', authMiddleware, user.getNearbyVendors);



module.exports = router;