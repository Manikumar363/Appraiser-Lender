

"use client"
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Building2, Loader2, XCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import DashboardLayout from "../../../components/dashboard-layout"
import { chatApi } from "@/lib/api/chat"
import {useAuth} from "../../../hooks/use-auth"
import { BuildingIcon } from "../../../components/icons"
import Image from 'next/image';

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
  }
  unreadCount: number
  jobId?: string
  status: "active" | "archived" | "closed"
  createdAt: string
}

// Mock data for development
const mockConversations: ChatConversation[] = [
  {
    id: "1",
    title: "Residential Appraisal",
    location: "Brampton, Canada",
    participants: [
      { id: "1", name: "James Ryan", role: "admin", avatar: "/images/chat-avatar.png" },
      { id: "2", name: "Joe Done", role: "lender", avatar: "/images/chat-avatar.png" },
      { id: "3", name: "Sarah Wilson", role: "appraiser", avatar: "/images/chat-avatar.png" },
      { id: "4", name: "Mike Johnson", role: "lender", avatar: "/images/chat-avatar.png" },
    ],
    lastMessage: {
      id: "msg1",
      senderId: "1",
      senderName: "James Ryan",
      content: "Thanks, hope you have a great day!",
      timestamp: "8:22 PM",
      isRead: false,
    },
    unreadCount: 2,
    jobId: "1",
    status: "active",
    createdAt: "2024-01-01T10:00:00Z",
  },
  {
    id: "2",
    title: "Residential Appraisal",
    location: "Brampton, Canada",
    participants: [
      { id: "1", name: "James Ryan", role: "admin", avatar: "/images/chat-avatar.png" },
      { id: "4", name: "Mike Johnson", role: "lender", avatar: "/images/chat-avatar.png" },
      { id: "5", name: "Lisa Chen", role: "appraiser", avatar: "/images/chat-avatar.png" },
    ],
    lastMessage: {
      id: "msg2",
      senderId: "4",
      senderName: "Mike Johnson",
      content: "The property inspection is scheduled for tomorrow at 2 PM.",
      timestamp: "7:45 PM",
      isRead: true,
    },
    unreadCount: 0,
    jobId: "2",
    status: "active",
    createdAt: "2024-01-01T09:00:00Z",
  },
  {
    id: "3",
    title: "Residential Appraisal",
    location: "Brampton, Canada",
    participants: [
      { id: "6", name: "David Brown", role: "admin", avatar: "/images/chat-avatar.png" },
      { id: "7", name: "Emma Davis", role: "lender", avatar: "/images/chat-avatar.png" },
      { id: "8", name: "Alex Thompson", role: "appraiser", avatar: "/images/chat-avatar.png" },
      { id: "9", name: "John Smith", role: "lender", avatar: "/images/chat-avatar.png" },
    ],
    lastMessage: {
      id: "msg3",
      senderId: "7",
      senderName: "Emma Davis",
      content: "Please review the updated property documents.",
      timestamp: "6:30 PM",
      isRead: true,
    },
    unreadCount: 0,
    jobId: "3",
    status: "active",
    createdAt: "2024-01-01T08:00:00Z",
  },
]

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

      // Try API call, fallback to mock data
      try {
        const response = await chatApi.getConversations(1, 20)
        setConversations(response.conversations)
      } catch (apiError) {
        // Fallback to mock data for preview
        console.log("Using mock data for preview")
        await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate API delay
        setConversations(mockConversations)
      }
    } catch (err: any) {
      console.error("Error fetching conversations:", err)
      setError(err.response?.data?.message || "Failed to load conversations")

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
    router.push(`/chat/${conversationId}`)
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
      <div className="p-6 bg-gray-50 min-h-screen">
        {/* Conversations List */}
        <div className="space-y-4 max-w-6xl mx-auto">
          {loading && (
            <div className="flex justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          )}

          {conversations.length === 0 && !loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No conversations found.</p>
            </div>
          ) : (
            conversations.map((conversation) => (
              <div
                key={conversation.id}
                className="bg-blue-800 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleConversationClick(conversation.id)}
              >
                <div className="flex items-center justify-between">
                  {/* Left Section - Job Info */}
                  <div className="flex items-center gap-4">
                    {/* Building Icon */}
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                      <BuildingIcon className="w-6 h-6 text-blue-700" />
                    </div>

                    {/* Job Details */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">{conversation.title}</h3>
                      <p className="text-blue-100 text-sm">{conversation.location}</p>
                    </div>
                  </div>

                  {/* Right Section - Single Avatar */}
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
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
