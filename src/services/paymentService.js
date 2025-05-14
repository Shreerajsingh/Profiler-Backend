const Razorpay = require("razorpay");
const crypto = require("crypto");
const paypal = require('paypal-rest-sdk');

const User = require('../models/user');
const UserRepository = require('../repositories/userRepository');
const userRepository = new UserRepository(User);

const serverConfig = require('../config/serverConfig');

const razorpayInstance = new Razorpay({
  key_id: serverConfig.RAZORPAY_KEY_ID,
  key_secret: serverConfig.RAZORPAY_KEY_SECRET,
});

const axios = require("axios");

async function convertCurrency(from, to, amount) {
  const API_KEY = '460adc3c27c019d7924d0a10';
  const url = `https://v6.exchangerate-api.com/v6/${API_KEY}/pair/${from}/${to}`;

  try {
    const response = await axios.get(url);
    const rate = response.data.conversion_rate;

    if (!rate) throw new Error("Invalid conversion rate received");
    return +(amount * rate);
  } catch (error) {
    console.error("Currency conversion failed:", error.message);
    throw new Error("Currency conversion failed");
  }
}



async function createOrder(data) {
  try {
    const { amount, currency, receipt } = data;
    const options = {
      amount: amount * 100,
      currency: currency || "INR",
      receipt: `receipt_${Date.now()}`,
    };
    console.log(55, options)
    const order = await razorpayInstance.orders.create(options);
    order.key = serverConfig.RAZORPAY_KEY_ID;
    return order;
  } catch (error) {
    return error;
  }
}

async function verifyOrder(data, razorpay_signature) {
  try {
    const { order_id, payment_id, userId, amount, currency } = data;
    console.log(order_id, payment_id, userId, amount, currency);
  
    const body = order_id + "|" + payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", serverConfig.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");
  
    const isAuthentic = expectedSignature === razorpay_signature;
    if (!isAuthentic) {
      return { message: "Invalid payment signature" };
    }
    
    const convertedAmount = await convertCurrency(currency, "USD", amount/100);
    console.log(2, convertedAmount);
  
    const user = await userRepository.addCreditsToUser(userId, convertedAmount);
    console.log(user);
    
    return {
      message: "Payment verified successfully",
      creditsAdded: convertedAmount,
      totalCredits: user.credits
    };
  } catch (error) {
    return error;
  }
}

// PayPal setup
paypal.configure({
  mode: "sandbox",
  client_id: serverConfig.PAYPAL_CLIENT_ID,
  client_secret: serverConfig.PAYPAL_CLIENT_SECRET,
});

async function createPaypalPayment(userId, amount, currency, description, baseUrl) {
  return new Promise(async (resolve, reject) => {
    let usdCredits = parseFloat(amount);
    if (currency !== 'USD') {
        usdCredits = await convertCurrency(currency, "USD", amount);
    }

    const paymentData = {
      intent: "sale",
      payer: { payment_method: "paypal" },
      redirect_urls: {
        return_url: `${baseUrl}/api/payment/paypal/success?userId=${userId}&amount=${usdCredits}`,
        cancel_url: `${baseUrl}/api/payment/paypal/cancel`,
      },
      transactions: [{
        amount: { total: amount, currency: currency },
        description: description,
      }],
    };

    paypal.payment.create(paymentData, async (error, payment) => {
      if (error) {
        return reject(error);
      }

      const approvalUrl = payment.links.find(link => link.rel === "approval_url");
      resolve({ approvalUrl: approvalUrl.href });
    });
  });
}


const stripe = require('stripe')(serverConfig.STRIPE_SECRET_KEY);

async function createStripePayment(userData, paymentDetails) {
  try {
    const customer = await stripe.customers.create({
      name: userData.username,
      email: userData.email,
      address: userData.address,
    });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: paymentDetails.amount*100,
      currency: paymentDetails.currency,
      description: paymentDetails.description,
      customer: customer.id,
      metadata: {
        purpose_code: 'P0806',
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });
    
    const convertedAmount = await convertCurrency(paymentDetails.currency, "USD", paymentDetails.amount);
    console.log(2, convertedAmount, "stripe");

    return {
      clientSecret: paymentIntent.client_secret,
      status: paymentIntent.status,
      amount: convertedAmount
    };
  } catch (error) {
    console.error("Stripe payment error:", error);
    throw new Error("Stripe payment failed");
  }
}


module.exports = {
  createOrder,
  verifyOrder,
  createPaypalPayment,
  createStripePayment,
};