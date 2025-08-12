"use client";

import { useEffect, useState } from "react";
import { JobCard } from "../../../components/job-card";
import { useRouter } from "next/navigation";
import { getMyJobs, Job } from "@/lib/api/jobs1";
import { Plus } from "lucide-react";

interface DashboardContentProps {
  searchQuery: string;
}

export default function DashboardContent({ searchQuery }: DashboardContentProps) {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    getMyJobs("All")
      .then((data) => {
        setJobs(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch jobs error:", err);
        setError("Failed to fetch jobs");
        setLoading(false);
      });
  }, []);

  // Filter jobs by searchQuery
  const filteredJobs = jobs.filter(
    (job) =>
      job.purpose.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleNewJobRequest = () => {
    router.push("/lender/dashboard/new");
  };

  return (
    <div className="flex flex-col h-full min-h-[calc(90vh-14px)]">
      <div className="flex-1">
        {/* Job Cards */}
        <div className="space-y-4 mb-8">
          {loading && <div>Loading...</div>}
          {error && <div className="text-red-500">{error}</div>}
          {!loading && !error && filteredJobs.length === 0 && (
            <div className="text-gray-500 text-center py-8 text-lg font-medium">
              No results found
            </div>
          )}
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className="cursor-pointer"
              onClick={() => router.push(`/lender/jobs/${job.id}`)}
            >
              <JobCard
                title={job.purpose}
                location={job.address}
                jobStatus={job.job_status}
              />
            </div>
          ))}
        </div>
      </div>
      {/* New Job Request Button */}
      <div className="w-full pb-8">
        <button
          onClick={handleNewJobRequest}
          className="w-full bg-[#2A020D] text-white py-4 px-6 rounded-lg font-medium hover:bg-[#1a4f96] transition-colors flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          New Job Request
        </button>
      </div>
    </div>
  );
}