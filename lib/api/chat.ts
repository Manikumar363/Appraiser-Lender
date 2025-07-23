import api from "./axios";

// 1. Get all messages for a chat
export const getMessages = async (chatId: string, page = 1, limit = 50) => {
  const res = await api.get(`/chats/get-messages/${chatId}?page=${page}&limit=${limit}`);
  return res.data;
};

// 2. Send a message in a chat
export const sendMessage = async (
  chatId: string,
  data: { jobId: string; senderId: string; content: string }
) => {
  const res = await api.post(`/chats/send-message/`, data);
  return res.data;
};



// 4. Get images (avatars) of users in a chat (POST)
export const getChatImages = async (jobId: string) => {
  const res = await api.post(`/chats/get-images/${jobId}`);
  
  return res.data;
};

// Optionally, group them under chatApi for easier import
export const chatApi = {
  getMessages,
  sendMessage,
  getChatImages, // <-- add here
};