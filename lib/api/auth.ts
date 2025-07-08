import api from "./axios"

export interface UpdatePasswordRequest {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}

export interface UpdatePasswordResponse {
  success: boolean
  message: string
}

export interface ApiResponse<T> {
  data: T
  message: string
  success: boolean
}

// Auth API functions
export const authApi = {
  // Update password
  updatePassword: async (passwordData: UpdatePasswordRequest): Promise<UpdatePasswordResponse> => {
    const response = await api.patch<ApiResponse<UpdatePasswordResponse>>("/api/auth/update-password", passwordData)
    return response.data.data
  },

  // Verify current password
  verifyPassword: async (password: string): Promise<{ valid: boolean }> => {
    const response = await api.post<ApiResponse<{ valid: boolean }>>("/api/auth/verify-password", { password })
    return response.data.data
  },

  // Change password (alternative endpoint)
  changePassword: async (oldPassword: string, newPassword: string): Promise<UpdatePasswordResponse> => {
    const response = await api.put<ApiResponse<UpdatePasswordResponse>>("/api/auth/change-password", {
      oldPassword,
      newPassword,
    })
    return response.data.data
  },

  //appraiser
  signIn: async (email: string, password: string): Promise<{ token: string }> => {
  const response = await api.post("/user/login", { email, password });
  return response.data;
},

  signUp: async (
  username: string,
  email: string,
  password: string,
  phone: string,
  country_code: string
) => {
  return await api.post("/user/register", {
    name: username,
    email,
    password,
    phone,
    country_code,
  });
},



  verifyRegisterOtp: async (email: string, otp: string) => {
    const res = await api.post("/user/verify-Reg-Otp", { email, otp });
    return res.data;
  },

  // ✅ Resend Register OTP
  resendRegisterOtp: async (email: string) => {
    const res = await api.post("/user/resend-otp", { email });
    return res.data;
  },

  // ✅ Forgot Password
  forgotPassword: async (email: string) => {
    const res = await api.post("/user/forgot-password", { email });
    return res.data;
  },

  // ✅ Reset Password
  resetPassword: async (email: string, otp: string, newPassword: string) => {
    const res = await api.post("/user/reset-password", {
      email,
      otp,
      newPassword,
    });
    return res.data;
  },
    
}
