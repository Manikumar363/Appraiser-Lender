// lib/api/axios.ts
import axios from "axios";

const api = axios.create({
  baseURL: process.env.BASE_URL,
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

    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("authToken")

     const currentPath= window.location.pathname

      const isLender = currentPath.includes("/lender")

       window.location.href = isLender
         ? "/lender/auth/signin"
         : "/appraiser/auth/signin"
      //  Redirect to login
       console.error("Unauthorized - redirecting to login")
      // window.location.href = "/appraiser/auth/signin" // Redirect to login 
      // console.error("Unauthorized - redirecting to login")
    }

    if (error.response?.status === 403) {
      // Forbidden - user doesn't have permission
      console.error("Access forbidden")
    }

    if (error.response?.status >= 500) {
      // Server error
      console.error("Server error:", error.response.data)
    }

    return Promise.reject(error)
  },
)

export default api



/*import axios from "axios"

// Create centralized Axios instance
const api = axios.create({
  baseURL: process.env.BASE_URL || "https://api.emadiappraisals.com/api/v1",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage or your preferred storage
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

    if (token) {
      console.log("🔐 Sending token:", token);
      config.headers.Authorization = `Bearer ${token}`;
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
        if (window.location.pathname !== "/appraiser/auth/signin") {
          window.location.href = "/appraiser/auth/signin";
        }
      } else if (error.response?.status === 403) {
        console.error("Access forbidden");
      } else if (error.response?.status >= 500) {
        console.error("Server error:", error.response.data);
      }
    }
    return Promise.reject(error);
  }
);

export default api; */
