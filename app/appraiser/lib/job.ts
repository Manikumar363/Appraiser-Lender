import api from "@/lib/api/axios";

// Types
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
    lender: {
      id: string;
      name: string;
      email: string;
      image: string;
      phone: string;
      country_code: string;
    };
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

// API calls
export const appraiserJobsApi = {
  // ✅ Get Pending Jobs
  getPendingJobs: async (): Promise<AppraiserJob[]> => {
    const res = await api.get("/user/pending-jobs?page=1&limit=10");
    console.log("✅ getPendingJobs:", res.data);
    return res.data.jobs || [];
  },

  // ✅ Start Timer
  startTimer: async (): Promise<TimerData> => {
    const res = await api.post("/user/start-timer");
    console.log("✅ startTimer:", res.data);
    return res.data.data;
  },

  // ✅ Stop Timer
  stopTimer: async (): Promise<TimerData> => {
    const res = await api.post("/user/stop-timer");
    console.log("✅ stopTimer:", res.data);
    return res.data.record;
  },

  // ✅ Get Duration
  getTimerDuration: async (): Promise<{ duration: string; user: TimerData["user"] }> => {
    const res = await api.get("/user/get-duration");
    console.log("✅ getTimerDuration:", res.data);
    return {
      duration: res.data.duration || "00:00:00",
      user: res.data.user || { id: "", available: false },
    };
  },
};
