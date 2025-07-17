import api from "./axios";

export const contentApi = {
  async getAll() {
    const res = await api.get("/content");
    return res.data;
  },
  async getPrivacyPolicyLender() {
    const res = await api.get("/content");
    return res.data;
  },
  async updatePrivacyPolicyLender(body: { title: string; content: string }) {
    const res = await api.post("/content", body);
    return res.data;
  },
};