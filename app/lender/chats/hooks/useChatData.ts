import { useState, useCallback } from "react";
import { chatApi } from "@/lib/api/chat";
import { getMyJobs } from "../../../../lib/api/jobs1";
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
      const jobsRes = await getMyJobs("All");
      const currentJob = jobsRes.find((job: any) => job.id === jobId);

      if (currentJob) {
        setJobDetails({
          title: currentJob.property_type || "Property Appraisal",
          location: currentJob.address || "Location not specified",
          status: currentJob.job_status || currentJob.status || "active"
        });
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
        created_at: msg.created_at, // <-- Add this line
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