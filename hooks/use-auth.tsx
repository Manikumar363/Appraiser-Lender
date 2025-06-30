"use client"

import { useState, useEffect, createContext, useContext, type ReactNode } from "react"

interface User {
  id: string
  email: string
  name: string
  role: "admin" | "lender" | "appraiser"
  avatar?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isLoading: boolean
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock user for development/preview
const mockUser: User = {
  id: "current_user",
  email: "user@example.com",
  name: "John Doe",
  role: "appraiser",
  avatar: "/placeholder.svg?height=32&width=32",
}

export const useAuth = () => {
  const context = useContext(AuthContext)

  // If no context (not wrapped in provider), return mock auth for development
  if (context === undefined) {
    return {
      user: mockUser,
      token: "mock_token",
      login: async (email: string, password: string) => {
        console.log("Mock login:", email)
      },
      logout: () => {
        console.log("Mock logout")
      },
      isLoading: false,
      isAuthenticated: true,
    }
  }

  return context
}

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing token on mount
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("authToken")
      const storedUser = localStorage.getItem("user")

      if (storedToken && storedUser) {
        try {
          setToken(storedToken)
          setUser(JSON.parse(storedUser))
        } catch (error) {
          console.error("Error parsing stored user data:", error)
          localStorage.removeItem("authToken")
          localStorage.removeItem("user")
        }
      } else {
        // Set mock user for development if no stored auth
        setUser(mockUser)
        setToken("mock_token")
      }
    }

    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      // For development, simulate successful login
      const mockResponse = {
        token: "mock_auth_token_" + Date.now(),
        user: {
          id: "user_" + Date.now(),
          email: email,
          name: email.split("@")[0],
          role: "appraiser" as const,
          avatar: "/placeholder.svg?height=32&width=32",
        },
      }

      // In production, replace with actual API call:
      // const response = await fetch("/api/auth/login", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify({ email, password }),
      // })
      //
      // if (!response.ok) {
      //   throw new Error("Login failed")
      // }
      //
      // const data = await response.json()

      // Store token and user data
      if (typeof window !== "undefined") {
        localStorage.setItem("authToken", mockResponse.token)
        localStorage.setItem("user", JSON.stringify(mockResponse.user))
      }

      setToken(mockResponse.token)
      setUser(mockResponse.user)
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("authToken")
      localStorage.removeItem("user")
    }
    setToken(null)
    setUser(null)
  }

  return {
    user,
    token,
    login,
    logout,
    isLoading,
    isAuthenticated: !!token && !!user,
  }
}

// Auth Provider Component
interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const auth = useAuthState()

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
}
