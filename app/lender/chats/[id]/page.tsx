"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import DashboardLayout from "../../../../components/dashboard-layout";
import { chatApi } from "@/lib/api/chat";
import ChatHeader from "../components/ChatHeader";
import MessageBubble from "../components/MessageBubble";
import MessageInput from "../components/MessageInput";
import { useChatData } from "../hooks/useChatData"; // lender-side hook
import { getUserFromToken } from "../components/utils";
import { UIMessage, User } from "../components/types";

function getDateLabel(dateString: string) {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const isToday =
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  if (isToday) return "Today";
  if (isYesterday) return "Yesterday";
  return date.toLocaleDateString();
}

export default function ChatDetailPage() {
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const { toast } = useToast();
  const params = useParams();
  const jobId = params?.id as string;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { participants, messages, setMessages, loading, jobDetails, fetchChatData } = useChatData(jobId);

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

  useEffect(() => {
    fetchChatData();
  }, [fetchChatData]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || !user || sending) {
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
        created_at: messageData.created_at, // <-- add this line
      };

      setMessages(prev => [...prev, newMessageObj]);
      setNewMessage("");
    } catch (err) {
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
      <DashboardLayout role="lender">
        <div className="flex items-center justify-center h-screen">
          <div className="flex items-center gap-3 text-gray-500">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Loading conversation...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="lender">
      <div className="flex flex-col h-full overflow-hidden relative">
        <ChatHeader
          jobDetails={jobDetails}
          jobId={jobId}
          participants={participants}
        />

        {/* Messages */}
        <div className="flex-1 w-full flex flex-col items-center overflow-y-auto pb-20">
          <div className="max-w-6xl w-full mx-auto flex flex-col gap-6 px-4">
            {messages.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No messages yet. Start the conversation!
              </div>
            ) : (
              (() => {
                let lastDate = "";
                return messages.map((message) => {
                  const messageDate = new Date(message.created_at).toDateString();
                  let showDate = false;
                  if (messageDate !== lastDate) {
                    showDate = true;
                    lastDate = messageDate;
                  }
                  return (
                    <div key={message.id}>
                      {showDate && (
                        <div className="text-center text-xs text-gray-400 my-2">
                          {getDateLabel(message.created_at)}
                        </div>
                      )}
                      <MessageBubble
                        message={message}
                        user={user}
                      />
                    </div>
                  );
                });
              })()
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <MessageInput
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          onSendMessage={handleSendMessage}
          onKeyPress={handleKeyPress}
          sending={sending}
        />
      </div>
    </DashboardLayout>
  );
}