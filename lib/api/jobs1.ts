import api from "./axios";

export interface Lender {
  id: string;
  name: string;
  email: string;
  image: string;
  phone: string;
  country_code: string;
  is_verified: boolean;
  is_active: boolean;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface Appraiser {
  id: string;
  name: string;
  email: string;
  image: string;
  phone: string;
  country_code: string;
  is_verified: boolean;
  is_active: boolean;
  available: boolean;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface AssignedAppraiser {
  id: string;
  status: string;
  created_at: string;
  updated_at: string;
  appraiser: Appraiser;
}

export interface Job {
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
  appraiser_docs: string | null;
  status: "pending" | "accepted" | "client-visit" | "site-visit-scheduled" | "post-visit-summary" | "completed" | "cancelled";
  job_status?: "Client Visit" | "Active" | "Site Visit Scheduled" | "Post Visit Summary";
  property_rights: string | null;
  occupant: string | null;
  comments: string | null;
  notes: string | null;
  estimate_market_value: string | null;
  effective_date: string | null;
  location: string | null;
  created_at: string;
  updated_at: string;
  expires_at: string;
  lender: Lender;
  assigned_appraiser: AssignedAppraiser[];
}

export interface JobListResponse {
  success: boolean;
  total_jobs: number;
  page: number;
  limit: number;
  totalPages: number;
  jobs: Job[];
}
export interface JobDetail extends Job {
  files: Array<{ name: string; type: "pdf" | "image"; uploadDate: string }>
  amount: number
  paymentStatus: "paid" | "pending"
}
export type JobFilter = "All" | "in-progress" | "completed" | "cancel";

export function getStatusColor(status: string) {
  switch (status?.toLowerCase()) {
    case "client-visit":
      return "bg-[#FFC107] hover:bg-[#e6b306]";
    case "accepted":
    case "active":
      return "bg-[#00F90A] hover:bg-[#00dd09]";
    case "site-visit-scheduled":
      return "bg-[#FFC107] hover:bg-[#e6b306]";
    case "post-visit-summary":
      return "bg-[#FFC107] hover:bg-[#e6b306]";
    case "cancelled":
      return "bg-red-500 hover:bg-red-600";
    case "pending":
      return "bg-[#FFC107] hover:bg-[#e6b306]";
    case "in-progress": // <-- add this line
      return "bg-[#FFC107] hover:bg-[#e6b306]";
    case "completed":
      return "bg-green-500 hover:bg-green-600";
    default:
      return "bg-gray-400 hover:bg-gray-500";
  }
}
export function getProgressSteps(status: Job["status"] | "in-progress") {
  const steps = [
    { name: "Job Request", key: "request" },
    { name: "Job Tracking", key: "tracking" },
    { name: "Report Review", key: "review" },
  ];
  let currentStep = 0;
  switch (status) {
    case "client-visit":
    case "site-visit-scheduled":
    case "in-progress":
      currentStep = 1;
      break;
    case "post-visit-summary":
      currentStep = 2;
      break;
    case "completed":
      currentStep = 3;
      break;
    default:
      currentStep = 0;
  }
  return steps.map((step, i) => ({
    ...step,
    status: i < currentStep ? "completed" : i === currentStep ? "current" : "pending",
  }));
}

export async function getMyJobs(filter: JobFilter = "in-progress"): Promise<Job[]> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const res = await api.get(`/lender/my-jobs`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 204) {
    return [];
  }

  const allJobs: Job[] = res.data.jobs;

  switch (filter) {
    case "All":
      return allJobs;
    case "in-progress":
      return allJobs.filter(
        (job) =>
          ["pending","Client Visit", "Active", "Site Visit Scheduled", "Post Visit Summary"].includes(job.status)
      );
    case "completed":
      return allJobs.filter((job) => job.status === "completed");
    case "cancel":
      return allJobs.filter((job) => job.status === "cancelled");
    default:
      return allJobs;
  }
}

export async function postJob(payload: any): Promise<any>{
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const res = await api.post("job/post-job", payload, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
}
export async function getSingleJob(id: string): Promise<JobDetail> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const res = await api.get(`/lender/my-jobs/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = res.data;
  if (!data.success || !data.job) throw new Error("Job not found");
  return data.job;
}
