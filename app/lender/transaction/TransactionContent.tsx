import { TransctionIcon, CalendarIcon, CardIcon, LoadIcon, RightArrow } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { getTransactions } from "@/lib/api/transaction";
import { useGlobalSearch } from '@/components/search-context';

interface Transaction {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  job: {
    id: string;
    address: string;
    payment_status: string;
  };
}

const STATUS_TABS = ["All", "Pending", "Completed", "Cancelled"];
const PAGE_SIZE = 10;

function statusColor(status: string) {
  const s = status.toLowerCase();
  if (s === "pending") return "#FFC107";
  if (s === "completed") return "#22c55e";
  if (s === "cancelled") return "#ef4444";
  if (s === "refund") return "#007BFF";
  return "#FFC107";
}

interface TransactionContentProps {
  activeStatus: string;
  setActiveStatus: (status: string) => void;
  searchQuery?: string;
  onNewJob: () => void;
  transactions?: Transaction[];
  loading?: boolean;
}

export default function TransactionContent(props: TransactionContentProps) {
  const {
    activeStatus,
    setActiveStatus,
    searchQuery,
    onNewJob,
    transactions: externalTransactions,
    loading: externalLoading,
  } = props;

  const router = useRouter();
  const { search } = useGlobalSearch();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  // Remove duplicate state: activeStatus and setActiveStatus are provided via props

  const [debounced, setDebounced] = useState(search);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim().toLowerCase()), 180);
    return () => clearTimeout(t);
  }, [search]);

  // Reset page when search or status changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debounced, activeStatus]);

  // Internal fetch (only if not externally supplied)
  useEffect(() => {
    let ignore = false;
    (async () => {
      setLoading(true);
      try {
        const res = await getTransactions({ page: 1, limit: 500 });
        if (!ignore) setTransactions(res.transactions || []);
      } catch {
        if (!ignore) setTransactions([]);
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, []);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      if (activeStatus !== 'All' && tx.status.toLowerCase() !== activeStatus.toLowerCase())
        return false;
      if (!debounced) return true;
      const d = debounced;
      return (
        tx.id.toLowerCase().includes(d) ||
        tx.status.toLowerCase().includes(d) ||
        (tx.job?.address || '').toLowerCase().includes(d) ||
        (tx.job?.id || '').toLowerCase().includes(d) ||
        String(tx.amount).toLowerCase().includes(d)
      );
    });
  }, [transactions, debounced, activeStatus]);

  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / PAGE_SIZE));
  const paged = filteredTransactions.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className="flex flex-col h-full min-h-[calc(90vh-14px)] desktop-font">
      {/* Status Tabs */}
      <div
        className="
          flex flex-nowrap gap-2 mb-4 overflow-x-auto hide-scrollbar
          sm:justify-center
          md:grid md:grid-cols-4 md:gap-4 md:overflow-visible
          xl:mb-10
        "
        role="tablist"
        aria-label="Transaction status"
      >
        {STATUS_TABS.map(status => {
          const active = activeStatus === status;
          return (
            <Button
              key={status}
              role="tab"
              aria-selected={active}
              onClick={() => {
                setActiveStatus(status);
                // page reset already handled by effect, but safe:
                setCurrentPage(1);
              }}
              className={`
                rounded-full font-medium transition-all
                flex-shrink-0 text-center
                px-4 py-1.5 text-xs
                sm:px-5 sm:py-2 sm:text-sm
                md:w-full md:px-4 md:py-2 md:text-sm
                lg:h-16 lg:text-base lg:font-semibold
                ${active
                  ? "bg-[#2A020D] hover:bg-[#4e1b29] text-white"
                  : "border border-[#2A020D] text-[#2A020D] bg-white hover:bg-[#FBEFF2]"}
              `}
              variant={active ? "default" : "outline"}
            >
              {status}
            </Button>
          );
        })}
      </div>

      {/* List */}
      <div className="flex-1 flex flex-col gap-3 sm:gap-4 md:gap-5 overflow-y-auto pr-1 px-1 md:px-4">
        {loading && (
          <div className="text-center text-gray-500 py-8 sm:py-10 text-sm md:text-base">
            Loading...
          </div>
        )}
        {!loading && paged.length === 0 && (
          <div className="text-center text-gray-500 py-8 sm:py-10 text-sm md:text-base">
            No transactions found.
          </div>
        )}

        {!loading &&
          paged.map(tx => {
            const statusBg = statusColor(tx.status);
            return (
              <div
                key={tx.id}
                className="
                  bg-[#FBEFF2] rounded-xl
                  p-3 sm:p-4 md:px-5 md:py-5
                  shadow border border-[#E6F9F3]
                  hover:shadow-md transition-shadow
                "
              >
                <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3 xl:gap-6">
                  {/* Left */}
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <div className="
                     w-10 h-10 sm:w-12 sm:h-12 md:w-12 md:h-12 lg:w-14 lg:h-14
                      bg-[#4e1b29] rounded-full flex items-center justify-center shrink-0
                    ">
                      <CardIcon width={24} height={24} className="sm:w-[26px] sm:h-[26px] md:w-[28px] md:h-[28px] lg:w-[32px] lg:h-[32px]" />
                    </div>
                    <div className="min-w-0">
                      <div className="
                        font-semibold text-[#222] truncate
                        text-sm sm:text-base
                       max-w-[150px] sm:max-w-[240px] md:max-w-[360px] lg:max-w-[300px]
                      ">
                        {tx.id}
                      </div>
                      <div className="hidden sm:block text-[11px] sm:text-xs text-gray-600 truncate max-w-[220px] md:max-w-[360px] lg:max-w-[300px] mt-0.5">
                        {tx.job?.address}
                      </div>
                    </div>
                  </div>

                  {/* Right chips & action */}
                  <div className="
                   flex flex-wrap xl:flex-nowrap items-center justify-start xl:justify-end
                   gap-2 sm:gap-2.5 md:gap-2.5 xl:gap-3
                  ">
                    <span
                      className="
                        font-semibold text-white rounded-full
                        px-2.5 py-1 text-[11px]
                        sm:px-4 sm:py-1.5 sm:text-xs
                       md:px-5 md:py-1.5 md:text-sm
                        xl:px-6 xl:py-2 xl:text-base
                      "
                      style={{ backgroundColor: statusBg }}
                    >
                      + ${tx.amount}
                    </span>

                    <span className="
                      flex items-center gap-1.5
                      bg-[#FBEFF2] border border-[#2A020D] text-[#2A020D]
                      rounded-full
                      px-2.5 py-1 text-[11px]
                      sm:px-4 sm:py-1.5 sm:text-xs
                     md:px-5 md:py-1.5 md:text-sm font-medium
                      xl:px-6 xl:py-2 xl:text-base
                    ">
                      <LoadIcon className="w-4 h-4 md:w-5 md:h-5" />
                      {tx.status}
                    </span>

                    <span className="
                      flex items-center gap-1.5
                      bg-[#FBEFF2] border border-[#2A020D] text-[#2A020D]
                      rounded-full
                      px-2.5 py-1 text-[11px]
                      sm:px-4 sm:py-1.5 sm:text-xs
                     md:px-5 md:py-1.5 md:text-sm font-medium
                      xl:px-6 xl:py-2 xl:text-base
                    ">
                      <CalendarIcon className="w-4 h-4 md:w-5 md:h-5" />
                      {new Date(tx.created_at).toLocaleDateString()}
                    </span>

                    <Button
                      onClick={() => router.push(`/lender/transaction/${tx.id}`)}
                      variant="outline"
                      className="
                        rounded-full bg-white text-[#2A020D] border-[#2A020D]
                        flex items-center gap-1.5
                        px-3 py-1.5 text-xs
                        sm:px-4 sm:py-2 sm:text-sm
                        md:px-5 md:py-2 md:text-sm font-medium shadow-none
                        xl:px-6 xl:text-base
                        hover:bg-[#FBEFF2]
                      "
                    >
                      <RightArrow className="w-5 h-5 md:w-6 md:h-6 xl:w-7 xl:h-7" />
                      <span className="hidden sm:inline">View Details</span>
                      <span className="sm:hidden">View</span>
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="
          flex flex-col sm:flex-row items-center justify-between
          gap-2 sm:gap-3 pt-3 sm:pt-4 mb-3 sm:mb-4
          text-[11px] sm:text-xs md:text-sm
        ">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg border bg-white hover:bg-[#FBEFF2] disabled:opacity-50"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
            >
              Prev
            </button>
            <button
              className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg border bg-white hover:bg-[#FBEFF2] disabled:opacity-50"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
            >
              Next
            </button>
          </div>
          <div className="text-gray-600">
            Page {currentPage} / {totalPages} • {filteredTransactions.length} shown
          </div>
        </div>
      )}

      {/* New Job Button */}
      <div className="w-full pb-5 sm:pb-6">
        <Button
          onClick={onNewJob}
          className="
            w-full bg-[#2A020D] text-white
            py-5 sm:py-6 md:py-7 px-5 sm:px-6 md:px-8
            rounded-lg font-medium
            hover:bg-[#4e1b29] transition-colors
            flex items-center justify-center gap-2
            text-sm sm:text-base
          "
        >
          <Plus size={18} className="sm:hidden" />
          <Plus size={20} className="hidden sm:inline" />
          New Job Request
        </Button>
      </div>
    </div>
  );
}
