"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Loader2, XCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardLayout from "../../../components/dashboard-layout";
import { getMyJobs } from "../../../lib/api/jobs1";
import { chatApi } from "@/lib/api/chat";
import ChatListItem from "./components/ChatListItem";
import { ChatJob } from "./components/types";
import { useGlobalSearch } from "@/components/search-context";

export default function LenderChatPage() {
  const [chatJobs, setChatJobs] = useState<ChatJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { search } = useGlobalSearch();
  const [debounced, setDebounced] = useState(search.trim().toLowerCase());

  const router = useRouter();

  // Debounce global search for this page
  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim().toLowerCase()), 180);
    return () => clearTimeout(t);
  }, [search]);

  const fetchChatJobs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getMyJobs("All");

      const jobsWithParticipants = await Promise.all(
        (response || []).map(async (job: any) => {
          const mappedJob: ChatJob = {
            id: job.id,
            jobId: job.id,
            title: job.property_type || "Property Appraisal",
            location: job.address || "Location not specified",
            status: job.job_status || job.status,
            lastActivity: job.updated_at,
          };
          try {
            const chatImages = await chatApi.getChatImages(job.id);
            mappedJob.participants = chatImages.chat || {};
          } catch {
            mappedJob.participants = {};
          }
          return mappedJob;
        })
      );

      setChatJobs(jobsWithParticipants);
    } catch (err) {
      setError("Failed to load chat conversations");
      setChatJobs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChatJobs();
  }, [fetchChatJobs]);

  const filteredChats = useMemo(() => {
    if (!debounced) return chatJobs;
    return chatJobs.filter((c) => {
      const participantsStr = Object.values(c.participants || {})
        .map((p: any) => (p?.name || p?.username || "") as string)
        .join(" ")
        .toLowerCase();
      return (
        c.title.toLowerCase().includes(debounced) ||
        c.location.toLowerCase().includes(debounced) ||
        (c.status || "").toLowerCase().includes(debounced) ||
        participantsStr.includes(debounced)
      );
    });
  }, [chatJobs, debounced]);

  const handleChatClick = (jobId: string) => {
    router.push(`/lender/chats/${jobId}`);
  };

  if (loading) {
    return (
      <DashboardLayout role="lender">
        <div className="flex items-center justify-center h-screen">
          <div className="flex items-center gap-3 text-gray-500">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Loading conversations...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout role="lender">
        <div className="flex flex-col items-center justify-center h-screen">
          <XCircle className="w-12 h-12 text-red-500 mb-4" />
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={fetchChatJobs} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="lender">
      <div className="p-6">
        <div className="space-y-4 max-w-6xl flex flex-col mx-auto">
          {filteredChats.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No conversations match your search.</p>
            </div>
          ) : (
            filteredChats.map((chat) => (
              <ChatListItem
                key={chat.jobId}
                chat={chat}
                onClick={handleChatClick}
              />
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}