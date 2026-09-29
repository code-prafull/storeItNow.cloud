import api from "./axios";

// Register User
export const registerUser = async (userData) => {
  const response = await api.post(
    "/auth/register",
    userData
  );

  return response.data;
};

// Login User
export const loginUser = async (userData) => {
  const response = await api.post(
    "/auth/login",
    userData
  );

  return response.data;
};

// Google Sign-In — credential = Google ID token (GIS callback se milta hai)
export const googleLogin = async (credential) => {
  const response = await api.post(
    "/auth/google",
    { credential }
  );

  return response.data;
};

// Verify OTP
export const verifyOtp = async (otpData) => {
  const response = await api.post(
    "/auth/verify-otp",
    otpData
  );

  return response.data;
};

// Resend OTP — verify page par "Resend code" button se
export const resendOtp = async (email) => {
  const response = await api.post(
    "/auth/resend-otp",
    { email }
  );

  return response.data;
};
