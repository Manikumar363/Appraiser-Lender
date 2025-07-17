// lib/jobs.ts
import axios from "./axios"

export interface Job {
  id: string
  title: string
  location: string
  city: string
  country: string
  date: string
  status: "pending" | "accepted" | "client-visit" | "site-visit-scheduled" | "post-visit-summary" | "completed" | "cancelled"
  statusText: string
  job_status?: "Client Visit" | "Active" | "Site Visit Scheduled" | "Post Visit Summary";
}

export interface JobDetail extends Job {
  files: Array<{ name: string; type: "pdf" | "image"; uploadDate: string }>
  amount: number
  paymentStatus: "paid" | "pending"
}

export function getStatusColor(status: Job["status"]) {
  switch (status) {
    case "client-visit":
    case "site-visit-scheduled":
    case "post-visit-summary":
      return "bg-[#FFC107] hover:bg-[#e6b306]"
    case "completed":
      return "bg-[#00F90A] hover:bg-[#00dd09]"
    case "cancelled":
      return "bg-red-500 hover:bg-red-600"
    default:
      return "bg-gray-400 hover:bg-gray-500"
  }
}

export function getProgressSteps(status: Job["status"] | "in-progress") {
  const steps = [
    { name: "Job Request", key: "request" },
    { name: "Job Tracking", key: "tracking" },
    { name: "Report Review", key: "review" },
  ]
  let currentStep = 0
  switch (status) {
    case "client-visit":
    case "site-visit-scheduled":
    case "in-progress": 
      currentStep = 1
      break
    case "post-visit-summary":
      currentStep = 2
      break
    case "completed":
      currentStep = 3
      break
  }
  return steps.map((step, i) => ({
    ...step,
    status: i < currentStep ? "completed" : i === currentStep ? "current" : "pending",
  }))
}

export type JobFilter = "All" | "in-progress" | "completed" | "cancel";

/** GET all my jobs */
export async function getMyJobs(filter: JobFilter = "in-progress"): Promise<Job[]> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const res = await axios.get(`/lender/my-jobs`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 204) {
   return []; // No content, return empty array
  }

  const allJobs: Job[] = res.data.jobs;

  console.log("Raw jobs from API:", allJobs);
  switch (filter) {
    case "All":
      return allJobs;
    case "in-progress":
      return allJobs.filter(
        (job) =>
          job.status === "accepted" &&
          ["Client Visit", "Active", "Site Visit Scheduled", "Post Visit Summary"].includes(
            job.job_status || ""
          )
      );
    case "completed":
      return allJobs.filter((job) => job.status === "completed");
    case "cancel":
      return allJobs.filter((job) => job.status === "cancelled");
    default:
      return allJobs;
  }
}

/** GET job by id */
export async function getJob(id: string): Promise<JobDetail> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
  const res = await axios.get(`/lender/my-jobs/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.data
}

/** POST a new job */
export async function postJob(payload: any): Promise<any> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
  const res = await axios.post(`/lender/my-jobs`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.data
}
