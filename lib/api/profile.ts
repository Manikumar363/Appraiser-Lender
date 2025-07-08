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
};
