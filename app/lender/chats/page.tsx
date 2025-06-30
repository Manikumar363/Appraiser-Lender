"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Building2, Search, MessageCircle, Users, Clock, Loader2, XCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import LenderDashboardLayout from "../components/lender-dashboard-layout"
import { chatApi } from "@/lib/api/chat"
 import {useAuth} from "../../../hooks/use-auth"

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
      { id: "1", name: "James Ryan", role: "admin", avatar: "/placeholder.svg?height=40&width=40" },
      { id: "2", name: "Joe Done", role: "lender", avatar: "/placeholder.svg?height=40&width=40" },
      { id: "3", name: "Sarah Wilson", role: "appraiser", avatar: "/placeholder.svg?height=40&width=40" },
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
      { id: "1", name: "James Ryan", role: "admin", avatar: "/placeholder.svg?height=40&width=40" },
      { id: "4", name: "Mike Johnson", role: "lender", avatar: "/placeholder.svg?height=40&width=40" },
      { id: "5", name: "Lisa Chen", role: "appraiser", avatar: "/placeholder.svg?height=40&width=40" },
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
    title: "Commercial Property Assessment",
    location: "Toronto, Canada",
    participants: [
      { id: "6", name: "David Brown", role: "admin", avatar: "/placeholder.svg?height=40&width=40" },
      { id: "7", name: "Emma Davis", role: "lender", avatar: "/placeholder.svg?height=40&width=40" },
      { id: "8", name: "Alex Thompson", role: "appraiser", avatar: "/placeholder.svg?height=40&width=40" },
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

const getRoleColor = (role: string) => {
  switch (role) {
    case "admin":
      return "text-green-600"
    case "lender":
      return "text-blue-600"
    case "appraiser":
      return "text-purple-600"
    default:
      return "text-gray-600"
  }
}

const getRoleBadgeColor = (role: string) => {
  switch (role) {
    case "admin":
      return "bg-green-100 text-green-800"
    case "lender":
      return "bg-blue-100 text-blue-800"
    case "appraiser":
      return "bg-purple-100 text-purple-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export default function ChatPage() {
  const [conversations, setConversations] = useState<ChatConversation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeFilter, setActiveFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalConversations, setTotalConversations] = useState(0)

  const router = useRouter()
  const { toast } = useToast()
  const { isAuthenticated, user } = useAuth()

  // Fetch conversations function
  const fetchConversations = useCallback(
    async (page = 1, search = "") => {
      // Skip authentication check for preview
      // if (!isAuthenticated) {
      //   router.push("/login")
      //   return
      // }

      try {
        setLoading(true)
        setError(null)

        const filters: any = {}

        // Add filter logic
        if (activeFilter !== "all") {
          if (activeFilter === "unread") {
            filters.unreadOnly = true
          } else if (activeFilter === "archived") {
            filters.status = "archived"
          }
        }

        if (search) {
          filters.search = search
        }

        // Try API call, fallback to mock data
        try {
          const response = await chatApi.getConversations(page, 20, filters)
          setConversations(response.conversations)
          setTotalConversations(response.total)
          setCurrentPage(response.page)
        } catch (apiError) {
          // Fallback to mock data for preview
          console.log("Using mock data for preview")
          await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate API delay
          setConversations(mockConversations)
          setTotalConversations(mockConversations.length)
          setCurrentPage(1)
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
    },
    [activeFilter, isAuthenticated, router, toast],
  )

  useEffect(() => {
    fetchConversations(1, searchTerm)
  }, [fetchConversations, searchTerm])

  // Event handlers
  const handleConversationClick = (conversationId: string) => {
    router.push(`/chat/${conversationId}`)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchConversations(1, searchTerm)
  }

  const handleRefresh = () => {
    fetchConversations(currentPage, searchTerm)
  }

  // Filter conversations
  const getFilteredConversations = () => {
    let filtered = conversations

    if (searchTerm) {
      filtered = filtered.filter(
        (conv) =>
          conv.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          conv.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
          conv.participants.some((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    return filtered // API already handles filtering
  }

  const filteredConversations = getFilteredConversations()
  const totalUnread = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0)

  // Redirect if not authenticated (commented out for preview)
  // if (!isAuthenticated) {
  //   return (
  //     <LenderDashboardLayout>
  //       <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
  //         <div className="text-center">
  //           <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
  //           <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
  //           <p className="text-gray-600 mb-4">Please log in to view conversations.</p>
  //           <Button onClick={() => router.push("/login")}>Go to Login</Button>
  //         </div>
  //       </div>
  //     </LenderDashboardLayout>
  //   )
  // }

  // Loading state
  if (loading && conversations.length === 0) {
    return (
      <LenderDashboardLayout>
        <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
          <div className="flex items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Loading conversations...</span>
          </div>
        </div>
      </LenderDashboardLayout>
    )
  }

  // Error state
  if (error && conversations.length === 0) {
    return (
      <LenderDashboardLayout>
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
      </LenderDashboardLayout>
    )
  }

  return (
    <LenderDashboardLayout>
      <div className="p-6 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Messages</h1>
          <p className="text-gray-600">Manage your conversations and communications</p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
            </Button>
          </div>
        </form>

        {/* Filter Tabs */}
        <div className="flex gap-4 mb-8">
          <Button
            className={`px-6 py-2 rounded-full ${
              activeFilter === "all"
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "border-gray-300 text-gray-600 hover:bg-gray-100 bg-transparent border"
            }`}
            onClick={() => setActiveFilter("all")}
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            All ({totalConversations})
          </Button>
          <Button
            className={`px-6 py-2 rounded-full ${
              activeFilter === "unread"
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "border-gray-300 text-gray-600 hover:bg-gray-100 bg-transparent border"
            }`}
            onClick={() => setActiveFilter("unread")}
          >
            Unread ({totalUnread})
          </Button>
          <Button
            className={`px-6 py-2 rounded-full ${
              activeFilter === "archived"
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "border-gray-300 text-gray-600 hover:bg-gray-100 bg-transparent border"
            }`}
            onClick={() => setActiveFilter("archived")}
          >
            Archived
          </Button>
        </div>

        {/* Conversations List */}
        <div className="space-y-4 mb-8">
          {loading && (
            <div className="flex justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          )}

          {filteredConversations.length === 0 && !loading ? (
            <div className="text-center py-8">
              <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No conversations found.</p>
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleConversationClick(conversation.id)}
              >
                <div className="flex items-center justify-between">
                  {/* Left Section - Conversation Info */}
                  <div className="flex items-center gap-4 flex-1">
                    {/* Building Icon */}
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-white" />
                    </div>

                    {/* Conversation Details */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900">{conversation.title}</h3>
                        {conversation.unreadCount > 0 && (
                          <Badge className="bg-red-500 text-white px-2 py-1 text-xs rounded-full">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm mb-2">{conversation.location}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span className="font-medium">{conversation.lastMessage.senderName}:</span>
                        <span className="truncate max-w-md">{conversation.lastMessage.content}</span>
                        <span className="text-xs">•</span>
                        <span className="text-xs">{conversation.lastMessage.timestamp}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Section - Participants */}
                  <div className="flex items-center gap-4">
                    {/* Participants Avatars */}
                    <div className="flex -space-x-2">
                      {conversation.participants.slice(0, 3).map((participant, index) => (
                        <div
                          key={participant.id}
                          className="relative"
                          title={`${participant.name} (${participant.role})`}
                        >
                          <img
                            src={participant.avatar || "/placeholder.svg"}
                            alt={participant.name}
                            className="w-8 h-8 rounded-full border-2 border-white"
                          />
                          <div
                            className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border border-white ${getRoleBadgeColor(participant.role)}`}
                          />
                        </div>
                      ))}
                      {conversation.participants.length > 3 && (
                        <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center">
                          <span className="text-xs text-gray-600">+{conversation.participants.length - 3}</span>
                        </div>
                      )}
                    </div>

                    {/* Participants Count */}
                    <div className="flex items-center gap-1 text-gray-500">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">{conversation.participants.length}</span>
                    </div>

                    {/* Time */}
                    <div className="flex items-center gap-1 text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">{conversation.lastMessage.timestamp}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalConversations > 20 && (
          <div className="flex justify-center gap-2 mb-8">
            <Button
              variant="outline"
              onClick={() => fetchConversations(currentPage - 1, searchTerm)}
              disabled={currentPage <= 1 || loading}
            >
              Previous
            </Button>
            <span className="flex items-center px-4">
              Page {currentPage} of {Math.ceil(totalConversations / 20)}
            </span>
            <Button
              variant="outline"
              onClick={() => fetchConversations(currentPage + 1, searchTerm)}
              disabled={currentPage >= Math.ceil(totalConversations / 20) || loading}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </LenderDashboardLayout>
  )
}
