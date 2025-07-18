"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import{
  ArrowLeft,
  Plus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BuildingIcon, MapIcon, MessageIcon, CalendarIcon, RightArrow, LoadIcon,ImageIcon, PDFIcon, CardIcon, LeftArrow, ArrowIcon  } from "../../../components/icons"
import DashboardLayout from "../../../components/dashboard-layout"

interface Job {
  id: string
  title: string
  location: string
  city: string
  country: string
  date: string
  status: "client-visit" | "site-visit-scheduled" | "post-visit-summary" | "completed" | "cancelled"
  statusText: string
}

interface JobDetail extends Job {
  files: Array<{
    name: string
    type: "pdf" | "image"
    uploadDate: string
  }>
  amount: number
  paymentStatus: "paid" | "pending"
}

const jobs: Job[] = [
  {
    id: "1",
    title: "Residential Appraisal",
    location: "Ontario, Canada",
    city: "Toronto",
    country: "Canada",
    date: "01/01/2024",
    status: "client-visit",
    statusText: "Client Visit",
  },
  {
    id: "2",
    title: "Residential Appraisal",
    location: "Toronto, Canada",
    city: "Toronto",
    country: "Canada",
    date: "01/01/2024",
    status: "site-visit-scheduled",
    statusText: "Site Visit Scheduled",
  },
  {
    id: "3",
    title: "Residential Appraisal",
    location: "Toronto, Canada",
    city: "Toronto",
    country: "Canada",
    date: "01/01/2024",
    status: "post-visit-summary",
    statusText: "Post Visit Summary",
  },
  {
    id: "4",
    title: "Residential Appraisal",
    location: "Ontario, Canada",
    city: "Toronto",
    country: "Canada",
    date: "01/01/2024",
    status: "completed",
    statusText: "Completed",
  },
]

// Extended job details with additional information
const jobDetails: Record<string, JobDetail> = {
  "1": {
    ...jobs[0],
    files: [
      { name: "Floor Plan.pdf", type: "pdf", uploadDate: "1d ago" },
      { name: "Exterior Image.jpg", type: "image", uploadDate: "1d ago" },
    ],
    amount: 500,
    paymentStatus: "paid",
  },
  "2": {
    ...jobs[1],
    files: [
      { name: "Property Details.pdf", type: "pdf", uploadDate: "2d ago" },
      { name: "Site Photos.jpg", type: "image", uploadDate: "1d ago" },
    ],
    amount: 750,
    paymentStatus: "pending",
  },
  "3": {
    ...jobs[2],
    files: [
      { name: "Visit Report.pdf", type: "pdf", uploadDate: "1d ago" },
      { name: "Interior Photos.jpg", type: "image", uploadDate: "1d ago" },
      { name: "Measurements.pdf", type: "pdf", uploadDate: "1d ago" },
    ],
    amount: 600,
    paymentStatus: "paid",
  },
  "4": {
    ...jobs[3],
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
  ];

  let currentStep = 0;
  switch (status) {
    case "client-visit":
    case "site-visit-scheduled":
      currentStep = 1;
      break;
    case "post-visit-summary":
      currentStep = 2;
      break;
    case "completed":
      currentStep = 3;
      break;
  }

  return steps.map((step, index) => ({
    ...step,
    status:
      index < currentStep
        ? "completed"
        : index === currentStep
        ? "current"
        : "pending",
  }));
};

const getStatusColor = (status: Job["status"]) => {
  switch (status) {
    case "client-visit":
    case "site-visit-scheduled":
    case "post-visit-summary":
      return "bg-[#FFC107] hover:bg-[#e6b306]"
    case "completed":
      return "bg-[#00F90A] hover:bg-[#e6b306]"
    case "cancelled":
      return "bg-red-500 hover:bg-red-600"
    default:
      return "bg-gray-400 hover:bg-gray-500"
  }
}

export default function JobsPage() {
  const [activeFilter, setActiveFilter] = useState<string>("all")
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)
  const router = useRouter()

  const getFilteredJobs = () => {
    switch (activeFilter) {
      case "in-progress":
        return jobs.filter(
          (job) =>
            job.status === "client-visit" ||
            job.status === "site-visit-scheduled" ||
            job.status === "post-visit-summary",
        )
      case "completed":
        return jobs.filter((job) => job.status === "completed")
      case "cancel":
        return jobs.filter((job) => job.status === "cancelled")
      default:
        return jobs
    }
  }

  const handleJobClick = (jobId: string) => {
    setSelectedJobId(jobId)
  }

  const handleBackToList = () => {
    setSelectedJobId(null)
  }

  const handleNewJobClick = () => {
    router.push("/jobs/new")
  }

  const filteredJobs = getFilteredJobs()
  const selectedJob = selectedJobId ? jobDetails[selectedJobId] : null

  // If a job is selected, show job details
  if (selectedJob) {
    const progressSteps = getProgressSteps(selectedJob.status)

    return (
      <DashboardLayout role="lender">
        <div className="p-6  min-h-screen">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="lg" onClick={handleBackToList} className="p-2">
                < ArrowIcon className="w-8 h-8" />
              </Button>
            </div>
            <h1 className="text-xl font-semibold text-gray-900">Job Details</h1>
          </div>

          {/* Job Info Card */}
          <div className="bg-cyan-50 rounded-lg p-6 shadow-sm border border-gray-2400 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-800 rounded-full flex items-center justify-center">
                  <BuildingIcon className="w-6 h-6 text-white" />
                </div>

                <div className="flex flex-col">
                  <h2 className="text-lg font-semibold text-gray-900">{selectedJob.title}</h2>

                  <div className="flex flex-col">
                    <p className="text-gray-600 text-sm mb-1">{selectedJob.location}</p>
                    <Badge
                      className={`${getStatusColor(selectedJob.status)} text-white px-4 py-2 rounded-full text-xs font-medium w-fit`}
                    >
                      <LoadIcon className="w-4 h-4 mr-2"/>
                      {selectedJob.statusText}
                      
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-blue-200 text-blue-800 hover:bg-blue-50 px-4 py-2 rounded-full bg-transparent"
                >
                  <MapIcon className="w-6 h-6 mr-1" />
                  {selectedJob.city}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-blue-200 text-blue-800 hover:bg-blue-50 px-4 py-2 rounded-full bg-transparent"
                >
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  {selectedJob.date}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-blue-200 text-blue-800 hover:bg-blue-50 px-4 py-2 rounded-full bg-transparent"
                >
                  <MessageIcon className="w-5 h-5 me-1" />
                  Message
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600 p-2">
                  <RightArrow className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Job Summary Progress */}
          <div className="bg-cyan-50 rounded-lg p-6 shadow-sm border border-gray-200 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Job Summary</h3>
            <div className="flex items-center justify-center gap-8">
            {progressSteps.map((step, index) => (
              <div key={step.key} className="flex flex-col items-center">
                {/* OUTER CIRCLE */}
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center mb-2
                    ${
                      step.status === "completed"
                        ? "bg-blue-800"
                        : step.status === "current"
                        ? "bg-white border-[14px] border-blue-800"
                        : "bg-gray-400"
                    }`}
                >
                  {/* INNER CIRCLE ONLY FOR CURRENT */}
                  {step.status === "current" && (
                    <div className=" bg-blue-700" />
                  )}
                </div>

                {/* STEP LABEL */}
                <span className="text-sm text-gray-600 text-center">{step.name}</span>
              </div>
            ))}
         </div>
          </div>

          {/* Uploaded Files */}
          <div className=" mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Uploaded Files</h3>
            <div className="flex flex-wrap justify-start gap-4 mb-4">
              {selectedJob.files.map((file, index) => (
                <div key={index} className="bg-cyan-50 rounded-xl py-4 px-3  w-[200px] flex flex-col items-center text-center shadow-md">
                  <div className="w-10 h-10 flex items-center justify-center mb-2">
                    {file.type === "pdf" ? (
                      <PDFIcon className="w-6 h-6 text-gray-700" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-gray-700" />
                    )}
                  </div>
                  <p className="font-medium text-gray-900 text-sm mb-1 truncate">{file.name}</p>
                  <p className="text-sm text-gray-500">{file.uploadDate}</p>
                </div>
              ))}
            </div>
            <Button className="w-full bg-blue-800 hover:bg-blue-700 text-white py-3 rounded-lg">
              Download All
            </Button>
          </div>

          {/* Transaction Summary */}
          <div className=" mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction Summary</h3>
            <div className="bg-cyan-50 rounded-xl px-5 py-4 flex items-center justify-between shadow-md max-w-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-800 rounded-full flex items-center justify-center">
                  <CardIcon className="w-8 h-8 text-white" />
                </div>
                <span className="text-xl font-semibold text-gray-900">${selectedJob.amount}</span>
              </div>
              <Badge
                className={`${
                  selectedJob.paymentStatus === "paid"
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-orange-400 hover:bg-orange-500"
                } text-white px-4 py-2 rounded-full text-sm font-medium`}
              >
                {selectedJob.paymentStatus === "paid" ? "Paid" : "Pending"}
              </Badge>
            </div>
          </div>

          {/* Accept Button */}
          {selectedJob.status !== "completed" && (
            <Button className="w-full bg-blue-800 hover:bg-blue-700 text-white py-4 rounded-lg text-lg font-medium">
              Accept
            </Button>
          )}
        </div>
      </DashboardLayout>
    )
  }

  // Default view - Jobs List
  return (
    <DashboardLayout role="lender">
      <div className="flex flex-col h-full">
      <div className="p-5 flex-grow">
        {/* Filter Tabs */}
        <div className="flex gap-4 mb-8">
          <Button
            className={`w-[225px] py-2 rounded-full ${
              activeFilter === "all"
                ? "bg-blue-800 hover:bg-blue-700 text-white"
                : "border-blue-800 text-blue-800 hover:bg-blue-50 bg-transparent border"
            }`}
            onClick={() => setActiveFilter("all")}
          >
            All
          </Button>
          <Button
            className={`w-[225px] py-2 rounded-full ${
              activeFilter === "in-progress"
                ? "bg-blue-800 hover:bg-blue-700 text-white"
                : "border-blue-800 text-blue-800 hover:bg-blue-50 bg-transparent border"
            }`}
            onClick={() => setActiveFilter("in-progress")}
          >
            In Progress
          </Button>
          <Button
            className={`w-[225px] py-2 rounded-full ${
              activeFilter === "completed"
                ? "bg-blue-800 hover:bg-blue-700 text-white"
                : "border-blue-800 text-blue-800 hover:bg-blue-50 bg-transparent border"
            }`}
            onClick={() => setActiveFilter("completed")}
          >
            Completed
          </Button>
          <Button
            className={`w-[225px] py-2 rounded-full ${
              activeFilter === "cancel"
                ? "bg-blue-800 hover:bg-blue-700 text-white"
                : "border-blue-800 text-blue-800 hover:bg-blue-50 bg-transparent border"
            }`}
            onClick={() => setActiveFilter("cancel")}
          >
            Cancel
          </Button>
        </div>

        {/* Jobs List */}
        <div className="space-y-4 mb-8">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className="bg-cyan-50 rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                {/* Left Section - Job Info */}
                <div className="flex items-center gap-4">
                  {/* Building Icon */}
                  <div className="w-12 h-12 bg-blue-800 rounded-full flex items-center justify-center">
                    <BuildingIcon className="w-6 h-6 text-white" />
                  </div>

                  {/* Job Details */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{job.title}</h3>
                    <p className="tex           t-gray-600 text-sm">{job.location}</p>
                  </div>

                  {/* Status Badge */}
                  <Badge
                    className={`${getStatusColor(job.status)} text-white px-4 py-2 rounded-full text-sm font-medium ml-4`}
                  >
                    <LoadIcon className="w-4 h-4 mr-2"/>
                    {job.statusText}
                  </Badge>
                </div>

                {/* Right Section - Action Buttons */}
                <div className="flex items-center gap-3">
                  {/* Location Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-blue-200 text-blue-800 hover:bg-blue-50 px-4 py-2 rounded-full bg-transparent"
                  >
                    <MapIcon className="w-6 h-6 mr-1" />
                    {job.city}
                  </Button>

                  {/* Date Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-blue-200 text-blue-800 hover:bg-blue-50 px-4 py-2 rounded-full bg-transparent"
                  >
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    {job.date}
                  </Button>

                  {/* Message Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-blue-200 text-blue-800 hover:bg-blue-50 px-4 py-2 rounded-full bg-transparent"
                  >
                    <MessageIcon className="w-5 h-5 me-1" />
                    Message
                  </Button>

                  {/* Arrow Button - Navigate to Job Details */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-gray-600 p-2"
                    onClick={() => handleJobClick(job.id)}
                  >
                    <RightArrow className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
            
          ))}
        </div>
        </div>

        {/* New Job Request Button */}
        <div className="pb-2">
          <button
            onClick={handleNewJobClick}
            className="w-full bg-[#1e5ba8] text-white py-4 px-6 rounded-lg font-medium hover:bg-[#1a4f96] transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={20} />
            New Job Request
          </button>
        </div>
      </div>
    </DashboardLayout>
  )
}
