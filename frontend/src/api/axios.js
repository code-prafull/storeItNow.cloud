import axios from "axios";

const api = axios.create({
  baseURL: "https://storeitnow-cloud.onrender.com/api",
  timeout: 20000,
});

export default api;