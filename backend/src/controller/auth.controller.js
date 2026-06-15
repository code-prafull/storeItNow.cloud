const sendEmail = require("../utils/sendEmail");
const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

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

    await sendEmail(
      email,
      "StoreIt Email Verification",
      `Your OTP is ${otp}`
    );

    return res.status(201).json({
      success: true,
      message: "OTP sent successfully",
      email: user.email
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

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "7d",
      }
    );

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

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

    await sendEmail(
      req.body.email,
      "StoreIt Test",
      "Hello Prafull, email working hai 🚀"
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

    // OTP match nahi hua
    if (user.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP"
      });
    }

   
    // OTP expire ho gaya
    if (user.otpExpiry < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "OTP expired"
      });
    }

     console.log("DB OTP:", user.otp);
    console.log("User OTP:", otp);


    // User verify karo
    user.isVerified = true;

    // OTP remove kar do
    user.otp = null;
    user.otpExpiry = null;

    // Database me changes save karo
    await user.save();

    // JWT token generate karo
    const token = jwt.sign(
      {
        id: user._id
      },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "7d"
      }
    );

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

const forgotPassword = async (req, res) => {
  try {

    const { email } = req.body;

    const user = await User.findOne({
      email: email.trim().toLowerCase()
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Generate OTP
    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    // OTP expiry 10 min
    const otpExpiry = new Date(
      Date.now() + 10 * 60 * 1000
    );

    user.otp = otp;
    user.otpExpiry = otpExpiry;

    await user.save();

    // Send Email
    await sendEmail(
      email,
      "StoreIt Password Reset OTP",
      `Your password reset OTP is ${otp}`
    );

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully"
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

    const user = await User.findOne({
      email: email.trim().toLowerCase()
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // OTP check
    if (user.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP"
      });
    }

    // Expiry check
    if (user.otpExpiry < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "OTP expired"
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(
      newPassword,
      10
    );

    user.password = hashedPassword;

    // Clear OTP
    user.otp = null;
    user.otpExpiry = null;

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




module.exports = {
  register,
  login,
  testEmail,
  verifyOtp,
  forgotPassword,
  resetPassword
};