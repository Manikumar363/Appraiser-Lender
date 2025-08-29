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
  if (parts.length >= 3) return parts[2] + ", " + parts[parts.length - 1];
  return address;
}

const formatMobileDate = (d?: string) =>
  d ? new Date(d).toLocaleDateString(undefined, { day: "2-digit", month: "2-digit", year: "2-digit" }) : "N/A";

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
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
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

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

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
      case "completed": return status === "completed";
      case "cancelled": return status === "cancelled";
      case "All":
      default: return true;
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

  if (loading) return <div className="p-6 text-sm">Loading jobs...</div>;
  if (error) return <div className="p-6 text-red-500 text-sm">Error: {error}</div>;

  return (
    <div className="flex flex-col h-full min-h-[calc(90vh-14px)]">
      

      {/* Filter Tabs (desktop widened) */}
      <div
        role="tablist"
        aria-label="Job status filters"
        className="flex flex-nowrap gap-2 mb-4 overflow-x-auto hide-scrollbar
                   md:overflow-visible md:mb-10 md:grid md:grid-cols-4 md:gap-6"
      >
        {([
          { key: "All", label: "All" },
          { key: "in-progress", label: "In Progress" },
          { key: "completed", label: "Completed" },
          { key: "cancelled", label: "Cancelled" },
        ] as { key: JobFilter; label: string }[]).map(f => {
          const active = activeFilter === f.key;
          return (
            <button
              key={f.key}
              role="tab"
              aria-selected={active}
              onClick={() => setActiveFilter(f.key)}
              className={`whitespace-nowrap rounded-full border px-5 py-2 text-xs font-medium transition
                          shrink-0
                          md:px-0 md:h-16 md:text-base md:font-semibold md:w-full md:flex md:items-center md:justify-center
                          ${active
                            ? "bg-[#2A020D] border-[#2A020D] text-white shadow-sm"
                            : "bg-white border-[#2A020D] text-[#2A020D] hover:bg-[#FBEFF2]"}`}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Jobs List */}
      {visibleJobs.length === 0 ? (
        <div className="flex items-center justify-center py-24 flex-1">
          <span className="text-gray-500 text-sm md:text-lg font-medium">No jobs found.</span>
        </div>
      ) : (
        visibleJobs.map((job) => {
          const status = job.job_status?.toLowerCase();
          const statusBg =
            status === "completed" || status === "accepted" || status === "active" ? "#22c55e"
              : status === "cancelled" ? "#ef4444"
                : "#FFC107";
          const statusText = job.job_status
            ? job.job_status.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase())
            : "Status";

          return (
            <div
              key={job.id}
              className="bg-[#FBEFF2] rounded-xl border border-[#E6F9F3] shadow hover:shadow-md transition mb-4 p-3 md:p-4"
            >
              {/* Mobile layout */}
              <div className="md:hidden flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-[#2A020D] rounded-full flex items-center justify-center">
                    <BuildingIcon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">
                        {job.intended_username}
                      </h3>
                      <Badge
                        className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium text-white"
                        style={{ backgroundColor: statusBg }}
                      >
                        <LoadIcon className="w-3 h-3" />
                        {statusText}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-gray-600 mt-1 line-clamp-1">{job.address}</p>
                  </div>
                  <button
                    onClick={() => router.push(`/lender/jobs/${job.id}`)}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-white border hover:bg-[#FFEFF4]"
                    aria-label="Open"
                  >
                    <RightArrow className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full border bg-white px-2 py-1 text-[10px]">
                    <MapIcon className="w-3.5 h-3.5" />
                    {getCityCountry(job.address).split(",")[0] || "Loc"}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border bg-white px-2 py-1 text-[10px]">
                    <CalendarIcon className="w-3.5 h-3.5" />
                    {formatMobileDate(job.preferred_date)}
                  </span>
                  <button
                    onClick={() => router.push(`/lender/chats/${job.id}`)}
                    className="ml-auto w-8 h-8 flex items-center justify-center rounded-full bg-white border hover:bg-[#FFEFF4]"
                    aria-label="Message"
                  >
                    <MessageIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Desktop layout (original look preserved) */}
              <div className="hidden md:flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-[#2A020D] rounded-full flex items-center justify-center">
                    <BuildingIcon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{job.intended_username}</h3>
                    <p className="text-gray-600 text-sm">{job.address}</p>
                    <div className="flex justify-start mt-3">
                      <Badge
                        className="px-3 py-2 rounded-full text-sm font-medium flex items-center text-white transition-colors"
                        style={{ backgroundColor: statusBg }}
                      >
                        <LoadIcon className="w-5 h-5 mr-2" />
                        {statusText}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-nowrap">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-[#FBEFF2] border border-[#2A020D] text-[#2A020D] rounded-full px-4 py-4 flex items-center gap-2 hover:bg-white transition-colors"
                  >
                    <MapIcon className="w-5 h-5" />
                    {getCityCountry(job.address)}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-[#FBEFF2] border border-[#2A020D] text-[#2A020D] rounded-full px-4 py-4 flex items-center gap-2 hover:bg-white transition-colors"
                  >
                    <CalendarIcon className="w-4 h-4" />
                    {job.preferred_date ? new Date(job.preferred_date).toLocaleDateString() : "N/A"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white border border-[#2A020D] text-[#2A020D] rounded-full px-4 py-4 flex items-center gap-2 hover:bg-[#FBEFF2] transition-colors"
                    onClick={() => router.push(`/lender/chats/${job.id}`)}
                  >
                    <MessageIcon className="w-5 h-5" />
                    Message
                  </Button>
                  <Button
                    variant="ghost"
                    size="lg"
                    className="bg-white text-[#2A020D] hover:bg-[#FBEFF2] p-0 rounded-full flex items-center justify-center transition-colors w-[44px] h-[44px] shadow"
                    onClick={() => router.push(`/lender/jobs/${job.id}`)}
                    aria-label="Open"
                  >
                    <RightArrow className="w-7 h-7" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })
      )}

      {meta.totalJobs > 0 && (
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pt-2 mb-4 text-sm">
          <div className="flex items-center gap-2">
            <button
              className="px-4 py-2 rounded-lg border bg-white disabled:opacity-50 text-xs md:text-sm"
              onClick={() => goToPage(meta.page - 1)}
              disabled={meta.page <= 1}
            >
              Prev
            </button>
            <button
              className="px-4 py-2 rounded-lg border bg-white disabled:opacity-50 text-xs md:text-sm"
              onClick={() => goToPage(meta.page + 1)}
              disabled={meta.page >= meta.totalPages}
            >
              Next
            </button>
          </div>
          <div className="text-gray-600 text-xs md:text-sm">
            Page {meta.page} of {meta.totalPages} • {(meta.page - 1) * PAGE_SIZE + (visibleJobs.length ? 1 : 0)}-
            {Math.min(meta.page * PAGE_SIZE, meta.totalJobs)} of {meta.totalJobs}
          </div>
        </div>
      )}

      <div className="w-full pb-6 md:pb-8">
        <button
          onClick={onNewJob}
          className="w-full bg-[#2A020D] text-white py-3 md:py-4 px-6 rounded-lg font-medium hover:bg-[#4e1b29] transition flex items-center justify-center gap-2 text-sm md:text-base"
        >
          <Plus size={18} className="md:hidden" />
          <Plus size={20} className="hidden md:inline" />
          New Job Request
        </button>
      </div>
    </div>
  );
}