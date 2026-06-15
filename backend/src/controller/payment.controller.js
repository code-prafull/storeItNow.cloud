const razorpay = require("../config/razorpay");
const crypto = require("crypto");
const User = require("../models/user.model");

// Create Order
const createOrder = async (req, res) => {
  try {

    const { plan } = req.body;

    console.log("BODY =>", req.body);
    console.log("KEY =>", process.env.RAZORPAY_KEY_ID);

    let amount = 0;

    // Plan price decide karo
    if (plan === "pro") {
      amount = 9900; // ₹99
    }

    else if (plan === "business") {
      amount = 29900; // ₹299
    }

    else {
      return res.status(400).json({
        success: false,
        message: "Invalid Plan"
      });
    }

    const options = {
      amount,
      currency: "INR",
      receipt: `receipt_${Date.now()}`
    };

    // Basic env checks
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error('Razorpay keys missing in environment');
      return res.status(500).json({
        success: false,
        message: 'Razorpay configuration missing on server (RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET)'
      });
    }

    // Ensure auth provided user (auth middleware should set req.user)
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    let order;
    try {
      order = await razorpay.orders.create(options);
    } catch (rpErr) {
      console.error('Razorpay create order error:', rpErr && rpErr.message ? rpErr.message : rpErr);
      return res.status(502).json({
        success: false,
        message: 'Failed to create order with Razorpay',
        error: rpErr && rpErr.message ? rpErr.message : String(rpErr)
      });
    }

    return res.status(200).json({ success: true, order });

  } catch (error) {

  console.log("========== PAYMENT ERROR ==========");
  console.log(error);

  return res.status(500).json({
    success: false,
    message: error.message
  });

}

};

const verifyPayment = async (req, res) => {
  try {

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      plan
    } = req.body;

    // Signature verify
    const generatedSignature =
      crypto
        .createHmac(
          "sha256",
          process.env.RAZORPAY_KEY_SECRET
        )
        .update(
          razorpay_order_id +
          "|" +
          razorpay_payment_id
        )
        .digest("hex");

    if (
      generatedSignature !==
      razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment Verification Failed"
      });
    }

    // Current User
    const user = await User.findById(
      req.user.id
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Update Plan
    if (plan === "pro") {

      user.plan = "pro";

      user.maxStorage =
        5 * 1024 * 1024 * 1024; // 5GB

    } else if (
      plan === "business"
    ) {

      user.plan = "business";

      user.maxStorage =
        50 * 1024 * 1024 * 1024; // 50GB

    }

    user.subscriptionStatus =
      "active";

    await user.save();

    return res.status(200).json({
      success: true,
      message:
        "Subscription Activated"
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }
};


module.exports = {
  createOrder,
  verifyPayment
};