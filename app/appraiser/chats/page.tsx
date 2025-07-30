"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Loader2, XCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import DashboardLayout from "../../../components/dashboard-layout";
import { appraiserJobsApi } from "../lib/job";
import { chatApi } from "@/lib/api/chat";
import ChatListItem from "./components/ChatListItem";
import { ChatJob } from "./components/types";

export default function AppraiserChatPage() {
  const [chatJobs, setChatJobs] = useState<ChatJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const { toast } = useToast();

  const fetchChatJobs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await appraiserJobsApi.fetchAcceptedJobs({ page: 1, limit: 50 });
      
      const jobsWithParticipants = await Promise.all(
        (response.jobs || []).map(async (job: any) => {
          const mappedJob: ChatJob = {
            id: job.id,
            jobId: job.job.id,
            title: job.job.property_type || "Property Appraisal",
            location: job.job.address || "Location not specified",
            status: job.job.job_status || job.job.status,
            lastActivity: job.updated_at,
          };

          try {
            const chatImages = await chatApi.getChatImages(job.job.id);
            mappedJob.participants = chatImages.chat || {};
          } catch (err) {
            console.warn(`Failed to fetch participants for job ${job.job.id}:`, err);
            mappedJob.participants = {};
          }

          return mappedJob;
        })
      );
      
      setChatJobs(jobsWithParticipants);
    } catch (err: any) {
      setError("Failed to load chat conversations");
      toast({
        title: "Error",
        description: "Failed to load conversations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchChatJobs();
  }, [fetchChatJobs]);

  const handleChatClick = (jobId: string) => {
    router.push(`/appraiser/chats/${jobId}`);
  };

  if (loading) {
    return (
      <DashboardLayout role="appraiser">
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
      <DashboardLayout role="appraiser">
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
    <DashboardLayout role="appraiser">
      <div className="p-6">
        <div className="space-y-4 max-w-6xl flex flex-col mx-auto">
          {chatJobs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No conversations available.</p>
              <p className="text-gray-400 text-sm mt-2">
                Accept some jobs to start conversations
              </p>
            </div>
          ) : (
            chatJobs.map((chat) => (
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
