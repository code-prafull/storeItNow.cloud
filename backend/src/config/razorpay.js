const Razorpay = require("razorpay");

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

// Masked debug helper
const mask = (s) => (s && s.length > 6 ? `${s.slice(0, 4)}...${s.slice(-2)}` : s || '<<missing>>');

if (!keyId || !keySecret) {
  console.error('Razorpay configuration missing. RAZORPAY_KEY_ID:', mask(keyId), 'RAZORPAY_KEY_SECRET:', mask(keySecret));
  throw new Error('Razorpay keys missing in environment. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET');
}

const razorpay = new Razorpay({
  key_id: keyId,
  key_secret: keySecret
});

module.exports = razorpay;
