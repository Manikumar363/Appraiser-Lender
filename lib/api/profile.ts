// lib/api/profile.ts
import api from "./axios"; // Adjust the import path as necessary

export const profileApi = {
  // Get profile
  getProfile: async () => {
    const res = await api.get("/user/profile");
    return res.data; // ✅ match your auth style: return full res.data
  },

  // Update profile
  updateProfile: async (data: {
    name?: string;
    email?: string;
    phone?: string;
    country_code?: string;
    company_name?: string;
    designation?: string;
    image?: string;
  }) => {
    const res = await api.patch("/user/profile", data);
    return res.data;
  },

  // Get lender profile
  getLenderProfile: async ()=>{
    const res= await api.get("/lender/profile");
    console.log("📤 API -> getLenderProfile returned:", res.data);    
    return res.data;
  },

  // Update lender profile
  updateLenderprofile: async(data: {
    name?: string;
    email?: string;
    phone?: string;
    country_code?: string;
    applicant?: string;
    image?: string;
  })=>{
    const res= await api.patch("/lender/profile", data);
    return res.data;
  },

  /*/ Delete lender profile
  deleteLenderProfile: async()=>{
    const res= await api.delete("/lender/profile");
    return res.data;
  } */
};
