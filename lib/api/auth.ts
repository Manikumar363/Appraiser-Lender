// lib/api/auth.ts
import api from "./axios";

export interface UpdatePasswordRequest {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UpdatePasswordResponse {
  success: boolean;
  message: string;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export const authApi = {
  updatePassword: async (data: {newPassword: string; confirmPassword: string }) => {
    const res = await api.patch("/user/change-password", data);
    return res.data;
  },

  verifyPassword: async (password: string): Promise<{ valid: boolean }> => {
    const response = await api.post<ApiResponse<{ valid: boolean }>>("/api/auth/verify-password", { password });
    return response.data.data;
  },

  changePassword: async (oldPassword: string, newPassword: string): Promise<UpdatePasswordResponse> => {
    const response = await api.put<ApiResponse<UpdatePasswordResponse>>("/api/auth/change-password", { oldPassword, newPassword });
    return response.data.data;
  },

  // Sign In
  signIn: async (email: string, password: string): Promise<{ token: string }> => {
    const response = await api.post("/user/login", { email, password });
    return response.data;
  },

  // Sign Up
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

  resendRegisterOtp: async (email: string) => {
    const res = await api.post("/user/resend-otp", { email });
    return res.data;
  },

  forgotPassword: async (email: string) => {
    return await api.post("/user/forgot-password", { email });
  },

  verifyOtp: async (email: string, otp: string) => {
    return await api.post("/user/verify-otp", { email, otp });
  },

  setNewPassword: async (userId: string, newPassword: string, confirmPassword: string) => {
    const res = await api.put("/user/reset-password", { userId, newPassword, confirmPassword });
    return res.data;
  },

  resetPassword: async (oldPassword: string, newPassword: string) => {
    return await api.put("/user/change-password", { oldPassword, newPassword });
  },

  deleteAccount: async () => {
    return await api.delete("/user/profile");
  },
};
