"use client"

import DashboardLayout from "../../../components/dashboard-layout"
import { JobCard } from "../../../components/job-card"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"

import { CheckCircle, XCircle } from "lucide-react"
import { useState } from "react"

const jobsData = [
  {
    id: 1,
    title: "Residential Appraisal",
    location: "Ontario, Canada",
    timeLeft: "15 Min Left",
  },
  {
    id: 2,
    title: "Residential Appraisal",
    location: "Toronto, Canada",
    timeLeft: "15 Min Left",
  },
  {
    id: 3,
    title: "Residential Appraisal",
    location: "Toronto, Canada",
    timeLeft: "15 Min Left",
  },
  {
    id: 4,
    title: "Residential Appraisal",
    location: "Brampton, Canada",
    timeLeft: "15 Min Left",
  },
]

export default function AppraiserDashboardPage() {
  const [isAvailable, setIsAvailable] = useState(true)

  return (
    <DashboardLayout role="appraiser">
      <div className="space-y-4">
        {/* Availability Toggle & Timer */}
        <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">00:01:25</span>
            <span className="text-sm text-gray-600">Available For New Job Requests.</span>
          </div>
          <label className="inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={isAvailable}
              onChange={() => setIsAvailable(!isAvailable)}
            />
            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-green-500 peer-focus:ring-2 peer-focus:ring-green-400 transition-colors"></div>
          </label>
        </div>

        {/* Job Cards */}
        <div className="space-y-4">
          {jobsData.map((job) => (
            <div
              key={job.id}
              className="flex items-center justify-between bg-[#e8fafa] p-4 rounded-lg"
            >
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{job.title}</h3>
                <p className="text-sm text-gray-600">{job.location}</p>
                <span className="inline-flex items-center gap-1 text-xs text-white bg-red-500 px-2 py-1 rounded-full mt-2">
                  ⏰ {job.timeLeft}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button className="bg-[#054c99] text-white p-2 rounded-full hover:bg-[#043a77] transition">
                  <CheckCircle size={20} />
                </button>
                <button className="border border-gray-400 p-2 rounded-full hover:bg-gray-100 transition">
                  <XCircle size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
