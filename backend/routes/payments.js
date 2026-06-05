const express = require('express');
const { createOrder, verifyPayment } = require('../controllers/paymentController');

const router = express.Router();

const { protect } = require('../middleware/auth');

router.post('/order', protect, createOrder);
router.post('/verify', protect, verifyPayment);

module.exports = router;
