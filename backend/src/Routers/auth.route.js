const express = require("express");

const {
 register,
  login,
  testEmail,
  verifyOtp,
  forgotPassword,
  resetPassword
} = require("../controller/auth.controller");

const router = express.Router();

router.post("/register", register);

router.post("/login", login);

router.post("/test-email", testEmail);

router.post("/verify-otp", verifyOtp);

router.post(
  "/forgot-password",
  forgotPassword
);

router.post(
  "/reset-password",
  resetPassword
);

module.exports = router;