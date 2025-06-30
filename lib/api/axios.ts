import axios from "axios"

// Create centralized Axios instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage or your preferred storage
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
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
      window.location.href = "/login"
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
