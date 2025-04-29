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
  const { amount, currency, receipt } = data;
  const options = {
    amount: amount * 100,
    currency: currency || "INR",
    receipt: `receipt_${Date.now()}`,
  };
  const order = await razorpayInstance.orders.create(options);
  order.key = serverConfig.RAZORPAY_KEY_ID;
  return order;
}

async function verifyOrder(data, razorpay_signature) {
  const { order_id, payment_id, userId, amountInINR } = data;
  console.log(order_id, payment_id, userId, amountInINR);

  const body = order_id + "|" + payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", serverConfig.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest("hex");

  const isAuthentic = expectedSignature === razorpay_signature;
  if (!isAuthentic) {
    return { message: "Invalid payment signature" };
  }
  
  const convertedAmount = await convertCurrency("INR", "USD", amountInINR);
  console.log(2, convertedAmount);

  const user = await userRepository.addCreditsToUser(userId, convertedAmount);
  console.log(user);
  
  return {
    message: "Payment verified successfully",
    creditsAdded: convertedAmount,
    totalCredits: user.credits
  };
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
        usdCredits = await convertCurrency(currency, "USD", amountInINR);
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

async function createStripePayment(userId, token, email, amount) {
  try {
    const customer = await stripe.customers.create({
      email,
      source: token,
      name: "John Doe",
      address: {
        line1: "123 Main St",
        postal_code: "12345",
        city: "Anytown",
        state: "California",
        country: "US",
      },
    });

    const charge = await stripe.charges.create({
      amount,
      currency: "usd",
      customer: customer.id,
      description: "Web Development Service",
    });

    const credits = amount / 100;
    const user = await userRepository.addCreditsToUser(userId, credits);

    return { 
      message: "Payment successful", 
      creditsAdded: credits, 
      totalCredits: user.credits 
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


/*
const razorpayInstance = new Razorpay({
  key_id: serverConfig.RAZORPAY_KEY_ID,
  key_secret: serverConfig.RAZORPAY_KEY_SECRET,
});

async function createOrder(data) {
  const { amount, currency, receipt, notes } = data;
  console.log(amount, currency, receipt, notes);

  const options = {
    amount: amount * 100,
    currency: currency || "INR",
    receipt: `receipt_${Date.now()}`,
  };

  const order = await razorpayInstance.orders.create(options);

  order.key = serverConfig.RAZORPAY_KEY_ID;

  return order;
}

async function verifyOrder(data, razorpay_signature) {
    const { order_id, payment_id, userId, amountInINR } = data;

    const body = order_id + "|" + payment_id;

    console.log(razorpay_signature, body);

    const expectedSignature = crypto
      .createHmac("sha256", serverConfig.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");


    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      return { message: "Invalid payment signature" };
    }

    let currencyConverter = new CurrencyConverter({ from: "INR", to: "USD", amount: amountInINR });
    const convertedAmount = await currencyConverter.convert();

    const user = await User.findById(userId);
    if (!user) return { message: "User not found" };

    user.credits += convertedAmount;
    await user.save();

    return {
      message: "Payment verified and credits updated",
      creditsAdded: convertedAmount,
      totalCredits: user.credits
    };
}

paypal.configure({
  mode: serverConfig.PAYPAL_MODE,
  client_id: serverConfig.PAYPAL_CLIENT_ID,
  client_secret: serverConfig.PAYPAL_CLIENT_SECRET
});

async function createPaypalPayment(amount, currency, description, baseUrl) {
  const response = new Promise((resolve, reject) => {
    const paymentData = {
      intent: "sale",
      payer: {
        payment_method: "paypal"
      },
      redirect_urls: {
        return_url: `${baseUrl}/api/payment/paypal/success`,
        cancel_url: `${baseUrl}/api/payment/paypal/cancel`
      },
      transactions: [{
        amount: { total: amount, currency: currency },
        description: description
      }]
    };

    paypal.payment.create(paymentData, (error, payment) => {
      if (error) {
        reject(error);
      } else {
      const approvalUrl = payment.links.find(link => link.rel === "approval_url");
        console.log("ApprovalURL ",approvalUrl);
        resolve(approvalUrl.href);
      }
    });
  });

  let usdCredits = parseFloat(amount);

    if (currency !== 'USD') {
      const currencyConverter = new CurrencyConverter({ from: currency, to: 'USD', amount });
      usdCredits = await currencyConverter.convert();
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).send({ message: "User not found" });

    user.credits += usdCredits;
    await user.save();

    return res.status(200).send({
      response,
      message: "Payment successful, credits updated",
      creditsAdded: usdCredits,
      totalCredits: user.credits
    });
};


const stripe = require('stripe')(serverConfig.STRIPE_SECRET_KEY);

async function createStripePayment(token, email, amount) {
    try {
      const customer = await stripe.customers.create({
      email,
      source: token,
      name: 'John Doe',
      address: {
        line1: '123 Main St',
        postal_code: '12345',
        city: 'Anytown',
        state: 'California',
        country: 'US',
      }
    });
  
    const charge = await stripe.charges.create({
      amount,
      currency: 'usd',
      customer: customer.id,
      description: 'Web Development Service'
    });
  
    const credits = amount / 100;
  
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");
  
    user.credits += credits;
    await user.save();
  
    return { message: "Payment successful", creditsAdded: credits, totalCredits: user.credits };
  }
  catch (error) {

  }
}

module.exports = {
  createOrder,
  verifyOrder,
  createPaypalPayment,
  createStripePayment
};
*/