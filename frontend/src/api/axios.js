import axios from "axios";

// Backend sab routes /api/* par mount karta hai (backend/src/app.js),
// isliye base URL me /api suffix zaroori hai.
const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "https://storeitnow-cloud-1.onrender.com/api",
  timeout: 20000,
});

export default api;
