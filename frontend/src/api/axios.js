import axios from "axios";

const api = axios.create({
  baseURL: "https://storeitnow-cloud.onrender.com",
});

export default api;
