"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft, Map, MessageSquare, Phone, ExternalLink
} from "lucide-react"
import LenderDashboardLayout from "../../../components/lender-dashboard-layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

//example
const jobs = [
  {
    id: "1",
    title: "Residential Appraisal",
    location: "Ontario, Canada",
    status: "active",
    statusText: "Active",
    timeLeft: "15 Min Left",
    client: "Joe Done",
  },
  {
    id: "2",
    title: "Residential Appraisal",
    location: "Ontario, Canada",
    status: "client-visit",
    statusText: "Client Visit",
    timeLeft: "15 Min Left",
    client: "Joe Done",
  },
  {
    id: "3",
    title: "Residential Appraisal",
    location: "Toronto, Canada",
    status: "site-visit-scheduled",
    statusText: "Site Visit Scheduled",
    timeLeft: "15 Min Left",
    client: "Joe Done",
  },
  {
    id: "4",
    title: "Residential Appraisal",
    location: "Ontario, Canada",
    status: "completed",
    statusText: "Completed",
    timeLeft: "15 Min Left",
    client: "Joe Done",
  },
]

const getStatusColor = (status) => {
  switch (status) {
    case "active": return "bg-blue-500"
    case "client-visit": return "bg-yellow-500"
    case "site-visit-scheduled": return "bg-yellow-500"
    case "completed": return "bg-green-500"
    default: return "bg-gray-500"
  }
}

export default function AppraiserJobsPage() {
  const [activeFilter, setActiveFilter] = useState("all")
  const [selectedJobId, setSelectedJobId] = useState(null)
  const router = useRouter()

  const getFilteredJobs = () => {
    switch (activeFilter) {
      case "active": return jobs.filter(j => j.status === "active")
      case "in-progress": return jobs.filter(j => j.status.includes("visit"))
      case "completed": return jobs.filter(j => j.status === "completed")
      default: return jobs
    }
  }

  const filteredJobs = getFilteredJobs()

  const selectedJob = selectedJobId ? jobs.find(j => j.id === selectedJobId) : null

  return (
    <LenderDashboardLayout>
      <div className="p-6">
        {/* Filter Tabs */}
        <div className="flex gap-4 mb-6 ">
          {["all", "active", "in-progress", "completed"].map((filter) => (
            <Button
              key={filter}
              className={`px-6 py-2 rounded-full ${
                activeFilter === filter
                  ? "bg-blue-800 text-white"
                  : "border bg-white border-gray-300 text-gray-600"
              }`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter[0].toUpperCase() + filter.slice(1).replace("-", " ")}
            </Button>
          ))}
        </div>

        {/* Jobs List */}
        <div className="space-y-4">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className="flex justify-between items-center bg-[#e8fafa] p-4 rounded-lg"
            >
              <div>
                <h3 className="font-semibold">{job.title}</h3>
                <p className="text-sm text-gray-600">{job.location}</p>
                <Badge className={`${getStatusColor(job.status)} text-white mt-2`}>
                  {job.statusText}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-gray-100 text-gray-800">{job.timeLeft}</Badge>
                <Badge className="border">{job.client}</Badge>
                <Button variant="ghost" size="sm"><MessageSquare size={18} /></Button>
                <Button variant="ghost" size="sm"><Phone size={18} /></Button>
                <Button variant="ghost" size="sm"><ExternalLink size={18} /></Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </LenderDashboardLayout>
  )
}
