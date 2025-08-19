'use client'

import { Suspense, useState } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import JobsContent from "./JobsContent";
import { JobFilter } from "../../../lib/api/jobs1"; // adjust path if needed

interface JobsPageProps {
  searchQuery?: string;
}

export default function JobsPage({ searchQuery = "" }: JobsPageProps) {
  const [activeFilter, setActiveFilter] = useState<JobFilter>("All");
  const router = useRouter();

  return (
    <DashboardLayout role="lender">
      <Suspense fallback={<div>Loading jobs...</div>}>
        <JobsContent
          searchQuery={searchQuery}
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
          onNewJob={() => router.push("/lender/dashboard/new")}
        />
      </Suspense>
    </DashboardLayout>
  )
}
