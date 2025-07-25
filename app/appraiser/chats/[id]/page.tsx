"use client";

import { useState, useEffect, useRef } from "react";
import DashboardLayout from "../../../../components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Paperclip, Send, Loader2, CheckCircle } from "lucide-react";
import { chatApi } from "@/lib/api/chat";
import { useAuth } from "../../../../hooks/use-auth";
import { useParams } from "next/navigation";
import { BuildingIcon } from "@/components/icons";
import { useToast } from "@/components/ui/use-toast";

export default function ChatDetailPage() {
  const [participants, setParticipants] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const { user } = useAuth();
  const { toast } = useToast();
  const params = useParams();
  const chatId = params?.id as string;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  console.log("🔍 Current user:", user);
  console.log("🔍 Chat ID:", chatId);

  useEffect(() => {
    const fetchChatData = async () => {
      console.log("📡 Fetching chat data for chatId:", chatId);
      setLoading(true);
      try {
        // Fetch messages
        const msgRes = await chatApi.getMessages(chatId, 1, 50);
        console.log("📨 Messages response:", msgRes);
        
        const mappedMessages = (msgRes.messages || []).map((msg: any) => {
          console.log("🔄 Mapping message:", msg);
          return {
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
          };
        });
        
        console.log("📋 Mapped messages:", mappedMessages);
        setMessages(mappedMessages);

        // Fetch chat images/participants
        const imgRes = await chatApi.getChatImages(chatId);
        console.log("🖼️ Chat images response:", imgRes);
        
        const chat = imgRes.chat || {};
        const participantsArr = [
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
        
        console.log("👥 Participants:", participantsArr);
        setParticipants(participantsArr);
      } catch (error) {
        console.error("❌ Error fetching chat data:", error);
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
    };

    if (chatId) {
      fetchChatData();
    }
  }, [chatId, toast]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) {
      console.log("⚠️ Cannot send message:", { newMessage: newMessage.trim(), user });
      return;
    }

    console.log("📤 Attempting to send message:", {
      chatId,
      userId: user.id,
      message: newMessage.trim(),
      userRole: user.role
    });

    setSending(true);
    try {
      const messagePayload = {
        jobId: chatId,
        senderId: user.id,
        content: newMessage.trim(),
      };
      
      console.log("📦 Message payload:", messagePayload);
      
      const response = await chatApi.sendMessage(chatId, messagePayload);
      console.log("✅ Send message response:", response);

      // Extract the message data from the response
      const messageData = response.data;
      console.log("📄 Message data:", messageData);

      // Create the new message object
      const newMessageObj = {
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

      console.log("🆕 New message object:", newMessageObj);

      // Add message to the list
      setMessages((prev) => {
        const updated = [...prev, newMessageObj];
        console.log("📝 Updated messages list:", updated);
        return updated;
      });
      
      setNewMessage("");
      console.log("✅ Message sent successfully");
      
    } catch (err) {
      console.error("❌ Failed to send message:", err);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
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
    <DashboardLayout role="appraiser">
      <div className="flex flex-col h-screen bg-white overflow-hidden relative">
        {/* Chat Header Card */}
        <div className="flex justify-center pt-4 pb-4 w-full">
          <div className="bg-[#014F9D] rounded-2xl px-8 py-4 flex items-center justify-between shadow w-full max-w-4xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                <BuildingIcon />
              </div>
              <div>
                <div className="text-white font-semibold text-base">
                  Residential Appraisal - #{chatId}
                </div>
                <div className="text-white text-xs opacity-80">
                  Brampton, Canada
                </div>
              </div>
            </div>
            <div className="flex -space-x-3">
              {participants.map((p) => (
                <img
                  key={p.id}
                  src={p.avatar}
                  alt={p.name}
                  className="w-8 h-8 rounded-full border-2 border-white object-cover"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 w-full flex flex-col items-center overflow-y-auto pb-20">
          <div className="max-w-4xl w-full mx-auto flex flex-col gap-6 px-4">
            {messages.map((message) => {
              // Determine if this is the current user's message
              const isCurrentUser = message.senderId === user?.id || 
                                    (user?.role === 'appraiser' && message.senderRole === 'appraiser') ||
                                    (user?.role === 'lender' && message.senderRole === 'lender');
              
              console.log("💬 Message render check:", {
                messageId: message.id,
                messageSenderId: message.senderId,
                messageSenderRole: message.senderRole,
                currentUserId: user?.id,
                currentUserRole: user?.role,
                isCurrentUser
              });

              return (
                <div
                  key={message.id}
                  className={`flex items-end ${
                    isCurrentUser ? "justify-end" : "justify-start"
                  }`}
                >
                  {!isCurrentUser && (
                    <img
                      src={message.avatar}
                      alt={message.senderName}
                      className="w-10 h-10 rounded-full object-cover mr-3"
                    />
                  )}
                  <div>
                    <div
                      className={`rounded-2xl px-5 py-3 flex flex-col shadow-sm ${
                        isCurrentUser ? "bg-[#014F9D] text-white" : "bg-[#E6F9F3]"
                      }`}
                      style={{ minWidth: 220, maxWidth: 400 }}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`font-bold text-base ${isCurrentUser ? "text-white" : ""}`}>
                          {message.senderName}
                        </span>
                        <span
                          className={`text-xs font-medium ${
                            isCurrentUser 
                              ? "text-blue-200"
                              : message.senderRole === "admin"
                              ? "text-blue-500"
                              : message.senderRole === "lender"
                              ? "text-green-500"
                              : "text-[#14B8A6]"
                          }`}
                        >
                          {message.senderRole?.charAt(0).toUpperCase() +
                            message.senderRole?.slice(1)}
                        </span>
                      </div>
                      <span className={`text-sm ${isCurrentUser ? "text-white" : ""}`}>
                        {message.content}
                      </span>
                    </div>
                    <div
                      className={`flex items-center gap-2 mt-1 ${
                        isCurrentUser ? "justify-end" : "justify-start"
                      }`}
                    >
                      <span className="text-xs text-gray-400">{message.timestamp}</span>
                      {isCurrentUser && <CheckCircle className="w-3 h-3 text-green-500" />}
                    </div>
                  </div>
                  {isCurrentUser && (
                    <img
                      src={message.avatar}
                      alt={message.senderName}
                      className="w-10 h-10 rounded-full object-cover ml-3"
                    />
                  )}
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Sticky Message Input Bar */}
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
                disabled={sending}
                className="flex-1 bg-[#E6F9F3] text-gray-900 placeholder:text-gray-500 rounded-full border-none focus:ring-0 py-3 px-3"
                style={{ outline: "none" }}
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
