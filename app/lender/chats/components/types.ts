export interface UIMessage {
  id: string;
  senderName: string;
  senderRole: string;
  senderId: string;
  content: string;
  timestamp: string;
  avatar: string;
  created_at: string;
}

export interface Participant {
  id: string;
  name: string;
  avatar: string;
  role: string;
}

export interface User {
  id: string;
  name: string;
  role: string;
  email?: string;
}

export interface JobDetails {
  title: string;
  location: string;
  status: string;
}

export interface ChatJob {
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
