const express = require('express');
const { createOrder, verifyOrder, paypalCreateOrder, paypalPaymentCancel, paypalPaymentSuccess, stripeCreateOrder } = require('../controllers/paymentController');
const { authenticate } = require('../middlewares/auth-middleware');

const router = express.Router();

router.post('/razorpay/createPayment', createOrder);
router.post('/razorpay/verifyPayment', verifyOrder);

router.post('/stripe/createPayment', stripeCreateOrder);

router.get('/paypal/createPayment', paypalCreateOrder);
router.get('/paypal/success', paypalPaymentSuccess);
router.get('/paypal/cancel', paypalPaymentCancel);

module.exports = router;