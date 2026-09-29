const express = require("express");

const {
 register,
  login,
  testEmail,
  verifyOtp,
  resendOtp,
  forgotPassword,
  resetPassword,
  googleLogin
} = require("../controller/auth.controller");

const router = express.Router();

router.post("/register", register);

router.post("/login", login);

router.post("/google", googleLogin);

router.post("/test-email", testEmail);

router.post("/verify-otp", verifyOtp);

router.post("/resend-otp", resendOtp);

router.post(
  "/forgot-password",
  forgotPassword
);

router.post(
  "/reset-password",
  resetPassword
);

module.exports = router;