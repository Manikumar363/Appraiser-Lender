"use client"

import DashboardLayout from "../../../../components/dashboard-layout"
import { useRouter, useParams } from "next/navigation"
import {
  ArrowLeft,
  Building2,
  MapPin,
  Calendar,
  MessageCircle,
  ArrowRight,
  Download,
  FileText,
  ImageIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface JobDetail {
  id: string
  title: string
  location: string
  city: string
  date: string
  status: "client-visit" | "site-visit-scheduled" | "post-visit-summary" | "completed"
  statusText: string
  files: Array<{
    name: string
    type: "pdf" | "image"
    uploadDate: string
  }>
  amount: number
  paymentStatus: "paid" | "pending"
}

// Mock data - in real app, this would come from API
const jobDetails: Record<string, JobDetail> = {
  "1": {
    id: "1",
    title: "Residential Appraisal",
    location: "Ontario, Canada",
    city: "Toronto",
    date: "01/01/2024",
    status: "client-visit",
    statusText: "Client Visit",
    files: [
      { name: "Floor Plan.pdf", type: "pdf", uploadDate: "1d ago" },
      { name: "Exterior Image.jpg", type: "image", uploadDate: "1d ago" },
    ],
    amount: 500,
    paymentStatus: "paid",
  },
  "2": {
    id: "2",
    title: "Residential Appraisal",
    location: "Toronto, Canada",
    city: "Toronto",
    date: "01/01/2024",
    status: "site-visit-scheduled",
    statusText: "Site Visit Scheduled",
    files: [
      { name: "Property Details.pdf", type: "pdf", uploadDate: "2d ago" },
      { name: "Site Photos.jpg", type: "image", uploadDate: "1d ago" },
    ],
    amount: 750,
    paymentStatus: "pending",
  },
  "3": {
    id: "3",
    title: "Residential Appraisal",
    location: "Toronto, Canada",
    city: "Toronto",
    date: "01/01/2024",
    status: "post-visit-summary",
    statusText: "Post Visit Summary",
    files: [
      { name: "Visit Report.pdf", type: "pdf", uploadDate: "1d ago" },
      { name: "Interior Photos.jpg", type: "image", uploadDate: "1d ago" },
      { name: "Measurements.pdf", type: "pdf", uploadDate: "1d ago" },
    ],
    amount: 600,
    paymentStatus: "paid",
  },
  "4": {
    id: "4",
    title: "Residential Appraisal",
    location: "Ontario, Canada",
    city: "Toronto",
    date: "01/01/2024",
    status: "completed",
    statusText: "Completed",
    files: [
      { name: "Final Report.pdf", type: "pdf", uploadDate: "1d ago" },
      { name: "Property Images.jpg", type: "image", uploadDate: "2d ago" },
      { name: "Appraisal Certificate.pdf", type: "pdf", uploadDate: "1d ago" },
    ],
    amount: 800,
    paymentStatus: "paid",
  },
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
    default:
      return "bg-gray-400 hover:bg-gray-500"
  }
}

export default function JobDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const jobId = params?.id as string

  // Add debugging
  console.log("Job ID from params:", jobId)
  console.log("All params:", params)

  const job = jobDetails[jobId]

  if (!jobId) {
    return (
      <DashboardLayout role="appraiser">
        <div className="p-6">Loading...</div>
      </DashboardLayout>
    )
  }

  if (!job) {
    return (
      <DashboardLayout role="appraiser">
        <div className="p-6">
          <h1>Job not found</h1>
          <p>Job ID: {jobId}</p>
          <p>Available jobs: {Object.keys(jobDetails).join(", ")}</p>
        </div>
      </DashboardLayout>
    )
  }

  const progressSteps = getProgressSteps(job.status)

  return (
    <DashboardLayout role="appraiser">
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
              </div>
              <Badge
                className={`${getStatusColor(job.status)} text-white px-4 py-2 rounded-full text-sm font-medium ml-4`}
              >
                {job.statusText}
              </Badge>
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
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600 p-2">
                <ArrowRight className="w-5 h-5" />
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

        {/* Uploaded Files */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Uploaded Files</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            {job.files.map((file, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4 flex flex-col items-center text-center">
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

        {/* Accept Button */}
        {job.status !== "completed" && (
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-lg text-lg font-medium">
            Accept
          </Button>
        )}
      </div>
    </DashboardLayout>
  )
}
