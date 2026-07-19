import api from "./axios";

export const uploadFile = async (file, folderId = null) => {

  const token = localStorage.getItem("token");

  const formData = new FormData();

  formData.append("file", file);
  if (folderId) formData.append("folderId", folderId);

  const response = await api.post(
    "/files/upload",
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data"
      }
    }
  );

  return response.data;
};

export const getMyFiles = async () => {

  const token = localStorage.getItem("token");

  const response = await api.get(
    "/files/my-files",
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  return response.data;
};

export const deleteFile = async (id) => {

  const token = localStorage.getItem("token");

  const response = await api.delete(
    `/files/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  return response.data;
};

export const searchFiles = async (query) => {

  const token = localStorage.getItem("token");

  const response = await api.get(
    `/files/search?query=${query}`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  return response.data;
};