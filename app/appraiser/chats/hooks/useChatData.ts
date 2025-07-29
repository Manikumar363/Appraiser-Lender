import { useState, useEffect, useCallback } from "react";
import { chatApi } from "@/lib/api/chat";
import { appraiserJobsApi } from "@/app/appraiser/lib/job";
import { UIMessage, Participant, JobDetails } from "../components/types";
import { useToast } from "@/components/ui/use-toast";

export function useChatData(jobId: string) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [jobDetails, setJobDetails] = useState<JobDetails>({
    title: "Property Appraisal",
    location: "Loading...",
    status: "active"
  });

  const { toast } = useToast();

  const fetchJobDetails = useCallback(async () => {
    if (!jobId) return;

    try {
      const acceptedJobs = await appraiserJobsApi.fetchAcceptedJobs({ page: 1, limit: 100 });
      const currentJob = acceptedJobs.jobs?.find((job: any) => job.job.id === jobId);
      
      if (currentJob) {
        setJobDetails({
          title: currentJob.job.property_type || "Property Appraisal",
          location: currentJob.job.address || "Location not specified",
          status: currentJob.job.job_status || currentJob.job.status || "active"
        });
      } else {
        const pendingJobs = await appraiserJobsApi.getPendingJobs();
        const pendingJob = pendingJobs?.find((job: any) => job.job.id === jobId);
        
        if (pendingJob) {
          setJobDetails({
            title: pendingJob.job.property_type || "Property Appraisal",
            location: pendingJob.job.address || "Location not specified",
            status: pendingJob.job.job_status || pendingJob.job.status || "active"
          });
        }
      }
    } catch (error) {
      console.warn('Failed to fetch job details:', error);
      setJobDetails({
        title: "Property Appraisal",
        location: "Location not available",
        status: "active"
      });
    }
  }, [jobId]);

  const fetchChatData = useCallback(async () => {
    if (!jobId) return;

    setLoading(true);
    try {
      const [msgRes, imgRes] = await Promise.all([
        chatApi.getMessages(jobId, 1, 50),
        chatApi.getChatImages(jobId),
        fetchJobDetails()
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
  }, [jobId, toast, fetchJobDetails]);

  return {
    participants,
    messages,
    setMessages,
    loading,
    jobDetails,
    fetchChatData
  };
}
