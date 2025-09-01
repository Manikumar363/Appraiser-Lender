"use client";

import { useEffect, useState, useCallback } from "react";
import { JobCard } from "../../../components/job-card";
import { useRouter, useSearchParams } from "next/navigation";
import { getMyJobsPaginated, Job } from "@/lib/api/jobs1";
import { Plus } from "lucide-react";
import { useGlobalSearch } from "@/components/search-context";

interface DashboardContentProps {
  ts?: string;
}

/**
 * Your backend types earlier rejected a `search` param, so we assume
 * server search is NOT supported and implement reliable client-side search.
 * We only request one page normally; when searching we fetch multiple pages (up to a cap),
 * then filter in memory and paginate client-side.
 */
const SERVER_SEARCH_SUPPORTED = false;
const PAGE_SIZE = 10;
const MAX_SEARCH_PAGES = 25; // safety cap (25 * 10 = 250 jobs fetched when searching)

export default function DashboardContent({ ts = "" }: DashboardContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { search } = useGlobalSearch();

  const initialPage = (() => {
    const p = Number(searchParams.get("page") || "1");
    return Number.isFinite(p) && p > 0 ? p : 1;
  })();

  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [allJobs, setAllJobs] = useState<Job[]>([]);          // full dataset (all pages when searching; one page otherwise)
  const [serverMeta, setServerMeta] = useState<{ page: number; totalPages: number; totalJobs: number }>({
    page: 1,
    totalPages: 1,
    totalJobs: 0
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState("");

  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim().toLowerCase()), 220);
    return () => clearTimeout(t);
  }, [search]);

  // Keep URL (page & q) in sync (q only for persistence)
  const updateUrl = useCallback(
    (page: number, q: string) => {
      const sp = new URLSearchParams(Array.from(searchParams.entries()));
      sp.set("page", String(page));
      if (q) sp.set("q", q); else sp.delete("q");
      router.replace(`/lender/dashboard?${sp.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  // Fetch one page (no search) OR all pages needed (search mode)
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      if (debouncedSearch && !SERVER_SEARCH_SUPPORTED) {
        // SEARCH MODE (client-side)
        const aggregated: Job[] = [];
        let page = 1;
        while (page <= MAX_SEARCH_PAGES) {
          const res = await getMyJobsPaginated({ page, limit: PAGE_SIZE });
          const list: Job[] = res.jobs || [];
            if (list.length === 0) break;
          aggregated.push(...list);
          const totalPages = res.totalPages || Math.ceil((res.total_jobs || aggregated.length) / PAGE_SIZE) || 1;
          if (page >= totalPages) break;
          page++;
        }
        setAllJobs(aggregated);
        setServerMeta({
          page: 1,
          totalPages: Math.max(1, Math.ceil(aggregated.length / PAGE_SIZE)),
          totalJobs: aggregated.length
        });
      } else {
        // NORMAL MODE (no search OR server-side search)
        const args: any = { page: currentPage, limit: PAGE_SIZE };
        if (SERVER_SEARCH_SUPPORTED && debouncedSearch) {
          args.search = debouncedSearch; // only if backend supports (we assumed false)
          args.status = "All";
        }
        const res = await getMyJobsPaginated(args);
        const list: Job[] = res.jobs || [];
        setAllJobs(list);
        setServerMeta({
          page: currentPage,
          totalPages: res.totalPages || 1,
          totalJobs: res.total_jobs ?? list.length
        });
      }
    } catch (err: any) {
      console.error("Fetch jobs error:", err);
      setAllJobs([]);
      setServerMeta({ page: 1, totalPages: 1, totalJobs: 0 });
      setError("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch]);

  // Initial & ts trigger
  useEffect(() => {
    fetchData();
  }, [fetchData, ts]);

  // When search term changes:
  useEffect(() => {
    // Reset to page 1
    setCurrentPage(1);
    updateUrl(1, debouncedSearch);
    fetchData();
  }, [debouncedSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  // When page changes (only relevant when NOT in client search mode)
  useEffect(() => {
    if (debouncedSearch && !SERVER_SEARCH_SUPPORTED) {
      // pagination handled client-side over aggregated array
      updateUrl(currentPage, debouncedSearch);
      return;
    }
    fetchData();
    updateUrl(currentPage, debouncedSearch);
  }, [currentPage]); // eslint-disable-line react-hooks/exhaustive-deps

  // Derive filtered (client search if server unsupported)
  const filteredJobs = (() => {
    if (!debouncedSearch || SERVER_SEARCH_SUPPORTED) return allJobs;
    const q = debouncedSearch;
    return allJobs.filter(j =>
      [j.intended_username, j.address, j.job_status, j.id]
        .some(v => (v || "").toLowerCase().includes(q))
    );
  })();

  // Decide pagination source
  const totalJobs = debouncedSearch && !SERVER_SEARCH_SUPPORTED
    ? filteredJobs.length
    : serverMeta.totalJobs;

  const totalPages = debouncedSearch && !SERVER_SEARCH_SUPPORTED
    ? Math.max(1, Math.ceil(totalJobs / PAGE_SIZE))
    : serverMeta.totalPages;

  const effectivePage = Math.min(currentPage, totalPages);

  const pagedJobs = debouncedSearch && !SERVER_SEARCH_SUPPORTED
    ? filteredJobs.slice((effectivePage - 1) * PAGE_SIZE, effectivePage * PAGE_SIZE)
    : filteredJobs; // when not in client search, filteredJobs == one page from server

  const showingStart = totalJobs === 0 ? 0 : (effectivePage - 1) * PAGE_SIZE + 1;
  const showingEnd = debouncedSearch && !SERVER_SEARCH_SUPPORTED
    ? Math.min(effectivePage * PAGE_SIZE, totalJobs)
    : Math.min(serverMeta.page * PAGE_SIZE, totalJobs);

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    setCurrentPage(page);
    // fetchData triggered by effect (if needed)
  };

  const handleNewJobRequest = () => router.push("/lender/dashboard/new");

  return (
    <div className="flex flex-col h-full min-h-[calc(90vh-14px)]">
      <div className="flex-1">
        <div className="space-y-4 mb-8">
          {loading && <div>Loading...</div>}
          {error && <div className="text-red-500">{error}</div>}
          {!loading && !error && pagedJobs.length === 0 && (
            <div className="text-gray-500 text-center py-8 text-lg font-medium">
              No results found
            </div>
          )}
          {pagedJobs.map(job => (
            <div
              key={job.id}
              className="cursor-pointer"
              onClick={() => router.push(`/lender/jobs/${job.id}`)}
            >
              <JobCard
                title={job.intended_username}
                location={job.address}
                jobStatus={job.job_status}
              />
            </div>
          ))}
        </div>
      </div>

      {!loading && !error && totalJobs > 0 && (
        <div className="flex items-center justify-between pt-4 pb-4">
          <button
            className="px-4 py-2 rounded-lg border text-sm disabled:opacity-50"
            onClick={() => goToPage(effectivePage - 1)}
            disabled={effectivePage <= 1}
          >
            Previous
          </button>
          <div className="text-sm text-gray-600">
            Page {effectivePage} of {totalPages} • Showing {showingStart}-{showingEnd} of {totalJobs}
          </div>
          <button
            className="px-4 py-2 rounded-lg border text-sm disabled:opacity-50"
            onClick={() => goToPage(effectivePage + 1)}
            disabled={effectivePage >= totalPages}
          >
            Next
          </button>
        </div>
      )}

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