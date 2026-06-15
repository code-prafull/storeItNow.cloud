import api from "./axios";

export const getProfile = async () => {

  const token = localStorage.getItem("token");

  const response = await api.get(
    "/users/profile",
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  return response.data;
};