"use client";

import { useState, useEffect, useRef } from "react";
import DashboardLayout from "../../../../components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Paperclip, Send, Loader2, CheckCircle } from "lucide-react";
import { chatApi } from "@/lib/api/chat";
import { useAuth } from "../../../../hooks/use-auth";
import { useParams } from "next/navigation";
import { BuildingIcon } from "@/components/icons";

export default function ChatDetailPage() {
  const [participants, setParticipants] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const { user } = useAuth();
  const params = useParams();
  const chatId = params?.id as string;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchChatData = async () => {
      setLoading(true);
      try {
        const msgRes = await chatApi.getMessages(chatId, 1, 50);
        setMessages(
          (msgRes.messages || []).map((msg: any) => ({
            id: msg.id,
            senderName: msg.sender_data?.name || "",
            senderRole: msg.senderRole,
            senderId: msg.sender_data?.id || "",
            content: msg.message,
            timestamp: new Date(msg.created_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            avatar: msg.sender_data?.image || "/placeholder.svg",
          }))
        );
        const imgRes = await chatApi.getChatImages(chatId);
        const chat = imgRes.chat || {};
        const participantsArr = [
          {
            id: "lender",
            name: "Lender",
            avatar: chat.lender?.image || "/placeholder.svg",
            role: "Lender",
          },
          {
            id: "appraiser",
            name: "Appraiser",
            avatar: chat.appraiser?.image || "/placeholder.svg",
            role: "Appraiser",
          },
          {
            id: "admin",
            name: "Admin",
            avatar: chat.admin?.image || "/placeholder.svg",
            role: "Admin",
          },
        ];
        setParticipants(participantsArr);
      } catch {
        setMessages([]);
        setParticipants([]);
      } finally {
        setLoading(false);
      }
    };

    fetchChatData();
  }, [chatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    setSending(true);
    try {
      const response = await chatApi.sendMessage(chatId, {
        jobId: chatId, // <-- required by your backend
        senderId: user.id, // <-- required by your backend
        content: newMessage.trim(),
      });
      setMessages((prev) => [
        ...prev,
        {
          id: response.id || Math.random().toString(), // fallback if no id
          senderName: user.name,
          senderRole: "lender",
          senderId: user.id,
          content: response.content || newMessage.trim(),
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          avatar: user.avatar || "/placeholder.svg",
        },
      ]);
      setNewMessage("");
    } catch (err) {
      // handle error
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="lender">
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="lender">
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
                  Residential Appraisal
                </div>{" "}
                {/* needs to be changed */}
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
        <div className="flex-1 w-full flex flex-col items-center overflow-hidden">
          <div className="max-w-4xl w-full mx-auto flex flex-col gap-6 px-0">
            {messages.map((message) => {
              const isCurrentUser = message.senderId === user?.id;
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
                      className="rounded-2xl px-5 py-3 flex flex-col shadow-sm bg-[#E6F9F3]"
                      style={{ minWidth: 220, maxWidth: 400 }}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-base">{message.senderName}</span>
                        <span
                          className={`text-xs font-medium ${
                            message.senderRole === "Admin"
                              ? "text-blue-500"
                              : message.senderRole === "Lender"
                              ? "text-green-500"
                              : "text-[#14B8A6]"
                          }`}
                        >
                          {message.senderRole?.charAt(0).toUpperCase() +
                            message.senderRole?.slice(1)}
                        </span>
                      </div>
                      <span className="text-sm">{message.content}</span>
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
              style={{
                boxShadow: "0 2px 8px 0 rgba(20, 74, 156, 0.08)",
              }}
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
