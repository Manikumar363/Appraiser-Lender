"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import DashboardLayout from "../../../../components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Paperclip, Send, Loader2, CheckCircle } from "lucide-react";
import { chatApi } from "@/lib/api/chat";
import { useParams } from "next/navigation";
import { BuildingIcon } from "@/components/icons";
import { useToast } from "@/components/ui/use-toast";
import { jwtDecode } from 'jwt-decode';

interface UIMessage {
  id: string;
  senderName: string;
  senderRole: string;
  senderId: string;
  content: string;
  timestamp: string;
  avatar: string;
}

interface Participant {
  id: string;
  name: string;
  avatar: string;
  role: string;
}

interface User {
  id: string;
  name: string;
  role: string;
  email?: string;
}

// Improved function to get user from token
const getUserFromToken = (): User | null => {
  try {
    const token = localStorage.getItem('token') || 
                  localStorage.getItem('authToken') || 
                  sessionStorage.getItem('token') ||
                  sessionStorage.getItem('authToken');
    
    if (!token) {
      console.warn('No token found in storage');
      return null;
    }

    const decoded: any = jwtDecode(token);
    console.log('🔍 Decoded token:', decoded);
    
    const user: User = {
      id: decoded.userId || decoded.id || decoded.sub || decoded.user_id,
      name: decoded.name || decoded.username || decoded.full_name || 'Unknown User',
      role: decoded.role || decoded.userRole || 'user',
      email: decoded.email
    };

    console.log('👤 Extracted user:', user);
    return user;
  } catch (error) {
    console.error('❌ Error decoding token:', error);
    return null;
  }
};

export default function ChatDetailPage() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const { toast } = useToast();
  const params = useParams();
  const jobId = params?.id as string;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentUser = getUserFromToken();
    setUser(currentUser);
    
    if (!currentUser) {
      toast({
        title: "Authentication Error",
        description: "Please log in again",
        variant: "destructive",
      });
    }
  }, [toast]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const fetchChatData = useCallback(async () => {
    if (!jobId) return;

    setLoading(true);
    try {
      const [msgRes, imgRes] = await Promise.all([
        chatApi.getMessages(jobId, 1, 50),
        chatApi.getChatImages(jobId)
      ]);

      const mappedMessages: UIMessage[] = (msgRes.messages || []).map((msg: any) => ({
        id: msg.id,
        senderName: msg.sender_data?.name || "Unknown User",
        senderRole: msg.senderRole,
        senderId: msg.sender_data?.id || "",
        content: msg.message,
        timestamp: new Date(msg.created_at).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        avatar: msg.sender_data?.image || "/placeholder.svg",
      }));

      setMessages(mappedMessages);

      const chat = imgRes.chat || {};
      const participantsArr: Participant[] = [
        {
          id: "lender",
          name: "Lender",
          avatar: chat.lender?.image || "/placeholder.svg",
          role: "lender",
        },
        {
          id: "appraiser", 
          name: "Appraiser",
          avatar: chat.appraiser?.image || "/placeholder.svg",
          role: "appraiser",
        },
        {
          id: "admin",
          name: "Admin", 
          avatar: chat.admin?.image || "/placeholder.svg",
          role: "admin",
        },
      ];

      setParticipants(participantsArr);
    } catch (error) {
      setMessages([]);
      setParticipants([]);
      toast({
        title: "Error",
        description: "Failed to load chat data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [jobId, toast]);

  useEffect(() => {
    fetchChatData();
  }, [fetchChatData]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !user || sending) {
      console.warn('Cannot send message:', { 
        hasMessage: !!newMessage.trim(), 
        hasUser: !!user, 
        sending 
      });
      return;
    }

    setSending(true);
    const messageContent = newMessage.trim();
    
    try {
      const messagePayload = {
        jobId: jobId,
        senderId: user.id, 
        content: messageContent,
      };

      console.log("📤 SENDING MESSAGE:", {
        jobId: messagePayload.jobId,
        senderId: messagePayload.senderId,
        content: messagePayload.content
      });

      const response = await chatApi.sendMessage(jobId, messagePayload);
      const messageData = response.data;

      const newMessageObj: UIMessage = {
        id: messageData.id,
        senderName: messageData.sender_data.name,
        senderRole: messageData.senderRole,
        senderId: user.id,
        content: messageData.message,
        timestamp: new Date(messageData.created_at).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        avatar: messageData.sender_data.image,
      };

      setMessages(prev => [...prev, newMessageObj]);
      setNewMessage("");
      
    } catch (err) {
      console.error('❌ Failed to send message:', err);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="appraiser">
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="lender">
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-yellow-100 p-2 text-xs">
          Debug: User ID = {user?.id || 'null'}, User Role = {user?.role || 'null'}
        </div>
      )}
      
      <div className="flex flex-col h-screen bg-white overflow-hidden relative">
        {/* Chat Header */}
        <div className="flex justify-center pt-4 pb-4 w-full">
          <div className="bg-[#014F9D] rounded-2xl px-8 py-4 flex items-center justify-between shadow w-full max-w-4xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                <BuildingIcon />
              </div>
              <div>
                <div className="text-white font-semibold text-base">
                  Residential Appraisal - #{jobId}
                </div>
                <div className="text-white text-xs opacity-80">
                  Brampton, Canada
                </div>
              </div>
            </div>
            <div className="flex -space-x-3">
              {participants.map((participant) => (
                <img
                  key={participant.id}
                  src={participant.avatar}
                  alt={participant.name}
                  className="w-8 h-8 rounded-full border-2 border-white object-cover"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 w-full flex flex-col items-center overflow-y-auto pb-20">
          <div className="max-w-4xl w-full mx-auto flex flex-col gap-6 px-4">
            {messages.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No messages yet. Start the conversation!
              </div>
            ) : (
              messages.map((message) => {
                // Simple logic: Lender on RIGHT, everyone else on LEFT
                const isLender = message.senderRole === 'lender';
                const isCurrentUserLender = user?.role === 'lender' && isLender;

                return (
                  <div
                    key={message.id}
                    className={`flex items-end ${
                      isLender ? "justify-end" : "justify-start"
                    }`}
                  >
                    {/* Avatar on left for non-lender messages */}
                    {!isLender && (
                      <img
                        src={message.avatar}
                        alt={message.senderName}
                        className="w-10 h-10 rounded-full object-cover mr-3"
                      />
                    )}
                    
                    <div>
                      {/* Message bubble with similar styling but slight differences */}
                      <div
                        className={`rounded-2xl px-5 py-3 flex flex-col shadow-sm ${
                          isLender
                            ? "bg-[#014F9D] text-white" // Lender: Blue
                            : "bg-[#E6F9F3] text-gray-900" // Others: Light green
                        }`}
                        style={{ minWidth: 220, maxWidth: 400 }}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`font-bold text-base ${
                            isLender ? "text-white" : "text-gray-900"
                          }`}>
                            {message.senderName}
                          </span>
                          <span
                            className={`text-xs font-medium ${
                              isLender
                                ? "text-blue-200"
                                : message.senderRole === "admin"
                                ? "text-blue-600"
                                : message.senderRole === "lender"
                                ? "text-green-600"
                                : "text-[#14B8A6]"
                            }`}
                          >
                            {message.senderRole?.charAt(0).toUpperCase() +
                              message.senderRole?.slice(1)}
                          </span>
                        </div>
                        <span className={`text-sm ${
                          isLender ? "text-white" : "text-gray-900"
                        }`}>
                          {message.content}
                        </span>
                      </div>
                      
                      {/* Timestamp */}
                      <div
                        className={`flex items-center gap-2 mt-1 ${
                          isLender ? "justify-end" : "justify-start"
                        }`}
                      >
                        <span className="text-xs text-gray-400">{message.timestamp}</span>
                        {isCurrentUserLender && <CheckCircle className="w-3 h-3 text-green-500" />}
                      </div>
                    </div>

                    {/* Avatar on right for lender messages */}
                    {isLender && (
                      <img
                        src={message.avatar}
                        alt={message.senderName}
                        className="w-10 h-10 rounded-full object-cover ml-3"
                      />
                    )}
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Message Input */}
        <div
          className="w-full flex items-center justify-center bg-[#014F9D]"
          style={{
            position: "fixed",
            left: "256px",
            right: 0,
            bottom: 0,
            zIndex: 10,
            height: "72px",
          }}
        >
          <div className="max-w-4xl w-full mx-auto flex items-center px-0">
            <form
              onSubmit={handleSendMessage}
              className="flex gap-3 w-full px-4 py-4"
            >
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-white hover:text-blue-200 p-1"
                tabIndex={-1}
              >
                <Paperclip className="w-5 h-5" />
              </Button>
              <input
                type="text"
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={sending}
                className="flex-1 bg-[#E6F9F3] text-gray-900 placeholder:text-gray-500 rounded-full border-none focus:ring-0 py-3 px-3"
                style={{ outline: "none" }}
                maxLength={1000}
              />
              <Button
                type="submit"
                disabled={!newMessage.trim() || sending}
                className="bg-white hover:bg-blue-100 text-[#014F9D] p-3 rounded-full shadow-none"
                style={{ minWidth: 48, minHeight: 48 }}
              >
                {sending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}