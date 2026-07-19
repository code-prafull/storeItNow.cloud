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

// Verify OTP
export const verifyOtp = async (otpData) => {
  const response = await api.post(
    "/auth/verify-otp",
    otpData
  );

  return response.data;
};