import LenderDashboardLayout from "../components/lender-dashboard-layout"
import { JobCard } from "../components/job-card"
import { Plus } from "lucide-react"

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
  return (
    <LenderDashboardLayout>
      <div className="flex flex-col h-full">
        {/* Job Cards */}
        <div className="flex-1 space-y-4">
          {jobsData.map((job) => (
            <JobCard key={job.id} title={job.title} location={job.location} status={job.status} />
          ))}
        </div>

        {/* New Job Request Button - Fixed at bottom */}
        <div className="pt-6 mt-auto">
          <button className="w-full bg-[#1e5ba8] text-white py-4 px-6 rounded-lg font-medium hover:bg-[#1a4f96] transition-colors flex items-center justify-center gap-2">
            <Plus size={20} />
            New Job Request
          </button>
        </div>
      </div>
    </LenderDashboardLayout>
  )
}
