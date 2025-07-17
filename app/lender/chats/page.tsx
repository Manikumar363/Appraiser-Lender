"use client"
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Loader2, XCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import DashboardLayout from "../../../components/dashboard-layout"
import { chatApi } from "@/lib/api/chat"
import { useAuth } from "../../../hooks/use-auth"
import { BuildingIcon } from "../../../components/icons"

interface ChatConversation {
  id: string
  title: string
  location: string
  participants: Array<{
    id: string
    name: string
    role: "admin" | "lender" | "appraiser"
    avatar: string
  }>
  lastMessage: {
    id: string
    senderId: string
    senderName: string
    content: string
    timestamp: string
    isRead: boolean
  } | null
  unreadCount: number
  jobId?: string
  status: "active" | "archived" | "closed"
  createdAt: string
}

export default function ChatPage() {
  const [conversations, setConversations] = useState<ChatConversation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()
  const { toast } = useToast()
  const { isAuthenticated, user } = useAuth()

  // Fetch conversations function
  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      try {
        const response = await chatApi.getMessages(1, 50)
        // Map backend response to ChatConversation[]
        const mapped = (response.conversations || response).map((conv: any) => ({
          id: conv.id,
          title: conv.title,
          location: conv.location,
          participants: (conv.participants || []).map((p: any) => ({
            id: p.id,
            name: p.name,
            role: p.role,
            avatar: p.avatar || "/placeholder.svg",
          })),
          lastMessage: conv.lastMessage
            ? {
                id: conv.lastMessage.id,
                senderId: conv.lastMessage.senderId,
                senderName: conv.lastMessage.senderName,
                content: conv.lastMessage.content,
                timestamp: conv.lastMessage.timestamp,
                isRead: conv.lastMessage.isRead,
              }
            : null,
          unreadCount: conv.unreadCount || 0,
          jobId: conv.jobId,
          status: conv.status,
          createdAt: conv.createdAt,
        }))
        setConversations(mapped)
      } catch (apiError) {
        setConversations([])
        toast({
          title: "Error",
          description: "Failed to load conversations. Please try again.",
          variant: "destructive",
        })
      }
    } catch (err: any) {
      setError("Failed to load conversations")
      toast({
        title: "Error",
        description: "Failed to load conversations. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchConversations()
  }, [fetchConversations])

  // Event handlers
  const handleConversationClick = (conversationId: string) => {
    router.push(`/lender/chats/${conversationId}`)
  }

  const handleRefresh = () => {
    fetchConversations()
  }

  // Loading state
  if (loading && conversations.length === 0) {
    return (
      <DashboardLayout role="lender">
        <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
          <div className="flex items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Loading conversations...</span>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // Error state
  if (error && conversations.length === 0) {
    return (
      <DashboardLayout role="lender">
        <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Error Loading Conversations</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={handleRefresh}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="lender">
      <div className="px-1 py-0">
        {/* Conversations List */}
        <div className="space-y-5 max-w-7xl mx-auto">
          {conversations.length === 0 && !loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No conversations found.</p>
            </div>
          ) : (
            conversations.map((conversation) => (
              <div
                key={conversation.id}
                className="bg-[#014F9D] rounded-2xl px-6 py-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleConversationClick(conversation.id)}
              >
                <div className="flex items-center justify-between">
                  {/* Left Section - Job Info */}
                  <div className="flex items-center gap-4">
                    {/* Building Icon */}
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                      <BuildingIcon className="w-6 h-6 text-[#014F9D]" />
                    </div>
                    {/* Job Details */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">{conversation.title}</h3>
                      <p className="text-blue-100 text-sm">{conversation.location}</p>
                    </div>
                  </div>
                  {/* Right Section - Avatars */}
                  <div className="flex -space-x-3">
                    {conversation.participants.map((p) => (
                      <img
                        key={p.id}
                        src={p.avatar || "/placeholder.svg"}
                        alt={p.name}
                        className="w-8 h-8 rounded-full border-2 border-white object-cover"
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}