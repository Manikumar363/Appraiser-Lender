"use client"


import { useEffect, useState } from "react"
import DashboardLayout from "../../../components/dashboard-layout"
import { JobCard } from "../../../components/job-card"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { getMyJobs, Job } from "@/lib/api/jobs1";




export default function LenderDashboardPage() {
  const router = useRouter()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")


  useEffect(()=>{
    setLoading(true)
    getMyJobs("All")
      .then((data) => {
        setJobs(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error("Fetch jobs error:", err);  // <-- add this
        setError("Failed to fetch jobs")
        setLoading(false)
      })
  },[])

  const handleNewJobRequest = () => {
    router.push("/lender/dashboard/new")
  }

  return (
    <DashboardLayout role="lender">
      <div className="flex flex-col h-full">
      <div className="space-y-6 flex-grow">
        {/* Job Cards */}
        <div className="space-y-4">
            {loading && <div>Loading...</div>}
            {error && <div className="text-red-500">{error}</div>}
            {!loading && !error && jobs.length === 0 && (
              <div>No jobs found.</div>
            )}
            {jobs.map((job) => {
              return (
                <JobCard
                  key={job.id}
                  title={job.purpose}
                  location={job.address}
                  status={job.status}
                />
              );
            })}
        </div>
        </div>

        {/* New Job Request Button */}
        
       
        <div className="pb-5 ">
          <button
            onClick={handleNewJobRequest}
            className="w-full bg-[#014F9D] text-white py-4 px-6 rounded-lg font-medium hover:bg-[#1a4f96] transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={20} />
            New Job Request
          </button>
        </div>
        </div>
    </DashboardLayout>
  )
}
