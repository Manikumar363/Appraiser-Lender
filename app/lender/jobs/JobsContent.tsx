'use client'
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Job, JobFilter, getMyJobsPaginated } from "../../../lib/api/jobs1";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BuildingIcon, MapIcon, MessageIcon, CalendarIcon, LoadIcon, RightArrow } from "@/components/icons";
import { Plus } from "lucide-react";

interface JobsContentProps {
  searchQuery: string;
  activeFilter: JobFilter;
  setActiveFilter: (f: JobFilter) => void;
  onNewJob: () => void;
}

function getCityCountry(address: string) {
  const parts = address.split(",").map(part => part.trim());
  if (parts.length >= 3) {
    return parts[2] + ", " + parts[parts.length - 1];
  }
  return address;
}

export default function JobsContent({
  searchQuery,
  activeFilter,
  setActiveFilter,
  onNewJob,
}: JobsContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const PAGE_SIZE = 10;
  const [currentPage, setCurrentPage] = useState<number>(() => {
    const p = Number(searchParams.get("page") || "1");
    return Number.isFinite(p) && p > 0 ? p : 1;
  });
  const [meta, setMeta] = useState<{ page: number; totalPages: number; totalJobs: number }>({
    page: 1,
    totalPages: 1,
    totalJobs: 0,
  });

  const setPageInUrl = (page: number) => {
    const sp = new URLSearchParams(Array.from(searchParams.entries()));
    sp.set("page", String(page));
    router.replace(`/lender/jobs?${sp.toString()}`);
  };

  const goToPage = (page: number) => {
    const safe = Math.min(Math.max(1, page), meta.totalPages || 1);
    if (safe === currentPage) return;
    setCurrentPage(safe);
    setPageInUrl(safe);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
        totalPages: res.totalPages,
        totalJobs: res.total_jobs,
      });
    } catch (e: any) {
      setError(e?.message || "Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, activeFilter]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  useEffect(() => {
    setCurrentPage(1);
    setPageInUrl(1);
  }, [searchQuery, activeFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const strIncludes = (v: string | undefined, q: string) => (v || "").toLowerCase().includes(q.toLowerCase());
  const matchesFilter = (job: Job, filter: JobFilter) => {
    const status = (job.job_status || "").toLowerCase();
    switch (filter) {
      case "in-progress":
        return [
          "pending",
          "accepted",
          "client_visit",
          "site_visit_scheduled",
          "post_visit_summary",
          "active"
        ].includes(status);
      case "completed":
        return status === "completed";
      case "cancelled":
        return status === "cancelled";
      case "All":
      default:
        return true;
    }
  };

  const visibleJobs = useMemo(() => {
    const q = (searchQuery || "").trim().toLowerCase();
    return jobs.filter((job) => {
      const matchSearch =
        !q ||
        strIncludes(job.property_type, q) ||
        strIncludes(job.address, q) ||
        strIncludes(job.job_status, q) ||
        strIncludes(job.status, q);
      return matchSearch && matchesFilter(job, activeFilter);
    });
  }, [jobs, searchQuery, activeFilter]);

  if (loading) {
    return (
      <div className="p-6">Loading jobs...</div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-red-500">Error: {error}</div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-[calc(90vh-14px)]">
      {/* Main content area */}
      <div className="flex-1 flex flex-col">
        {/* Filter Tabs */}
        <div className="flex gap-4 mb-8">
          {(
            [
              { key: "All", label: "All" },
              { key: "in-progress", label: "In Progress" },
              { key: "completed", label: "Completed" },
              { key: "cancelled", label: "Cancelled" },
            ] as { key: JobFilter; label: string }[]
          ).map((f) => (
            <Button
              key={f.key}
              className={`w-full py-6 rounded-full ${
                activeFilter === f.key
                  ? "bg-[#2A020D] hover:bg-[#4e1b29] text-white"
                  : "border-[#2A020D] text-[#2A020D] hover:bg-[#FBEFF2] bg-transparent border"
              }`}
              onClick={() => setActiveFilter(f.key)}
            >
              {f.label}
            </Button>
          ))}
        </div>

        {/* Jobs List */}
        {visibleJobs.length === 0 ? (
          <div className="flex items-center justify-center py-24 flex-1">
            <span className="text-gray-500 text-xl font-medium">
              No jobs found.
            </span>
          </div>
        ) : (
          visibleJobs.map((job) => (
            <div key={job.id} className="bg-[#FBEFF2] rounded-xl p-2 shadow border border-[#E6F9F3] hover:shadow-md transition-shadow mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-[#2A020D] rounded-full flex items-center justify-center">
                    <BuildingIcon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{job.intended_username}</h3>
                    <p className="text-gray-600 text-sm">{job.address}</p>
                    <div className="flex justify-start mt-3">
                      <Badge
                        className="px-3 py-2 rounded-full text-sm font-medium flex items-center text-white transition-colors cursor-pointer hover:brightness-110"
                        style={{
                          backgroundColor:
                            job.job_status?.toLowerCase() === "pending" ? "#FFC107"
                            : job.job_status?.toLowerCase() === "completed" ? "#22c55e"
                            : job.job_status?.toLowerCase() === "cancelled" ? "#ef4444"
                            : job.job_status?.toLowerCase() === "accepted" || job.job_status?.toLowerCase() === "active" ? "#22c55e"
                            : "#FFC107"
                        }}
                      >
                        <LoadIcon className="w-5 h-5 mr-2" />
                        {job.job_status?.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-nowrap">
                  <Button variant="outline" size="sm" className="bg-[#FBEFF2] border border-[#2A020D] text-[#2A020D] rounded-full px-4 py-4 flex items-center gap-2 hover:bg-white transition-colors">
                    <MapIcon className="w-6 h-6 mr-1" />
                    {getCityCountry(job.address)}
                  </Button>
                  <Button variant="outline" size="sm" className="bg-[#FBEFF2] border border-[#2A020D] text-[#2A020D] rounded-full px-4 py-4 flex items-center gap-2 hover:bg-white transition-colors">
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    {job.preferred_date ? new Date(job.preferred_date).toLocaleDateString() : "N/A"}
                  </Button>
                  <Button variant="outline" size="sm" className="bg-white border border-[#2A020D] text-[#2A020D] rounded-full px-4 py-4 flex items-center gap-2 hover:bg-[#FBEFF2] transition-colors"
                    onClick={() => router.push(`/lender/chats/${job.id}`)}>
                    <MessageIcon className="w-5 h-5 me-1" />
                    Message
                  </Button>
                  <Button
                    variant="ghost"
                    size="lg"
                    className="bg-white text-[#2A020D] hover:bg-[#FBEFF2] p-0 rounded-full flex items-center justify-center transition-colors w-[40px] h-[40px] shadow"
                    onClick={() => router.push(`/lender/jobs/${job.id}`)}
                  >
                    <span className="flex items-center justify-center w-[44px] h-[44px] rounded-full">
                      <RightArrow className="w-7 h-7" />
                    </span>
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination controls */}
      {meta.totalJobs > 0 && (
        <div className="flex items-center justify-between pt-4 mb-4">
          <button
            className="px-4 py-2 rounded-lg border text-sm disabled:opacity-50"
            onClick={() => goToPage(meta.page - 1)}
            disabled={meta.page <= 1}
          >
            Previous
          </button>
          <div className="text-sm text-gray-600">
            Page {meta.page} of {meta.totalPages} • Showing {(meta.page - 1) * PAGE_SIZE + (visibleJobs.length ? 1 : 0)}-
            {Math.min(meta.page * PAGE_SIZE, meta.totalJobs)} of {meta.totalJobs}
          </div>
          <button
            className="px-4 py-2 rounded-lg border text-sm disabled:opacity-50"
            onClick={() => goToPage(meta.page + 1)}
            disabled={meta.page >= meta.totalPages}
          >
            Next
          </button>
        </div>
      )}

      {/* New Job Request Button */}
      <div className="w-full pb-8">
        <button
          onClick={onNewJob}
          className="w-full bg-[#2A020D] text-white py-4 px-6 rounded-lg font-medium hover:bg-[#4e1b29] transition-colors flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          New Job Request
        </button>
      </div>
    </div>
  );
}