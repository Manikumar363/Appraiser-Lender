'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BuildingIcon, MapIcon, MessageIcon, CalendarIcon, LoadIcon, RightArrow } from "@/components/icons"
import DashboardLayout from "@/components/dashboard-layout"
import { Job, JobFilter } from "../../../lib/api/jobs1"
import { getMyJobs } from "../../../lib/api/jobs1"
import { getStatusColor } from "../../../lib/api/jobs1"

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [activeFilter, setActiveFilter] = useState<JobFilter>("in-progress")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
  async function fetchJobs() {
    setLoading(true)
    try {
      const data = await getMyJobs(activeFilter)
      setJobs(data)
    } catch (err) {
      console.error("Failed to fetch jobs:", err)
      setError("Failed to fetch jobs")
    } finally {
      setLoading(false)
    }
  }

  fetchJobs()
  }, [activeFilter]) 

  if (loading) return <DashboardLayout role="lender"><div className="p-6">Loading jobs...</div></DashboardLayout>
  if (error) return <DashboardLayout role="lender"><div className="p-6 text-red-500">Error: {error}</div></DashboardLayout>

  function getCityCountry(address: string) {
  const parts = address.split(",").map(part => part.trim());
  if (parts.length >= 3) {
    return parts[2] + ", " + parts[parts.length - 1]; // "Pune, India"
  }
  return address;
}

  return (
    <DashboardLayout role="lender">
      <div className="flex flex-col h-full">
        <div className="p-5 flex-grow">
          {/* Filter Tabs */}
          <div className="flex gap-4 mb-8">
            {(
               [
                 {key: "All", label: "All"},
                 { key: "in-progress", label: "In Progress" },
                 { key: "completed", label: "Completed" },
                 { key: "cancel", label: "Cancel" },
               ] as { key: JobFilter; label: string }[]
             ).map((f) => (
               <Button
                 key={f.key}
                 className={`w-[325px]  py-2  rounded-full ${
                   activeFilter === f.key
                     ? "bg-[#014F9D] hover:bg-blue-800 text-white"
                     : "border-[#014F9D] text-[#014F9D] hover:bg-blue-50 bg-transparent border"
                 }`}
                 onClick={() => setActiveFilter(f.key)}
               >
                 {f.label}
               </Button>
             ))}
          </div>

          {/* Jobs List */}
          <div className="space-y-4 mb-8">
            {jobs.map((job) => (
              <div key={job.id} className="bg-cyan-50 rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-800 rounded-full flex items-center justify-center">
                      <BuildingIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{job.property_type}</h3>
                      <p className="text-gray-600 text-sm">{job.address}</p>
                    </div>
                    {/* <Badge className={`${getStatusColor(job.status)} text-white px-4 py-2 rounded-full text-sm font-medium ml-4`}> */}
                      {/* <LoadIcon className="w-4 h-4 mr-2" /> */}
                      {/* {job.status?.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase())} */}
                    {/* </Badge> */}
                    <Badge
                     className="px-4 py-2 rounded-full text-sm font-medium ml-4 flex items-center text-white "
                       style={{
                         backgroundColor:
                           job.status?.toLowerCase() === "pending" ? "#FFC107"
                         : job.status?.toLowerCase() === "completed" ? "#22c55e"
                         : job.status?.toLowerCase() === "cancelled" ? "#ef4444"
                         : job.status?.toLowerCase() === "accepted" || job.status?.toLowerCase() === "active" ? "#00F90A"
                         : "#FFC107"
                       }}
                   >
                     <LoadIcon className="w-4 h-4 mr-2" />
                     {job.status?.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                   </Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" className="bg-cyan border border-[#014F9D] text-[#014F9D] rounded-full px-6 py-2 flex items-center gap-2 hover:bg-white transition-colors">
                      <MapIcon className="w-6 h-6 mr-1" />
                      {getCityCountry(job.address)}
                    </Button>
                    <Button variant="outline" size="sm" className="bg-cyan border border-[#014F9D] text-[#014F9D] rounded-full px-6 py-2 flex items-center gap-2 hover:bg-white transition-colors">
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      {new Date(job.preferred_date).toLocaleDateString()}
                    </Button>
                    <Button variant="outline" size="sm" className="bg-white border border-[#014F9D] text-[#014F9D] rounded-full px-6 py-2 flex items-center gap-2 hover:bg-blue-50 transition-colors">
                      <MessageIcon className="w-5 h-5 me-1" />
                      Message
                    </Button>
                    <Button variant="ghost" size="lg" className="text-gray-400 hover:text-white p-4 rounded-full" onClick={() => router.push(`/lender/jobs/${job.id}`)}>
                      <RightArrow className="w-12 h-12" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="pb-2">
          <button
            onClick={() => router.push("dashboard/new")}
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
