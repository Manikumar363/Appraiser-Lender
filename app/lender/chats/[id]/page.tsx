"use client"

import type React from "react"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import { Building2, Paperclip, Send, ArrowLeft, Loader2, Check, X, Clock, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import DashboardLayout from "../../../../components/dashboard-layout"
import { chatApi } from "@/lib/api/chat"
import {useAuth} from "../../../../hooks/use-auth"

interface Message {
  id: string
  senderId: string
  senderName: string
  senderRole: "admin" | "lender" | "appraiser"
  content: string
  timestamp: string
  isRead: boolean
  status: "sent" | "pending_approval" | "approved" | "rejected"
  approvedBy?: string
  createdAt: string
}

interface ChatParticipant {
  id: string
  name: string
  role: "admin" | "lender" | "appraiser"
  avatar: string
  isOnline?: boolean
}

interface ChatDetail {
  id: string
  title: string
  location: string
  participants: ChatParticipant[]
  messages: Message[]
  jobId?: string
  status: "active" | "archived" | "closed"
}

// Mock data for development
const mockChatDetail: ChatDetail = {
  id: "1",
  title: "Residential Appraisal",
  location: "Brampton, Canada",
  participants: [
    {
      id: "admin_1",
      name: "James Ryan",
      role: "admin",
      avatar: "/placeholder.svg?height=40&width=40",
      isOnline: true,
    },
    {
      id: "lender_1",
      name: "Joe Done",
      role: "lender",
      avatar: "/placeholder.svg?height=40&width=40",
      isOnline: true,
    },
    {
      id: "appraiser_1",
      name: "Sarah Wilson",
      role: "appraiser",
      avatar: "/placeholder.svg?height=40&width=40",
      isOnline: false,
    },
  ],
  messages: [
    {
      id: "msg_1",
      senderId: "admin_1",
      senderName: "James Ryan",
      senderRole: "admin",
      content: "Thanks, hope you have a great day!",
      timestamp: "8:22 PM",
      isRead: true,
      status: "approved",
      createdAt: "2024-01-01T20:22:00Z",
    },
    {
      id: "msg_2",
      senderId: "lender_1",
      senderName: "Joe Done",
      senderRole: "lender",
      content: "Thanks, hope you have a great day!",
      timestamp: "8:22 PM",
      isRead: true,
      status: "approved",
      approvedBy: "admin_1",
      createdAt: "2024-01-01T20:22:00Z",
    },
    {
      id: "msg_3",
      senderId: "appraiser_1",
      senderName: "Sarah Wilson",
      senderRole: "appraiser",
      content: "Thanks, hope you have a great day!",
      timestamp: "8:22 PM",
      isRead: true,
      status: "approved",
      approvedBy: "admin_1",
      createdAt: "2024-01-01T20:22:00Z",
    },
  ],
  jobId: "1",
  status: "active",
}

export default function ChatDetailPage() {
  const [chatDetail, setChatDetail] = useState<ChatDetail | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const { isAuthenticated, user } = useAuth()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const chatId = params?.id as string

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Fetch chat details
  const fetchChatDetail = useCallback(async () => {
    if (!chatId) return

    try {
      setLoading(true)
      setError(null)

      // Try API call, fallback to mock data
      try {
        const response = await chatApi.getChatDetails(chatId)
        setChatDetail(response)
        setMessages(response.messages)
      } catch (apiError) {
        // Fallback to mock data for preview
        console.log("Using mock data for preview")
        await new Promise((resolve) => setTimeout(resolve, 500))
        setChatDetail(mockChatDetail)
        setMessages(mockChatDetail.messages)
      }
    } catch (err: any) {
      console.error("Error fetching chat details:", err)
      setError(err.response?.data?.message || "Failed to load chat")

      toast({
        title: "Error",
        description: "Failed to load chat details.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [chatId, toast])

  // Send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newMessage.trim() || !user || !chatDetail) return

    try {
      setSending(true)

      const messageData = {
        content: newMessage.trim(),
        type: "text" as const,
      }

      // Determine message status based on user role
      let messageStatus: Message["status"] = "sent"
      if (user.role === "lender" || user.role === "appraiser") {
        messageStatus = "pending_approval"
      }

      // Create optimistic message
      const optimisticMessage: Message = {
        id: `temp_${Date.now()}`,
        senderId: user.id,
        senderName: user.name,
        senderRole: user.role,
        content: newMessage.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isRead: false,
        status: messageStatus,
        createdAt: new Date().toISOString(),
      }

      // Add message optimistically
      setMessages((prev) => [...prev, optimisticMessage])
      setNewMessage("")

      try {
        // Try API call
        const response = await chatApi.sendMessage(chatId, messageData)

        // Replace optimistic message with real one
        setMessages((prev) => prev.map((msg) => (msg.id === optimisticMessage.id ? response : msg)))
      } catch (apiError) {
        // For preview, just keep the optimistic message
        console.log("Message sent (preview mode)")
      }

      if (messageStatus === "pending_approval") {
        toast({
          title: "Message Sent",
          description: "Your message is pending admin approval.",
          variant: "default",
        })
      }
    } catch (err: any) {
      console.error("Error sending message:", err)

      // Remove optimistic message on error
      setMessages((prev) => prev.filter((msg) => msg.id !== `temp_${Date.now()}`))

      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSending(false)
    }
  }

  // Approve message (admin only)
  const handleApproveMessage = async (messageId: string) => {
    if (user?.role !== "admin") return

    try {
      // Update message status optimistically
      setMessages((prev) =>
        prev.map((msg) => (msg.id === messageId ? { ...msg, status: "approved" as const, approvedBy: user.id } : msg)),
      )

      toast({
        title: "Message Approved",
        description: "The message has been approved and is now visible to all participants.",
        variant: "default",
      })
    } catch (err: any) {
      console.error("Error approving message:", err)
      toast({
        title: "Error",
        description: "Failed to approve message.",
        variant: "destructive",
      })
    }
  }

  // Reject message (admin only)
  const handleRejectMessage = async (messageId: string) => {
    if (user?.role !== "admin") return

    try {
      // Update message status optimistically
      setMessages((prev) =>
        prev.map((msg) => (msg.id === messageId ? { ...msg, status: "rejected" as const, approvedBy: user.id } : msg)),
      )

      toast({
        title: "Message Rejected",
        description: "The message has been rejected.",
        variant: "default",
      })
    } catch (err: any) {
      console.error("Error rejecting message:", err)
      toast({
        title: "Error",
        description: "Failed to reject message.",
        variant: "destructive",
      })
    }
  }

  // Filter messages based on user role and approval status
  const getVisibleMessages = () => {
    if (!user) return []

    return messages.filter((message) => {
      // Admin sees all messages
      if (user.role === "admin") return true

      // Users see their own messages regardless of status
      if (message.senderId === user.id) return true

      // Users only see approved messages from others
      return message.status === "approved"
    })
  }

  // Get role color
  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "text-green-500"
      case "lender":
        return "text-green-500"
      case "appraiser":
        return "text-green-500"
      default:
        return "text-gray-500"
    }
  }

  // Get role display name
  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "admin":
        return "Admin"
      case "lender":
        return "Lender"
      case "appraiser":
        return "Appraiser"
      default:
        return role
    }
  }

  useEffect(() => {
    fetchChatDetail()
  }, [fetchChatDetail])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Redirect if not authenticated
  if (!isAuthenticated) {
    router.push("/login")
    return null
  }

  // Loading state
  if (loading) {
    return (
      <DashboardLayout role="lender">
        <div className="flex items-center justify-center h-screen">
          <div className="flex items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Loading chat...</span>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // Error state
  if (error || !chatDetail) {
    return (
      <DashboardLayout role="lender">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error || "Chat not found"}</p>
            <Button onClick={() => router.push("/chat")}>Back to Chats</Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const visibleMessages = getVisibleMessages()

  return (
    <DashboardLayout role="lender">
      <div className="flex flex-col h-screen bg-gray-50">
        {/* Chat Header */}
        <div className="bg-blue-600 rounded-2xl mx-6 mt-6 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/chat")}
                className="text-white hover:bg-blue-700 p-2"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>

              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>

              <div>
                <h1 className="text-lg font-semibold text-white">{chatDetail.title}</h1>
                <p className="text-blue-100 text-sm">{chatDetail.location}</p>
              </div>
            </div>

            {/* Participants Avatars */}
            <div className="flex">
              <div className="relative" title="Team Members">
                <img
                  src="/images/team-avatars.png"
                  alt="Team Members"
                  className="border-2 border-white object-cover rounded-full opacity-100"
                  style={{
                    width: "80px",
                    height: "40px",
                    transform: "rotate(0deg)",
                    opacity: 1,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {visibleMessages.map((message) => {
            const isCurrentUser = message.senderId === user?.id
            const needsApproval = message.status === "pending_approval"
            const isRejected = message.status === "rejected"

            return (
              <div key={message.id} className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                <div
                  className={`flex items-start gap-3 max-w-[70%] ${isCurrentUser ? "flex-row-reverse" : "flex-row"}`}
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <img
                      src={
                        chatDetail.participants.find((p) => p.id === message.senderId)?.avatar ||
                        "/placeholder.svg?height=40&width=40" ||
                        "/placeholder.svg"
                      }
                      alt={message.senderName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    {message.status === "pending_approval" && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
                        <Clock className="w-2 h-2 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Message Content */}
                  <div className={`${isCurrentUser ? "text-right" : "text-left"}`}>
                    {/* Sender Info */}
                    <div className={`flex items-center gap-2 mb-1 ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                      <span className="font-medium text-gray-900 text-sm">{message.senderName}</span>
                      <span className={`text-xs font-medium ${getRoleColor(message.senderRole)}`}>
                        {getRoleDisplayName(message.senderRole)}
                      </span>
                    </div>

                    {/* Message Bubble */}
                    <div
                      className={`rounded-2xl px-4 py-3 ${
                        isCurrentUser ? "bg-blue-600 text-white" : "bg-white text-gray-900 border border-gray-200"
                      } ${needsApproval ? "opacity-70" : ""} ${isRejected ? "opacity-50 line-through" : ""}`}
                    >
                      <p className="text-sm">{message.content}</p>
                    </div>

                    {/* Message Footer */}
                    <div className={`flex items-center gap-2 mt-1 ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                      <span className="text-xs text-gray-500">{message.timestamp}</span>

                      {/* Message Status Icons */}
                      {message.status === "approved" && <CheckCircle className="w-3 h-3 text-green-500" />}
                      {message.status === "pending_approval" && <Clock className="w-3 h-3 text-orange-500" />}
                      {message.status === "rejected" && <X className="w-3 h-3 text-red-500" />}
                    </div>

                    {/* Admin Approval Buttons */}
                    {user?.role === "admin" && needsApproval && !isCurrentUser && (
                      <div className="flex gap-2 mt-2">
                        <Button
                          size="sm"
                          onClick={() => handleApproveMessage(message.id)}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 text-xs"
                        >
                          <Check className="w-3 h-3 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRejectMessage(message.id)}
                          className="border-red-200 text-red-600 hover:bg-red-50 px-3 py-1 text-xs"
                        >
                          <X className="w-3 h-3 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="p-6">
          <form onSubmit={handleSendMessage} className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Input
                type="text"
                placeholder="Placeholder text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                disabled={sending}
                className="w-full pl-12 pr-4 py-3 rounded-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
              >
                <Paperclip className="w-4 h-4" />
              </Button>
            </div>

            <Button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full"
            >
              {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </Button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  )
}
