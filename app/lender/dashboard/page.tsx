"use client"

import LenderDashboardLayout from "../components/lender-dashboard-layout"
import { JobCard } from "../components/job-card"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"

const jobsData = [
  {
    id: 1,
    title: "Residential Appraisal",
    location: "Ontario, Canada",
    status: "in-progress" as const,
  },
  {
    id: 2,
    title: "Residential Appraisal",
    location: "Ontario, Canada",
    status: "active" as const,
  },
  {
    id: 3,
    title: "Residential Appraisal",
    location: "Ontario, Canada",
    status: "cancelled" as const,
  },
]

export default function LenderDashboardPage() {
  const router = useRouter()

  const handleNewJobRequest = () => {
    router.push("/lender/jobs/new")
  }

  return (
    <LenderDashboardLayout>
      <div className="space-y-6">
        {/* Job Cards */}
        <div className="space-y-4">
          {jobsData.map((job) => (
            <JobCard key={job.id} title={job.title} location={job.location} status={job.status} />
          ))}
        </div>

        {/* New Job Request Button */}
        <div className="pb-5">
          <button
            onClick={handleNewJobRequest}
            className="w-full bg-[#1e5ba8] text-white py-4 px-6 rounded-lg font-medium hover:bg-[#1a4f96] transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={20} />
            New Job Request
          </button>
        </div>
      </div>
    </LenderDashboardLayout>
  )
}
