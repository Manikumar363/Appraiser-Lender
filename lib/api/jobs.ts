import api from "./axios"

export interface Job {
  id: string
  title: string
  location: string
  city: string
  country: string
  date: string
  status: "client-visit" | "site-visit-scheduled" | "post-visit-summary" | "completed" | "cancelled"
  statusText: string
  description?: string
  requirements?: string[]
  salary?: number
  company?: string
}

export interface JobDetail extends Job {
  files: Array<{
    id: string
    name: string
    type: "pdf" | "image"
    uploadDate: string
    url: string
  }>
  amount: number
  paymentStatus: "paid" | "pending"
  applicationStatus?: "not_applied" | "applied" | "under_review" | "accepted" | "rejected"
  applicationDate?: string
}

export interface ApiResponse<T> {
  data: T
  message: string
  success: boolean
}

export interface JobsResponse {
  jobs: Job[]
  total: number
  page: number
  limit: number
}

// API functions
export const jobsApi = {
  // Fetch active jobs
  getActiveJobs: async (
    page = 1,
    limit = 10,
    filters?: {
      status?: string
      location?: string
      search?: string
    },
  ): Promise<JobsResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters,
    })

    const response = await api.get<ApiResponse<JobsResponse>>(`/api/jobs/active?${params}`)
    return response.data.data
  },

  // Get job details
  getJobDetails: async (jobId: string): Promise<JobDetail> => {
    const response = await api.get<ApiResponse<JobDetail>>(`/api/jobs/${jobId}`)
    return response.data.data
  },

  // Apply to job
  applyToJob: async (
    jobId: string,
    applicationData?: {
      coverLetter?: string
      expectedSalary?: number
      availableDate?: string
    },
  ): Promise<{ applicationId: string; message: string }> => {
    const response = await api.post<ApiResponse<{ applicationId: string; message: string }>>(`/api/jobs/apply`, {
      jobId,
      ...applicationData,
    })
    return response.data.data
  },

  // Get user's applications
  getUserApplications: async (): Promise<JobDetail[]> => {
    const response = await api.get<ApiResponse<JobDetail[]>>("/api/jobs/applications")
    return response.data.data
  },

  // Withdraw application
  withdrawApplication: async (jobId: string): Promise<{ message: string }> => {
    const response = await api.delete<ApiResponse<{ message: string }>>(`/api/jobs/apply/${jobId}`)
    return response.data.data
  },
}