import api from "./axios";

export const getFolders = async () => {

  const token = localStorage.getItem("token");

  const response = await api.get(
    "/folders",
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  return response.data;
};

export const createFolder = async (name) => {

  const token = localStorage.getItem("token");

  const response = await api.post(
    "/folders",
    { name },
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  return response.data;
};