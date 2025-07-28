"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Loader2, XCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import DashboardLayout from "../../../components/dashboard-layout";
import { getMyJobs } from "../../../lib/api/jobs1";
import { BuildingIcon } from "../../../components/icons";
import { get } from "http";

export default function LenderChatPage() {
  const [chatJobs, setChatJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const { toast } = useToast();

  const fetchChatJobs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const jobs = await getMyJobs("in-progress");
      const mapped = jobs.map((job) => ({
        id: job.id,
        jobId: job.id,
        title: job.property_type || "Property Appraisal",
        location: job.address || "Location not specified",
        status: job.job_status || job.status,
        lastActivity: job.updated_at,
      }));
      
      setChatJobs(mapped);
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
    router.push(`/lender/chats/${jobId}`);
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
        <h1 className="text-2xl font-bold mb-6">Chat Conversations</h1>
        <div className="space-y-4 max-w-4xl">
          {chatJobs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No conversations available.</p>
            </div>
          ) : (
            chatJobs.map((chat) => (
              <div
                key={chat.jobId}
                className="bg-[#014F9D] rounded-2xl px-6 py-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleChatClick(chat.jobId)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                      <BuildingIcon className="w-6 h-6 text-[#014F9D]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">
                        {chat.title} - #{chat.jobId}
                      </h3>
                      <p className="text-blue-100 text-sm">{chat.location}</p>
                      <p className="text-blue-200 text-xs">Status: {chat.status}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}