import api from "./axios";

export interface Message {
  id: string;
  message: string;
  chatId: string;
  sender_data: {
    name: string;
    image: string;
    id?: string;
  };
  senderRole: string;
  approved: boolean;
  created_at: string;
}

export interface MessagesResponse {
  success: boolean;
  totalMessages: number;
  totalPages: number;
  currentPage: number;
  messages: Message[];
}

export interface SendMessagePayload {
  jobId: string;
  senderId: string;
  content: string;
}

// Updated to match actual API response structure
export interface SendMessageResponse {
  message: string;
  data: {
    id: string;
    message: string;
    chatId: string;
    sender_data: {
      name: string;
      image: string;
    };
    senderRole: string;
    approved: boolean;
    created_at: string;
  };
}

// Interface for chat images response
export interface ChatImagesResponse {
  chat: {
    jobId: string;
    created_at: string;
    lender: {
      image: string;
    };
    appraiser: {
      image: string;
    };
    admin: {
      image: string;
    };
  };
}

export const chatApi = {
  // Get messages for a specific job/chat
  getMessages: async (
    chatId: string, 
    page = 1, 
    limit = 50
  ): Promise<MessagesResponse> => {
    try {
      const res = await api.get(`/chats/get-messages/${chatId}`, {
        params: { page, limit }
      });
      return res.data;
    } catch (error) {
      console.error("Failed to fetch messages:", error);
      throw error;
    }
  },

  // Send a new message
  sendMessage: async (
    chatId: string,
    data: SendMessagePayload
  ): Promise<SendMessageResponse> => {
    try {
      const res = await api.post(`/chats/send-message`, data);
      return res.data; // Returns the full response with message and data
    } catch (error) {
      console.error("Failed to send message:", error);
      throw error;
    }
  },

  // Get chat participant images/info
  getChatImages: async (jobId: string): Promise<ChatImagesResponse> => {
    try {
      const res = await api.get(`/chats/get-images/${jobId}`);
      return res.data;
    } catch (error) {
      console.error("Failed to fetch chat images:", error);
      // Return fallback data if this endpoint fails
      return {
        chat: {
          jobId: jobId,
          created_at: new Date().toISOString(),
          lender: { image: "/placeholder.svg" },
          appraiser: { image: "/placeholder.svg" },
          admin: { image: "/placeholder.svg" }
        }
      };
    }
  },

  // Optional: Get all chats for a user (if your backend supports this)
  getUserChats: async (userId: string, page = 1, limit = 20) => {
    try {
      const res = await api.get(`/chats/user/${userId}`, {
        params: { page, limit }
      });
      return res.data;
    } catch (error) {
      console.error("Failed to fetch user chats:", error);
      throw error;
    }
  }
};
