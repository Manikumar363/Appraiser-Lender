"use client";

import { useEffect, useState, useCallback } from "react";
import { JobCard } from "../../../components/job-card";
import { useRouter, useSearchParams } from "next/navigation";
import { getMyJobsPaginated, Job } from "@/lib/api/jobs1"; // UPDATED import
import { Plus } from "lucide-react";

interface DashboardContentProps {
  searchQuery?: string;
  ts?: string; // cache-bust trigger passed from server
}

export default function DashboardContent({ searchQuery = "", ts = "" }: DashboardContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Pagination (server-driven)
  const PAGE_SIZE = 10;
  const [currentPage, setCurrentPage] = useState<number>(() => {
    const p = Number(searchParams.get("page") || "1");
    return Number.isFinite(p) && p > 0 ? p : 1;
  });
  const [meta, setMeta] = useState<{ page: number; limit: number; totalJobs: number; totalPages: number }>({
    page: 1,
    limit: PAGE_SIZE,
    totalJobs: 0,
    totalPages: 1,
  });

  const setPageInUrl = (page: number) => {
    const sp = new URLSearchParams(Array.from(searchParams.entries()));
    sp.set("page", String(page));
    router.replace(`/lender/dashboard?${sp.toString()}`);
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
    setPageInUrl(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Fetch from server by page/limit/search
  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getMyJobsPaginated({
        page: currentPage,
        limit: PAGE_SIZE,
        search: searchQuery,
        status: "All",
      });
      setJobs(res.jobs || []);
      setMeta({
        page: res.page,
        limit: res.limit,
        totalJobs: res.total_jobs,
        totalPages: res.totalPages,
      });
    } catch (err) {
      console.error("Fetch jobs error:", err);
      setError("Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs, ts]);

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

  useEffect(() => {
    // reset to page 1 when search changes
    setCurrentPage(1);
    setPageInUrl(1);
  }, [searchQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleNewJobRequest = () => {
    router.push("/lender/dashboard/new");
  };

  // For footer text
  const showingStart = (meta.page - 1) * meta.limit + (jobs.length ? 1 : 0);
  const showingEnd = Math.min(meta.page * meta.limit, meta.totalJobs);

  return (
    <div className="flex flex-col h-full min-h-[calc(90vh-14px)]">
      <div className="flex-1">
        <div className="space-y-4 mb-8">
          {loading && <div>Loading...</div>}
          {error && <div className="text-red-500">{error}</div>}
          {!loading && !error && jobs.length === 0 && (
            <div className="text-gray-500 text-center py-8 text-lg font-medium">
              No results found
            </div>
          )}

          {jobs.map((job) => (
            <div
              key={job.id}
              className="cursor-pointer"
              onClick={() => router.push(`/lender/jobs/${job.id}`)}
            >
              <JobCard title={job.intended_username} location={job.address} jobStatus={job.job_status} />
            </div>
          ))}

          {/* Pagination controls (server-side) */}
          {!loading && !error && meta.totalJobs > 0 && (
            <div className="flex items-center justify-between pt-4">
              <button
                className="px-4 py-2 rounded-lg border text-sm disabled:opacity-50"
                onClick={() => goToPage(Math.max(1, meta.page - 1))}
                disabled={meta.page <= 1}
              >
                Previous
              </button>
              <div className="text-sm text-gray-600">
                Page {meta.page} of {meta.totalPages} • Showing {showingStart}-{showingEnd} of {meta.totalJobs}
              </div>
              <button
                className="px-4 py-2 rounded-lg border text-sm disabled:opacity-50"
                onClick={() => goToPage(Math.min(meta.totalPages, meta.page + 1))}
                disabled={meta.page >= meta.totalPages}
              >
                Next
              </button>
            </div>
          )}
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