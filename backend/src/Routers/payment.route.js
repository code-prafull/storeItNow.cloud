const express = require("express");

const authMiddleware = require("../middleware/auth.middleware");

const {
  createOrder,
  verifyPayment
} = require("../controller/payment.controller");

const router = express.Router();

// Create Razorpay Order
router.post(
  "/create-order",
  authMiddleware,
  createOrder
);

// Verify Payment
router.post(
  "/verify-payment",
  authMiddleware,
  verifyPayment
);

module.exports = router;