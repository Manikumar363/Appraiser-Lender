"use client";

import { useEffect, useState, useCallback } from "react";
import { JobCard } from "../../../components/job-card";
import { useRouter } from "next/navigation";
import { getMyJobs, Job } from "@/lib/api/jobs1";
import { Plus } from "lucide-react";

interface DashboardContentProps {
  searchQuery: string;
  ts?: string; // cache-bust trigger passed from server
}

export default function DashboardContent({ searchQuery, ts = "" }: DashboardContentProps) {
  const router = useRouter();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getMyJobs("All");
      setJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch jobs error:", err);
      setError("Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs, ts]); // refetch when redirected with ?ts=

  useEffect(() => {
    const onFocus = () => fetchJobs();
    const onVis = () => document.visibilityState === "visible" && fetchJobs();
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [fetchJobs]);

  // Newest first
  const getCreated = (j: any) => {
    const d =
      j?.created_at || j?.createdAt || j?.created_on || j?.created || j?.updated_at || "";
    const t = d ? Date.parse(d) : NaN;
    if (!Number.isFinite(t)) {
      const idNum = Number(j?.id);
      return Number.isFinite(idNum) ? idNum : 0;
    }
    return t;
  };

  const sorted = [...jobs].sort((a, b) => getCreated(b) - getCreated(a));

  // Filter by search
  const filteredJobs = sorted.filter(
    (job) =>
      (job.purpose?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (job.address?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  const handleNewJobRequest = () => {
    router.push("/lender/dashboard/new");
  };

  return (
    <div className="flex flex-col h-full min-h-[calc(90vh-14px)]">
      <div className="flex-1">
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
              <JobCard title={job.property_type} location={job.address} jobStatus={job.job_status} />
            </div>
          ))}
        </div>
      </div>
      <div className="w-full pb-8">
        <button
          onClick={handleNewJobRequest}
          className="w-full bg-[#2A020D] text-white py-4 px-6 rounded-lg font-medium hover:bg-[#4e1b29] transition-colors flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          New Job Request
        </button>
      </div>
    </div>
  );
}