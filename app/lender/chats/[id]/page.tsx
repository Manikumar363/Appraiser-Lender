"use client"

import LenderDashboardLayout from "../../components/lender-dashboard-layout"
import { useRouter, useParams } from "next/navigation"
import { useState, useEffect, useCallback } from "react"
import {
  ArrowLeft,
  Building2,
  MapPin,
  Calendar,
  MessageCircle,
  Download,
  FileText,
  ImageIcon,
  Loader2,
  CheckCircle,
  XCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "../../../../hooks/use-auth"
import { TimerIcon } from "../../components/icons"

interface JobDetail {
  id: string
  title: string
  location: string
  city: string
  country: string
  date: string
  status: "client-visit" | "site-visit-scheduled" | "post-visit-summary" | "completed" | "cancelled"
  statusText: string
  files: Array<{
    id: string
    name: string
    type: "pdf" | "image"
    uploadDate: string
  }>
  amount: number
  paymentStatus: "paid" | "pending"
  description?: string
  requirements?: string[]
  company?: string
  applicationStatus?: "not_applied" | "applied" | "under_review" | "accepted" | "rejected"
  applicationDate?: string
}

const getProgressSteps = (status: string) => {
  const steps = [
    { name: "Job Request", key: "request" },
    { name: "Job Tracking", key: "tracking" },
    { name: "Report Review", key: "review" },
  ]

  let currentStep = 0
  switch (status) {
    case "client-visit":
    case "site-visit-scheduled":
      currentStep = 1
      break
    case "post-visit-summary":
      currentStep = 2
      break
    case "completed":
      currentStep = 3
      break
  }

  return steps.map((step, index) => ({
    ...step,
    status: index < currentStep ? "completed" : index === currentStep ? "current" : "pending",
  }))
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "client-visit":
    case "site-visit-scheduled":
    case "post-visit-summary":
      return "bg-orange-400 hover:bg-orange-500"
    case "completed":
      return "bg-green-500 hover:bg-green-600"
    case "cancelled":
      return "bg-red-500 hover:bg-red-600"
    default:
      return "bg-gray-400 hover:bg-gray-500"
  }
}

const getApplicationStatusColor = (status?: string) => {
  switch (status) {
    case "applied":
      return "bg-blue-500 hover:bg-blue-600"
    case "under_review":
      return "bg-yellow-500 hover:bg-yellow-600"
    case "accepted":
      return "bg-green-500 hover:bg-green-600"
    case "rejected":
      return "bg-red-500 hover:bg-red-600"
    default:
      return "bg-gray-400 hover:bg-gray-500"
  }
}

// Mock data for development - replace with API call
const mockJobDetails: Record<string, JobDetail> = {
  "1": {
    id: "1",
    title: "Residential Appraisal",
    location: "Ontario, Canada",
    city: "Toronto",
    country: "Canada",
    date: "01/01/2024",
    status: "client-visit",
    statusText: "Client Visit",
    files: [
      { id: "1", name: "Floor Plan.pdf", type: "pdf", uploadDate: "1d ago" },
      { id: "2", name: "Exterior Image.jpg", type: "image", uploadDate: "1d ago" },
    ],
    amount: 500,
    paymentStatus: "paid",
    description:
      "Residential property appraisal for mortgage purposes. Property includes 3 bedrooms, 2 bathrooms, and a finished basement.",
    requirements: ["Valid ID required", "Property access needed", "Recent utility bills"],
    company: "ABC Appraisal Services",
    applicationStatus: "not_applied",
  },
  "2": {
    id: "2",
    title: "Commercial Property Assessment",
    location: "Toronto, Canada",
    city: "Toronto",
    country: "Canada",
    date: "01/02/2024",
    status: "site-visit-scheduled",
    statusText: "Site Visit Scheduled",
    files: [
      { id: "3", name: "Property Details.pdf", type: "pdf", uploadDate: "2d ago" },
      { id: "4", name: "Site Photos.jpg", type: "image", uploadDate: "1d ago" },
    ],
    amount: 750,
    paymentStatus: "pending",
    description: "Commercial property assessment for investment purposes. Large retail space in downtown core.",
    requirements: ["Commercial appraisal license", "Experience with retail properties", "Available weekends"],
    company: "XYZ Property Group",
    applicationStatus: "applied",
  },
  "3": {
    id: "3",
    title: "Industrial Property Valuation",
    location: "Toronto, Canada",
    city: "Toronto",
    country: "Canada",
    date: "01/03/2024",
    status: "post-visit-summary",
    statusText: "Post Visit Summary",
    files: [
      { id: "5", name: "Visit Report.pdf", type: "pdf", uploadDate: "1d ago" },
      { id: "6", name: "Interior Photos.jpg", type: "image", uploadDate: "1d ago" },
      { id: "7", name: "Measurements.pdf", type: "pdf", uploadDate: "1d ago" },
    ],
    amount: 600,
    paymentStatus: "paid",
    description:
      "Industrial property valuation for insurance purposes. Manufacturing facility with specialized equipment.",
    requirements: ["Industrial appraisal experience", "Safety certification", "Equipment knowledge"],
    company: "Industrial Valuations Inc",
    applicationStatus: "under_review",
  },
  "4": {
    id: "4",
    title: "Luxury Home Appraisal",
    location: "Ontario, Canada",
    city: "Toronto",
    country: "Canada",
    date: "01/04/2024",
    status: "completed",
    statusText: "Completed",
    files: [
      { id: "8", name: "Final Report.pdf", type: "pdf", uploadDate: "1d ago" },
      { id: "9", name: "Property Images.jpg", type: "image", uploadDate: "2d ago" },
      { id: "10", name: "Appraisal Certificate.pdf", type: "pdf", uploadDate: "1d ago" },
    ],
    amount: 800,
    paymentStatus: "paid",
    description: "Luxury residential property appraisal. High-end finishes, custom features, and premium location.",
    requirements: ["Luxury property experience", "High-value appraisal certification", "Discretion required"],
    company: "Premium Appraisals Ltd",
    applicationStatus: "accepted",
  },
}

export default function JobDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const { isAuthenticated } = useAuth()

  const [job, setJob] = useState<JobDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const jobId = params?.id as string

  // Fetch job details
  const fetchJobDetails = useCallback(async () => {
    if (!jobId) return

    try {
      setLoading(true)
      setError(null)

      // For development, use mock data
      // In production, replace with: const jobDetails = await jobsApi.getJobDetails(jobId)
      const jobDetails = mockJobDetails[jobId]

      if (!jobDetails) {
        setError("Job not found")
        return
      }

      setJob(jobDetails)
    } catch (err: any) {
      console.error("Error fetching job details:", err)
      setError(err.response?.data?.message || "Failed to load job details")

      toast({
        title: "Error",
        description: "Failed to load job details.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [jobId, toast])

  // Apply to job function
  const handleApplyToJob = async () => {
    if (!isAuthenticated || !job) {
      router.push("/login")
      return
    }

    try {
      setApplying(true)

      // For development, simulate API call
      // In production, replace with: const result = await jobsApi.applyToJob(job.id, {...})
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate API delay

      toast({
        title: "Success!",
        description: "Application submitted successfully!",
        variant: "default",
      })

      // Update job status
      setJob((prev) => (prev ? { ...prev, applicationStatus: "applied" } : null))
    } catch (err: any) {
      console.error("Error applying to job:", err)

      toast({
        title: "Application Failed",
        description: "Failed to submit application. Please try again.",
        variant: "destructive",
      })
    } finally {
      setApplying(false)
    }
  }

  useEffect(() => {
    fetchJobDetails()
  }, [fetchJobDetails])

  // Redirect if not authenticated
  if (!isAuthenticated) {
    router.push("/login")
    return null
  }

  // Loading state
  if (loading) {
    return (
      <LenderDashboardLayout>
        <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
          <div className="flex items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Loading job details...</span>
          </div>
        </div>
      </LenderDashboardLayout>
    )
  }

  // Error state
  if (error || !job) {
    return (
      <LenderDashboardLayout>
        <div className="p-6 bg-gray-50 min-h-screen">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="sm" onClick={() => router.back()} className="p-2">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-semibold text-gray-900">Job not found</h1>
          </div>
          <div className="text-center py-8">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error || "Job not found"}</p>
            <Button onClick={() => router.push("/jobs")}>Back to Jobs</Button>
          </div>
        </div>
      </LenderDashboardLayout>
    )
  }

  const progressSteps = getProgressSteps(job.status)
  const canApply = job.applicationStatus === "not_applied" || !job.applicationStatus

  return (
    <LenderDashboardLayout>
      <div className="p-6 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.back()} className="p-2">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </div>
          <h1 className="text-xl font-semibold text-gray-900">Job Details</h1>
        </div>

        {/* Job Info Card */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-1">{job.title}</h2>
                <p className="text-gray-600 text-sm">{job.location}</p>
                {job.company && <p className="text-gray-500 text-xs">{job.company}</p>}
              </div>
              <div className="flex flex-col gap-2">
                <Badge
                  className={`${getStatusColor(job.status)} text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2`}
                >
                  <TimerIcon />
                  {job.statusText}
                </Badge>
                {job.applicationStatus && (
                  <Badge
                    className={`${getApplicationStatusColor(job.applicationStatus)} text-white px-4 py-2 rounded-full text-sm font-medium`}
                  >
                    {job.applicationStatus.replace("_", " ").toUpperCase()}
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="border-blue-200 text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-full bg-transparent"
              >
                <MapPin className="w-4 h-4 mr-2" />
                {job.city}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-blue-200 text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-full bg-transparent"
              >
                <Calendar className="w-4 h-4 mr-2" />
                {job.date}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-blue-200 text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-full bg-transparent"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Message
              </Button>
            </div>
          </div>
        </div>

        {/* Job Summary Progress */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Job Summary</h3>
          <div className="flex items-center justify-center gap-8">
            {progressSteps.map((step, index) => (
              <div key={step.key} className="flex flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                    step.status === "completed"
                      ? "bg-blue-600"
                      : step.status === "current"
                        ? "bg-white border-2 border-blue-600"
                        : "bg-gray-400"
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full ${
                      step.status === "completed" ? "bg-white" : step.status === "current" ? "bg-blue-600" : "bg-white"
                    }`}
                  />
                </div>
                <span className="text-sm text-gray-600 text-center">{step.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Job Description */}
        {job.description && (
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Description</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{job.description}</p>
          </div>
        )}

        {/* Requirements */}
        {job.requirements && job.requirements.length > 0 && (
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Requirements</h3>
            <ul className="list-disc list-inside space-y-2">
              {job.requirements.map((req, index) => (
                <li key={index} className="text-gray-700">
                  {req}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Uploaded Files */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Uploaded Files</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            {job.files.map((file, index) => (
              <div key={file.id || index} className="bg-gray-50 rounded-lg p-4 flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center mb-2">
                  {file.type === "pdf" ? (
                    <FileText className="w-6 h-6 text-gray-600" />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-gray-600" />
                  )}
                </div>
                <p className="font-medium text-gray-900 text-sm mb-1">{file.name}</p>
                <p className="text-xs text-gray-500">{file.uploadDate}</p>
              </div>
            ))}
          </div>
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg">
            <Download className="w-4 h-4 mr-2" />
            Download All
          </Button>
        </div>

        {/* Transaction Summary */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction Summary</h3>
          <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <ImageIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-gray-900">${job.amount}</span>
            </div>
            <Badge
              className={`${
                job.paymentStatus === "paid" ? "bg-green-500 hover:bg-green-600" : "bg-orange-400 hover:bg-orange-500"
              } text-white px-4 py-2 rounded-full text-sm font-medium`}
            >
              {job.paymentStatus === "paid" ? "Paid" : "Pending"}
            </Badge>
          </div>
        </div>

        {/* Apply Button */}
        {canApply && (
          <Button
            className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-lg text-lg font-medium"
            onClick={handleApplyToJob}
            disabled={applying}
          >
            {applying ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Applying...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Apply to Job
              </>
            )}
          </Button>
        )}

        {/* Accept Button for existing functionality */}
        {job.status !== "completed" && job.applicationStatus === "accepted" && (
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-lg text-lg font-medium mt-4">
            Accept Job
          </Button>
        )}
      </div>
    </LenderDashboardLayout>
  )
}
