const sendEmail = require("../utils/sendEmail");
const { otpEmailHtml, otpEmailText, otpSubject } = require("../utils/otpEmail");
const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { OAuth2Client } = require("google-auth-library");

// Accept both names so old deployments (JWT_SECRET) keep working
const JWT_SECRET =
  process.env.JWT_SECRET_KEY || process.env.JWT_SECRET;

// Gmail credentials na ho to OTP mail nahi ja sakta — local dev ke liye
// OTP console me print kar dete hain warna user verify hi nahi kar payega.
const emailConfigured = () =>
  Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS);

// OTP mail bhejo — branded HTML + text fallback dono
// purpose: "verify" (registration) | "reset" (forgot password)
const sendOtpEmail = async (email, otp, purpose = "verify") => {
  if (!emailConfigured()) {
    console.warn(
      `[DEV-FALLBACK] EMAIL_USER/EMAIL_PASS set nahi hai — OTP for ${email}: ${otp}`
    );
    return;
  }

  const opts = { code: otp, purpose, email, expiryMinutes: 10 };

  await sendEmail(
    email,
    otpSubject(purpose),
    otpEmailText(opts),
    otpEmailHtml(opts)
  );
};

const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// Deployed hai ya nahi — Render par NODE_ENV kabhi galat na rahe isliye
// RENDER flag bhi check karte hain.
const isDeployed = () =>
  process.env.NODE_ENV === "production" ||
  process.env.RENDER === "true" ||
  process.env.RENDER === "1";

// Email configured nahi hai aur app deployed nahi hai — tab OTP response me
// bhej dete hain, warna user verify page par hamesha atak jata hai.
// Deployed server par ye field KABHI nahi jaata (account-takeover risk).
const devOtpPayload = (otp) =>
  !emailConfigured() && !isDeployed()
    ? { devOtp: otp }
    : {};

// Deployed server par bina email ke OTP bhej hi nahi sakte — silent mat bano,
// seedha 503 do warna "OTP sent" bolkar user atak jata hai.
const requireEmailService = (res) => {
  if (emailConfigured()) return false;

  if (isDeployed()) {
    res.status(503).json({
      success: false,
      message:
        "Email service is not configured on the server (EMAIL_USER / EMAIL_PASS missing).",
    });
    return true;
  }

  return false;
};

// Naya OTP abhi bheja gaya tha? (60 sec cooldown, email bombing se bachne ke liye)
const inOtpCooldown = (user) =>
  Boolean(user.otpExpiry) &&
  user.otpExpiry.getTime() - Date.now() > 9 * 60 * 1000;

// Galat OTP ki counting — 5 baad code khud invalid ho jaata hai,
// warna 6-digit OTP 10 min me brute-force ho sakta hai.
const WRONG_OTP_LIMIT = 5;

const noteWrongOtp = async (user) => {
  user.otpAttempts = (user.otpAttempts || 0) + 1;

  if (user.otpAttempts >= WRONG_OTP_LIMIT) {
    user.otp = null;
    user.otpExpiry = null;
    user.otpAttempts = 0;
    await user.save();
    return "Too many wrong attempts — this code is no longer valid. Request a new one.";
  }

  await user.save();
  return "Invalid OTP";
};

// OTP flow khatam (verify/reset) — saaf kar do
const clearOtp = (user) => {
  user.otp = null;
  user.otpExpiry = null;
  user.otpAttempts = 0;
};

// Naya OTP issue karte waqt purani attempt-count hata do
const issueOtp = (user, otp) => {
  user.otp = otp;
  user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
  user.otpAttempts = 0;
};

const invalidEmail = (res) =>
  res.status(400).json({
    success: false,
    message: "A valid email is required",
  });

// Issue the exact same session the email/password flow issues
const issueToken = (res, user) => {
  const token = jwt.sign(
    { id: user._id },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return token;
};

// REGISTER
const register = async (req, res) => {
  try {
    let { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    email = email.trim().toLowerCase();

    // Deployed server par email configured nahi hai to register hi mat lo
    if (requireEmailService(res)) return;

    const existingUser = await User.findOne({ email });

    // Verified user dobara register nahi kar sakta
    if (existingUser && existingUser.isVerified) {
      return res.status(409).json({
        success: false,
        message: "This email is already registered — please log in instead.",
      });
    }

    // Unverified account (purana OTP miss/khatam) — naya OTP bhej do.
    // Warna "User already exists" aake user kabhi verify hi nahi kar pata.
    if (existingUser) {
      if (inOtpCooldown(existingUser)) {
        return res.status(429).json({
          success: false,
          message: "A code was just sent — wait a minute before requesting another.",
        });
      }

      const resentOtp = generateOtp();
      issueOtp(existingUser, resentOtp);
      await existingUser.save();

      try {
        await sendOtpEmail(email, resentOtp);
      } catch (emailErr) {
        console.error("Register email send failed:", emailErr && emailErr.message ? emailErr.message : emailErr);
        console.error(`[DEV-FALLBACK] OTP for ${email}: ${resentOtp}`);
      }

      return res.status(201).json({
        success: true,
        message: "Code sent — check your inbox (and spam).",
        email: existingUser.email,
        ...devOtpPayload(resentOtp),
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const otp = generateOtp();

    const otpExpiry = new Date(
      Date.now() + 10 * 60 * 1000
    );

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      isVerified: false,
      otp,
      otpExpiry,
    });

    try {
      await sendOtpEmail(email, otp);
    } catch (emailErr) {
      console.error("Register email send failed:", emailErr && emailErr.message ? emailErr.message : emailErr);
      console.error(`[DEV-FALLBACK] OTP for ${email}: ${otp}`);
      // don't fail registration if email fails
    }

    return res.status(201).json({
      success: true,
      message: "OTP sent successfully",
      email: user.email,
      ...devOtpPayload(otp),
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};


// LOGIN
const login = async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    email = email.trim().toLowerCase();

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = issueToken(res, user);

    return res.status(200).json({
  success: true,
  message: "Login successful",
  token,
  user: {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role
  },
});
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const testEmail = async (req, res) => {
  try {

    const to = req.body.email;

    await sendEmail(
      to,
      otpSubject("verify"),
      otpEmailText({ code: "123456", purpose: "verify", email: to }),
      otpEmailHtml({ code: "123456", purpose: "verify", email: to })
    );

    return res.status(200).json({
      success: true,
      message: "Email Sent"
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }
};


const verifyOtp = async (req, res) => {
  try {

    // Email aur OTP body se nikalo
    const { email, otp } = req.body;

    // Check karo dono values aayi hain ya nahi
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required"
      });
    }

    // Database me user dhundo
    const user = await User.findOne({
      email: email.trim().toLowerCase()
    });

    // User nahi mila
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // OTP match nahi hua — attempt count badhao (5 ke baad code khatam)
    if (user.otp !== otp) {
      const attemptMessage = await noteWrongOtp(user);

      return res.status(400).json({
        success: false,
        message: attemptMessage
      });
    }

    // OTP expire ho gaya
    if (user.otpExpiry < Date.now()) {
      clearOtp(user);
      await user.save();

      return res.status(400).json({
        success: false,
        message: "OTP expired — request a new code."
      });
    }

    // User verify karo
    user.isVerified = true;

    // OTP remove kar do
    clearOtp(user);

    // Database me changes save karo
    await user.save();

    // JWT token generate karo
    const token = issueToken(res, user);

    // Success response
return res.status(200).json({
  success: true,
  message: "Email verified successfully",
  token,
  user: {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role
  }
});

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

// RESEND OTP — verify page se dobara code bhejne ke liye
const resendOtp = async (req, res) => {
  try {

    const email = (req.body.email || "").trim().toLowerCase();

    if (!email) {
      return invalidEmail(res);
    }

    // Deployed server par email configured nahi hai to resend mat karo
    if (requireEmailService(res)) return;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email"
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified — just log in."
      });
    }

    if (inOtpCooldown(user)) {
      return res.status(429).json({
        success: false,
        message: "A code was just sent — wait a minute before requesting another."
      });
    }

    const otp = generateOtp();
    issueOtp(user, otp);
    await user.save();

    try {
      await sendOtpEmail(email, otp);
    } catch (emailErr) {
      console.error("Resend email failed:", emailErr && emailErr.message ? emailErr.message : emailErr);
      console.error(`[DEV-FALLBACK] OTP for ${email}: ${otp}`);
    }

    return res.status(200).json({
      success: true,
      message: "Code sent — check your inbox (and spam).",
      email: user.email,
      ...devOtpPayload(otp)
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }
};


const forgotPassword = async (req, res) => {
  try {

    const { email } = req.body;

    if (!email) {
      return invalidEmail(res);
    }

    // Deployed server par email configured nahi hai to reset hi mat shuru karo
    if (requireEmailService(res)) return;

    const user = await User.findOne({
      email: email.trim().toLowerCase()
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email"
      });
    }

    // Turant turant dobara mat bhejo (email bombing se bachne ke liye)
    if (inOtpCooldown(user)) {
      return res.status(429).json({
        success: false,
        message: "A code was just sent — wait a minute before requesting another."
      });
    }

    // Generate OTP + 10 min expiry
    const otp = generateOtp();
    issueOtp(user, otp);

    await user.save();

    try {
      await sendOtpEmail(email, otp, "reset");
    } catch (emailErr) {
      console.error("Forgot-password email send failed:", emailErr && emailErr.message ? emailErr.message : emailErr);
      console.error(`[DEV-FALLBACK] OTP for ${email}: ${otp}`);
      // continue — OTP saved, respond success
    }

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      email: user.email,
      ...devOtpPayload(otp)
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

const resetPassword = async (req, res) => {
  try {

    const {
      email,
      otp,
      newPassword
    } = req.body;

    // Missing fields pe pehle 500 aata tha (email.trim crash)
    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email, OTP and new password are required"
      });
    }

    if (String(newPassword).length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters"
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase()
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email"
      });
    }

    // OTP check (5 galat try ke baad code apne aap khatam)
    if (user.otp !== otp) {
      const attemptMessage = await noteWrongOtp(user);

      return res.status(400).json({
        success: false,
        message: attemptMessage
      });
    }

    // Expiry check
    if (user.otpExpiry < Date.now()) {
      clearOtp(user);
      await user.save();

      return res.status(400).json({
        success: false,
        message: "OTP expired — request a new code."
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(
      newPassword,
      10
    );

    user.password = hashedPassword;

    // OTP ne inka email prove kar diya — verified mark kar do
    user.isVerified = true;

    // Clear OTP
    clearOtp(user);

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successful"
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }
};




// GOOGLE SIGN-IN
// Frontend se aaya "credential" (Google ID token) yahan verify hota hai.
const googleLogin = async (req, res) => {
  try {

    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        success: false,
        message: "Google credential is required"
      });
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;

    if (!clientId) {
      return res.status(503).json({
        success: false,
        message: "Google login is not configured on this server (GOOGLE_CLIENT_ID missing)"
      });
    }

    const client = new OAuth2Client(clientId);

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: clientId
    });

    const payload = ticket.getPayload();

    if (!payload || !payload.email || payload.email_verified === false) {
      return res.status(401).json({
        success: false,
        message: "Google account email could not be verified"
      });
    }

    const email = payload.email.trim().toLowerCase();

    let user = await User.findOne({ email });

    if (!user) {
      // Naya user — random password taaki "forgot password" se koi
      // already-linked account overwrite na kare.
      const randomPassword = await bcrypt.hash(
        crypto.randomBytes(32).toString("hex"),
        10
      );

      user = await User.create({
        name: payload.name || email.split("@")[0],
        email,
        password: randomPassword,
        isVerified: true,
        provider: "google",
        googleId: payload.sub,
        avatar: payload.picture || null
      });
    } else {
      // Pehle se email/password wala account — Google se link kar do
      if (!user.googleId) user.googleId = payload.sub;
      if (!user.isVerified) user.isVerified = true;
      if (!user.avatar && payload.picture) user.avatar = payload.picture;
      await user.save();
    }

    const token = issueToken(res, user);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {

    console.log("Google login failed:", error && error.message ? error.message : error);

    return res.status(401).json({
      success: false,
      message: "Google sign-in failed. Please try again."
    });

  }
};




module.exports = {
  register,
  login,
  testEmail,
  verifyOtp,
  resendOtp,
  forgotPassword,
  resetPassword,
  googleLogin
};