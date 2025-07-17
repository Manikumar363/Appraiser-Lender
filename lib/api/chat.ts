import api from "./axios";

// 1. Get all messages for a chat
export const getMessages = async (chatId: string, page = 1, limit = 50) => {
  const res = await api.get(`/chats/get-messages/${chatId}?page=${page}&limit=${limit}`);
  return res.data;
};

// 2. Send a message in a chat
export const sendMessage = async (
  chatId: string,
  data: { content: string; type?: string }
) => {
  // Adjust endpoint as needed for your backend
  const res = await api.post(`/chats/send-message/${chatId}`, data);
  return res.data;
};

// 3. Get images (avatars) of users in a chat
export const getChatParticipants = async (chatId: string) => {
  // Adjust endpoint as needed for your backend
  const res = await api.get(`/chats/get-participants/${chatId}`);
  return res.data;
};

// Optionally, group them under chatApi for easier import
export const chatApi = {
  getMessages,
  sendMessage,
  getChatParticipants,
};