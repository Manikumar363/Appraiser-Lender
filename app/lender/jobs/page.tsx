'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import JobsContent from "./JobsContent"
import { Job, JobFilter, getMyJobs } from "../../../lib/api/jobs1"

interface JobsPageProps {
  searchQuery?: string;
}

export default function JobsPage({ searchQuery = "" }: JobsPageProps) {
  const [jobs, setJobs] = useState<Job[]>([])
  const [activeFilter, setActiveFilter] = useState<JobFilter>("All")
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
        setError("Failed to fetch jobs")
      } finally {
        setLoading(false)
      }
    }
    fetchJobs()
  }, [activeFilter])

  return (
    <DashboardLayout role="lender">
      <JobsContent
        jobs={jobs}
        loading={loading}
        error={error}
        searchQuery={searchQuery}
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        onNewJob={() => router.push("/lender/dashboard/new")}
      />
    </DashboardLayout>
  )
}
