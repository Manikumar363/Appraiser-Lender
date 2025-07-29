"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Loader2, XCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import DashboardLayout from "../../../components/dashboard-layout";
import { appraiserJobsApi } from "../lib/job";
import { chatApi } from "@/lib/api/chat"; // Add this import
import { BuildingIcon } from "../../../components/icons";

interface ChatJob {
  id: string;
  jobId: string;
  title: string;
  location: string;
  status: string;
  lastActivity: string;
  participants?: {
    lender?: { image?: string };
    appraiser?: { image?: string };
    admin?: { image?: string };
  };
}

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
      
      // Map jobs and fetch participant images for each
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

          // Fetch participant images for this job
          try {
            const chatImages = await chatApi.getChatImages(job.job.id);
            mappedJob.participants = chatImages.chat || {};
          } catch (err) {
            console.warn(`Failed to fetch participants for job ${job.job.id}:`, err);
            // Set default participants if fetch fails
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

  // Helper function to get participant avatars
  const getParticipantAvatars = (participants: ChatJob['participants']) => {
    const avatars = [];
    
    if (participants?.lender?.image) {
      avatars.push({
        id: 'lender',
        image: participants.lender.image,
        name: 'Lender'
      });
    }
    
    if (participants?.appraiser?.image) {
      avatars.push({
        id: 'appraiser',
        image: participants.appraiser.image,
        name: 'Appraiser'
      });
    }
    
    if (participants?.admin?.image) {
      avatars.push({
        id: 'admin',
        image: participants.admin.image,
        name: 'Admin'
      });
    }
    
    // If no participants found, return default placeholders
    if (avatars.length === 0) {
      return [
        { id: 'lender', image: '/placeholder.svg', name: 'Lender' },
        { id: 'appraiser', image: '/placeholder.svg', name: 'Appraiser' },
        { id: 'admin', image: '/placeholder.svg', name: 'Admin' },
      ];
    }
    
    return avatars;
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
      <div className="">
        <div className="space-y-4 max-w-6xl flex flex-col mx-auto">
          {chatJobs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No conversations available.</p>
              <p className="text-gray-400 text-sm mt-2">
                Accept some jobs to start conversations
              </p>
            </div>
          ) : (
            chatJobs.map((chat) => {
              const participantAvatars = getParticipantAvatars(chat.participants);
              
              return (
                <div
                  key={chat.jobId}
                  className="bg-[#014F9D] rounded-2xl px-6 py-5 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer hover:bg-[#0159A8]"
                  onClick={() => handleChatClick(chat.jobId)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                        <BuildingIcon className="w-6 h-6 text-[#014F9D]" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-1">
                          {chat.title} 
                        </h3>
                        <p className="text-blue-100 text-sm">{chat.location}</p>
                        {/* <p className="text-blue-200 text-xs">Status: {chat.status}</p> */}
                      </div>
                    </div>
                    
                    {/* Participant Avatars - Same as in chat/id/page.tsx */}
                    <div className="flex -space-x-3">
                      {participantAvatars.map((participant) => (
                        <img
                          key={participant.id}
                          src={participant.image}
                          alt={participant.name}
                          className="min-w-9 h-10 rounded-full border-2 border-white object-cover"
                          onError={(e) => {
                            // Fallback to placeholder if image fails to load
                            const target = e.target as HTMLImageElement;
                            target.src = '/placeholder.svg';
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
