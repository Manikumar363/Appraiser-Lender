'use client'
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from "next/navigation";
import { useGlobalSearch } from '@/components/search-context';
import { Job, JobFilter, getMyJobsPaginated } from "../../../lib/api/jobs1";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BuildingIcon, MapIcon, MessageIcon, CalendarIcon, LoadIcon, RightArrow } from "@/components/icons";
import { Plus } from "lucide-react";

interface JobsContentProps {
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

// Helper (ensure exists)
function strIncludes(a: any, q: string) {
  return (a || '').toString().toLowerCase().includes(q);
}

export default function JobsContent({
  activeFilter,
  setActiveFilter,
  onNewJob,
}: JobsContentProps) {
  const router = useRouter();
  const { search } = useGlobalSearch();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  // Fetch once (or refetch on activeFilter if your API is server‑filtered)
  useEffect(() => {
    let ignore = false;
    (async () => {
      setLoading(true);
      try {
        const res = await getMyJobsPaginated?.({ page: 1, limit: 500 });
        if (!ignore) setJobs(res?.jobs || []);
      } catch {
        if (!ignore) setJobs([]);
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, []);

  // Normalize search (debounce)
  const [debounced, setDebounced] = useState(search);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim().toLowerCase()), 180);
    return () => clearTimeout(t);
  }, [search]);

  // Reset page on search/filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [debounced, activeFilter]);

  function matchesFilter(job: Job, filter: JobFilter) {
    if (filter === 'All') return true;
    const s = (job.job_status || '').toLowerCase();
    if (filter === 'completed') return s === 'completed';
    if (filter === 'cancelled') return s === 'cancelled';
    // in-progress bucket
    return ['active','accepted','pending','in_progress','in-progress','client_visit','site_visit_scheduled','post_visit_summary','post_visit_summary','job_request'].includes(s);
  }

  const filtered = useMemo(() => {
    const q = debounced;
    return jobs.filter(j => {
      if (!matchesFilter(j, activeFilter)) return false;
      if (!q) return true;
      return [
        j.intended_username,
        j.address,
        j.job_status,
        j.id
      ].some(field => strIncludes(field, q));
    });
  }, [jobs, debounced, activeFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  if (loading) return <div className="p-6 text-sm">Loading jobs...</div>;

  return (
    <div className="flex flex-col h-full min-h-[calc(90vh-14px)]">
      

      {/* Filter Tabs (desktop widened) */}
      <div
        role="tablist"
        className="
        flex flex-nowrap gap-2 mb-4 overflow-x-auto hide-scrollbar
          sm:justify-center
          md:grid md:grid-cols-4 md:gap-4 md:overflow-visible
          xl:mb-10
        "
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
                          md:text-sm md:px-6 md:py-2.5
                          lg:px-0 lg:h-16 lg:text-base lg:font-semibold lg:w-full lg:flex lg:items-center lg:justify-center
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
      {filtered.length === 0 ? (
        <div className="flex items-center justify-center py-24 flex-1">
          <span className="text-gray-500 text-sm md:text-lg font-medium">No jobs found.</span>
        </div>
      ) : (
        paged.map((job) => {
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
              {/* Unified Mobile + Tablet layout (desktop hidden) */}
              <div className="flex flex-col gap-3 xl:hidden">
                <div className="flex items-start gap-3 md:gap-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-[#2A020D] rounded-full flex items-center justify-center">
                    <BuildingIcon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 md:gap-3">
                      <h3 className="text-sm md:text-base font-semibold text-gray-900 truncate">
                        {job.intended_username}
                      </h3>
                      <Badge
                        className="flex items-center gap-1 px-2 md:px-3 py-0.5 rounded-full text-[10px] md:text-xs font-medium text-white"
                        style={{ backgroundColor: statusBg }}
                      >
                        <LoadIcon className="w-3 h-3 md:w-4 md:h-4" />
                        {statusText}
                      </Badge>
                    </div>
                    <p className="text-[11px] md:text-xs text-gray-600 mt-1 line-clamp-1">{job.address}</p>
                  </div>
                  <button
                    onClick={() => router.push(`/lender/jobs/${job.id}`)}
                    className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center rounded-full bg-white border hover:bg-[#FFEFF4]"
                    aria-label="Open"
                  >
                    <RightArrow className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                </div>

                <div className="flex items-center gap-2 md:gap-3">
                  <span className="inline-flex items-center gap-1 rounded-full border bg-white px-2 md:px-3 py-1 text-[10px] md:text-xs">
                    <MapIcon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    {getCityCountry(job.address).split(",")[0] || "Loc"}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border bg-white px-2 md:px-3 py-1 text-[10px] md:text-xs">
                    <CalendarIcon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    {formatMobileDate(job.preferred_date)}
                  </span>
                  <button
                    onClick={() => router.push(`/lender/chats/${job.id}`)}
                    className="ml-auto w-8 h-8 md:w-9 md:h-9 flex items-center justify-center rounded-full bg-white border hover:bg-[#FFEFF4]"
                    aria-label="Message"
                  >
                    <MessageIcon className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                </div>
              </div>

              {/* Desktop layout (≥1024px) */}
              <div className="hidden xl:flex items-center justify-between">
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
                    className="bg:white border border-[#2A020D] text-[#2A020D] rounded-full px-4 py-4 flex items-center gap-2 hover:bg-[#FBEFF2] transition-colors"
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

      {filtered.length > 0 && (
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pt-2 mb-4 text-sm">
          <div className="flex items-center gap-2">
            <button
              className="px-4 py-2 rounded-lg border bg-white disabled:opacity-50 text-xs md:text-sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage <= 1}
            >
              Prev
            </button>
            <button
              className="px-4 py-2 rounded-lg border bg-white disabled:opacity-50 text-xs md:text-sm"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage >= totalPages}
            >
              Next
            </button>
          </div>
          <div className="text-gray-600 text-xs md:text-sm">
            Page {currentPage} of {totalPages} • {(currentPage - 1) * PAGE_SIZE + (paged.length ? 1 : 0)}-
            {Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length}
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