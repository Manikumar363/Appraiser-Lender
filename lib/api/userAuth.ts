// lib/api/userAuth.ts
import api from "./axios";

export interface SignupPayload {
  username: string;
  email: string;
  password: string;
  phone: string;
  country_code: string;
}

export const userAuth = {
  signUp: async ({
    username,
    email,
    password,
    phone,
    country_code,
  }: SignupPayload): Promise<{ message: string; userId?: string }> => {
    const response = await api.post("/user/register", {
      name: username,
      email,
      password,
      phone,
      country_code,
    });

    return response.data;
  },

  signIn: async (
    email: string,
    password: string
  ): Promise<{ token: string }> => {
    const response = await api.post("/user/login", { email, password });
    return response.data;
  },

  verifyRegisterOtp: async (email: string, otp: string) => {
  try {
    const response = await api.post("/user/verify-Reg-Otp", { email, otp });
    return response.data;
  } catch (error: any) {
    console.error("verifyRegisterOtp error:", error.response?.data || error.message);
    throw error;
  }
},

  resendRegisterOtp: async (
    email: string
  ): Promise<{ success: boolean; message: string }> => {
    const response = await api.post("/user/resend-otp", { email });
    return response.data;
  },

  forgotPassword: async (email: string): Promise<any> => {
  const res = await api.post("/user/forgot-password", { email })
  return res.data
 }

};
