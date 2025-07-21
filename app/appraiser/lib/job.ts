import api from "@/lib/api/axios";


export async function uploadDocs(files: File[]): Promise<string[]> {
  const formData = new FormData();
  files.forEach(file => formData.append("files", file));
  const res = await api.post("/upload/multiple", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return res.data.urls || res.data.files || [];
}

// Types
export interface Lender {
  id: string;
  name: string;
  email: string;
  image: string;
  phone: string;
  country_code: string;
}

export interface AppraiserJob {
  id: string;
  status: string;
  created_at: string;
  updated_at: string;
  job: {
    id: string;
    intended_user: string;
    intended_username: string;
    phone: string;
    country_code: string;
    purpose: string;
    use: string;
    preferred_date: string;
    address: string;
    property_type: string;
    is_rush_req: boolean;
    price: string;
    description: string;
    lender_doc: string;
    status: string;
    job_status: string;
    expires_at: string;
    lender: Lender;
  };
}

export interface TimerData {
  id: number;
  start_time: string;
  end_time: string;
  duration: string;
  status: boolean;
  created_at: string;
  user: {
    id: string;
    available: boolean;
    name?: string;
    email?: string;
    image?: string;
    phone?: string;
    country_code?: string;
  };
}

export interface JobsApiResponse {
  success: boolean;
  jobs: AppraiserJob[];
  total_jobs: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const appraiserJobsApi = {
  // Get pending jobs
  async getPendingJobs(): Promise<AppraiserJob[]> {
    const res = await api.get<JobsApiResponse>("/user/pending-jobs", {
      params: { page: 1, limit: 10 },
    });
    console.log("✅ getPendingJobs:", res.data);
    return res.data.jobs || [];
  },

  // Start Timer
  async startTimer(): Promise<TimerData> {
    const res = await api.post<{ data: TimerData }>("/user/start-timer");
    console.log("✅ startTimer:", res.data);
    return res.data.data;
  },

  // Stop Timer
  async stopTimer(): Promise<TimerData> {
    const res = await api.post<{ record: TimerData }>("/user/stop-timer");
    console.log("✅ stopTimer:", res.data);
    return res.data.record;
  },

  // Get Duration
  async getTimerDuration(): Promise<{ duration: string; user: TimerData["user"] }> {
    const res = await api.get<{ duration: string; user: TimerData["user"] }>("/user/get-duration");
    console.log("✅ getTimerDuration:", res.data);
    return {
      duration: res.data.duration || "00:00:00",
      user: res.data.user || { id: "", available: false },
    };
  },

  // Accept job
  async acceptJob(jobId: string): Promise<any> {
    const res = await api.post(`/user/accept-job/${jobId}`);
    console.log("✅ acceptJob:", res.data);
    return res.data;
  },

  // Decline job
  async declineJob(jobId: string): Promise<any> {
    const res = await api.post(`/user/decline-job/${jobId}`);
    console.log("✅ declineJob:", res.data);
    return res.data;
  },

  // Fetch accepted jobs (with flexible params)
   async fetchAcceptedJobs({ page = 1, limit = 10 }: { page?: number; limit?: number } = {}): Promise<JobsApiResponse> {
    const res = await api.get<JobsApiResponse>("/user/accepted-jobs", {
      params: { page, limit }
    });
    // DEBUG!
    console.log("JOBS API RAW RESPONSE:", res.data);
    return res.data;
  },

  async updateJobStatus(jobId: string, body: any) {
    const res = await api.post(`/user/update-job-status/${jobId}`, body);
    return res.data;
  },

};
