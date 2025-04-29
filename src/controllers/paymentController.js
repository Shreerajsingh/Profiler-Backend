const User = require('../models/user');
const UserRepository = require('../repositories/userRepository');
const userRepository = new UserRepository(User);
const paymentService = require('../services/paymentService');

async function createOrder(req, res) {
    try {
        const { amount, currency, receipt, notes } = req.body;

        const response = await paymentService.createOrder({ amount, currency, receipt, notes });
        console.log(response);

        return res.status(201).json(response);
    } catch (error) {
        return error;
    }
}

async function verifyOrder(req, res) {
    try {
        const { order_id, payment_id, userId, amountInINR, razorpay_signature } = req.body;

        const response = await paymentService.verifyOrder({ order_id, payment_id, userId, amountInINR }, razorpay_signature);
        
        return res.status(201).json(response);
    } catch (error) {
        return error;
    }
}

async function paypalCreateOrder(req, res) {
    try {
        const { userId, amount, currency, description } = req.query;
        const baseUrl = `${req.protocol}://${req.get('host')}`;

        console.log( amount, currency, description, baseUrl );
        const paymentUrl = await paymentService.createPaypalPayment(userId, amount, currency, description, baseUrl);
        console.log("PaymentUrl in controller layer", paymentUrl);
        res.redirect(paymentUrl.approvalUrl);
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, error: error.message });
    }
}

const paypalPaymentSuccess = async (req, res) => {
    const {userId, amount} = req.body;

    const user = await userRepository(userId, amount);

    console.log(4, req.body, user);
    res.send("Payment transferred successfully.");
};

const paypalPaymentCancel = (req, res) => {
    console.log(5, req);
    res.send("Payment canceled successfully.");
};

async function stripeCreateOrder(req, res) {
    try {
        const { userID, stripeToken, stripeEmail, amount } = req.body;
        const charge = await paymentService.createStripePayment(userId, stripeToken, stripeEmail, amount);
        res.send("Payment Successful");
      } catch (err) {
        console.error("Payment failed:", err);
        res.status(500).send("Payment Failed");
      }
}

module.exports = {
    createOrder, 
    verifyOrder,
    paypalCreateOrder,
    paypalPaymentCancel,
    paypalPaymentSuccess,
    stripeCreateOrder
}