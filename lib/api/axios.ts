// lib/api/axios.ts
import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: attach token if exists
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("authToken");
      if (token) config.headers.Authorization = `${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== "undefined") {
      if (error.response?.status === 401) {
        localStorage.removeItem("authToken");
        const currentPath = window.location.pathname;
        const isLender = currentPath.includes("/lender");
         window.location.href = isLender
           ? "/lender/auth/signin"
           : "/appraiser/auth/signin";
        // Redirect to login
        console.error("Unauthorized - redirecting to login");
      } else if (error.response?.status === 403) {
        console.error("Access forbidden");
      } else if (error.response?.status >= 500) {
        console.error("Server error:", error.response.data);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
