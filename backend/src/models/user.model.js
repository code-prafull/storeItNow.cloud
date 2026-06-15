const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  password: {
    type: String,
    required: true
  },

  plan: {
    type: String,
    default: "free"
  },

  role: {
    type: String,
    default: "user"
  },

  isVerified: {
    type: Boolean,
    default: false
  },

  otp: {
    type: String,
    default: null
  },

  otpExpiry: {
    type: Date,
    default: null
  },

  storageUsed: {
    type: Number,
    default: 0
  },

  maxStorage: {
    type: Number,
    default: 50000000
  },
  subscriptionStatus: {
   type: String,
   default: "inactive"
},

subscriptionId: {
   type: String,
   default: null
}

}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);