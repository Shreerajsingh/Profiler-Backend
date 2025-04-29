const express = require('express');
const { createOrder, verifyOrder, paypalCreateOrder, paypalPaymentCancel, paypalPaymentSuccess } = require('../controllers/paymentController');

const router = express.Router();

router.post('/razorpay/createPayment', createOrder);
router.post('/razorpay/verifyPayment', verifyOrder);

router.post('/stripe/createPayment', createOrder);
router.post('/stripe/verifyPayment', verifyOrder);

router.get('/paypal/createPayment', paypalCreateOrder);
router.get('/paypal/success', paypalPaymentSuccess);
router.get('/paypal/cancel', paypalPaymentCancel);

module.exports = router;