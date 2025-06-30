import api from "./axios"

export interface ChatConversation {
  id: string
  title: string
  location: string
  participants: Array<{
    id: string
    name: string
    role: "admin" | "lender" | "appraiser"
    avatar: string
    isOnline?: boolean
  }>
  lastMessage: {
    id: string
    senderId: string
    senderName: string
    content: string
    timestamp: string
    isRead: boolean
  }
  unreadCount: number
  jobId?: string
  status: "active" | "archived" | "closed"
  createdAt: string
}

export interface Message {
  id: string
  senderId: string
  senderName: string
  senderRole: "admin" | "lender" | "appraiser"
  content: string
  timestamp: string
  isRead: boolean
  type: "text" | "file" | "image"
  fileUrl?: string
  fileName?: string
}

export interface ChatDetail extends ChatConversation {
  messages: Message[]
}

export interface ApiResponse<T> {
  data: T
  message: string
  success: boolean
}

export interface ConversationsResponse {
  conversations: ChatConversation[]
  total: number
  page: number
  limit: number
}

// API functions
export const chatApi = {
  // Fetch conversations
  getConversations: async (
    page = 1,
    limit = 20,
    filters?: {
      status?: string
      search?: string
      unreadOnly?: boolean
    },
  ): Promise<ConversationsResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters,
    })

    const response = await api.get<ApiResponse<ConversationsResponse>>(`/api/chat/conversations?${params}`)
    return response.data.data
  },

  // Get chat details with messages
  getChatDetails: async (chatId: string): Promise<ChatDetail> => {
    const response = await api.get<ApiResponse<ChatDetail>>(`/api/chat/${chatId}`)
    return response.data.data
  },

  // Send message
  sendMessage: async (
    chatId: string,
    messageData: {
      content: string
      type?: "text" | "file" | "image"
      fileUrl?: string
      fileName?: string
    },
  ): Promise<Message> => {
    const response = await api.post<ApiResponse<Message>>(`/api/chat/${chatId}/messages`, messageData)
    return response.data.data
  },

  // Mark messages as read
  markAsRead: async (chatId: string, messageIds: string[]): Promise<{ success: boolean }> => {
    const response = await api.patch<ApiResponse<{ success: boolean }>>(`/api/chat/${chatId}/read`, {
      messageIds,
    })
    return response.data.data
  },

  // Create new conversation
  createConversation: async (conversationData: {
    title: string
    participantIds: string[]
    jobId?: string
    initialMessage?: string
  }): Promise<ChatDetail> => {
    const response = await api.post<ApiResponse<ChatDetail>>("/api/chat/conversations", conversationData)
    return response.data.data
  },

  // Archive conversation
  archiveConversation: async (chatId: string): Promise<{ success: boolean }> => {
    const response = await api.patch<ApiResponse<{ success: boolean }>>(`/api/chat/${chatId}/archive`)
    return response.data.data
  },

  // Upload file
  uploadFile: async (chatId: string, file: File): Promise<{ fileUrl: string; fileName: string }> => {
    const formData = new FormData()
    formData.append("file", file)

    const response = await api.post<ApiResponse<{ fileUrl: string; fileName: string }>>(
      `/api/chat/${chatId}/upload`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    )
    return response.data.data
  },
}
