const express = require('express');
const {
  register,
  sendOtp,
  verifyEmail,
  login,
  getMe,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');

const router = express.Router();

const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/send-otp', sendOtp);
router.post('/verify-email', verifyEmail);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;
