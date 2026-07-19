import api from "./axios";

export const createOrder =
async (plan) => {

  const token =
    localStorage.getItem("token");

  const response =
    await api.post(

      "/payment/create-order",

      { plan },

      {
        headers: {
          Authorization:
            `Bearer ${token}`
        }
      }

    );

  return response.data;
};

export const verifyPayment =
async (paymentData) => {

  const token =
    localStorage.getItem("token");

  const response =
    await api.post(

      "/payment/verify-payment",

      paymentData,

      {
        headers: {
          Authorization:
            `Bearer ${token}`
        }
      }

    );

  return response.data;
};