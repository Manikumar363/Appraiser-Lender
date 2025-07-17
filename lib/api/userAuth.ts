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
    const response = await api.post("/lender/register", {
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
    const response = await api.post("/lender/login", { email, password });

    // const token = response.data.token;
    
    // store the token
    // localStorage.setItem("authToken", token);

    // delete role by checking email domain or endpoint pattern
    // if(email.includes("lender") || window.location.pathname.includes("/lender")){
      // localStorage.setItem("userRole", "lender");
    // }else{
      // localStorage.setItem("userRole", "appraiser");
    // }

    return response.data;
  },

  verifyRegisterOtp: async (email: string, otp: string) => {
  try {
    const response = await api.post("/lender/verify-Reg-Otp", { email, otp });
    return response.data;
  } catch (error: any) {
    console.error("verifyRegisterOtp error:", error.response?.data || error.message);
    throw error;
  }
},

  resendRegisterOtp: async (
    email: string
  ): Promise<{ success: boolean; message: string }> => {
    const response = await api.post("/lender/resend-otp", { email });
    return response.data;
  },

  forgotPassword: async (email: string): Promise<any> => {
  const res = await api.post("/lender/forgot-password", { email })
 },
 verifyOtp: async (email: string, otp: string)=>{
  return await api.post("/lender/verify-otp", {email, otp})
 },

 setNewPassword: async(userId: string, newPassword: string, confirmPassword: string)=>{
  const res= await api.put("/lender/reset-password",{
    userId,
    newPassword,
    confirmPassword
  })
  return res.data
 },

 resetPassword: async(
  oldPassword: string,
  newPassword: string,
 )=> {
  return await api.put("/lender/change-password", {
    oldPassword: oldPassword,
    newPassword: newPassword
  });
 },

 deleteAccount: async () => {
  return await api.delete("/lender/profile");
  },

};
