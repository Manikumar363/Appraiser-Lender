// app/appraiser/lib/property.ts
import api from "@/lib/api/axios";

export const propertyApi = {
  // Get all property types (for dropdown)
  getProperties: async () => {
    const res = await api.get("/property");
    return res.data;
  },

  // Get all quotations
  getQuotations: async () => {
    const res = await api.get("/user/quotation");
    return res.data;
  },

  // Create quotation
  createQuotation: async (data: {
    property_type: string;
    cost_of_appraiser: string;
    cost: string;
  }) => {
    const res = await api.post("/user/quotation", data);
    return res.data;
  },
};
