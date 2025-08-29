import { TransctionIcon, CalendarIcon, CardIcon, LoadIcon, RightArrow } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { getTransactions } from "@/lib/api/transaction";

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

interface TransactionContentProps {
  activeStatus: string;
  setActiveStatus: (status: string) => void;
  searchQuery: string;
  onNewJob: () => void;
  // Optional external data (when parent already fetched)
  transactions?: Transaction[];
  loading?: boolean;
}

const PAGE_SIZE = 10;

function statusColor(status: string) {
  const s = status.toLowerCase();
  if (s === "pending") return "#FFC107";
  if (s === "completed") return "#22c55e";
  if (s === "cancelled") return "#ef4444";
  if (s === "refund") return "#007BFF";
  return "#FFC107";
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
  const [currentPage, setCurrentPage] = useState(1);
  const [meta, setMeta] = useState<{ page: number; totalPages: number; totalTransactions: number }>({
    page: 1,
    totalPages: 1,
    totalTransactions: 0,
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const usingExternal = externalTransactions !== undefined;

  // Internal fetch only if no external data supplied
  useEffect(() => {
    if (usingExternal) return;
    let ignore = false;
    (async () => {
      setLoading(true);
      try {
        const res = await getTransactions({ page: currentPage, limit: PAGE_SIZE });
        if (ignore) return;
        setTransactions(res.transactions || []);
        setMeta({
          page: res.page,
          totalPages: res.totalPages,
          totalTransactions: res.total || res.transactions?.length || 0,
        });
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, [currentPage, usingExternal]);

  // Sync meta when external data changes
  useEffect(() => {
    if (!usingExternal) return;
    setLoading(Boolean(externalLoading));
    setTransactions(externalTransactions || []);
    setMeta({
      page: 1,
      totalPages: 1,
      totalTransactions: externalTransactions?.length || 0,
    });
    setCurrentPage(1);
  }, [usingExternal, externalTransactions, externalLoading]);

  // Filter + search
  const filteredTransactions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return transactions.filter((tx) => {
      const matchesSearch =
        !q ||
        tx.id.toLowerCase().includes(q) ||
        tx.status.toLowerCase().includes(q) ||
        tx.job?.address?.toLowerCase().includes(q);
      const matchesStatus = activeStatus === "All" || tx.status.toLowerCase() === activeStatus.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [transactions, searchQuery, activeStatus]);

  return (
    // desktop-font applies only on large screens (see globals.css patch)
    <div className="flex flex-col h-full min-h-[calc(90vh-14px)] desktop-font">
      {/* Status Tabs (single row, scroll on mobile) */}
      <div
        className="flex gap-2 md:gap-5 mb-4 md:mb-8 overflow-x-auto lg:overflow-visible flex-nowrap hide-scrollbar
                    lg:flex-nowrap"
      >
        {STATUS_TABS.map((status) => (
          <Button
            key={status}
            onClick={() => {
              setActiveStatus(status);
              setCurrentPage(1);
            }}
            className={`rounded-full font-medium transition-all
              flex-shrink-0 text-center
              px-4 sm:px-6 py-1.5 sm:py-2.5 text-xs sm:text-sm
              lg:flex-1 lg:basis-0 lg:px-12 lg:py-5 lg:text-xl
              ${
                activeStatus === status
                  ? "bg-[#2A020D] hover:bg-[#4e1b29] text-white"
                  : "border border-[#2A020D] text-[#2A020D] bg-transparent hover:bg-[#FBEFF2]"
              }`}
              variant={activeStatus === status ? "default" : "outline"}
           >
             {status}
           </Button>
         ))}
       </div>

      {/* List */}
      <div className="flex-1 flex flex-col gap-3 md:gap-6 overflow-y-auto pr-1">
        {loading && <div className="text-center text-gray-500 py-8 md:py-10 text-sm md:text-base">Loading...</div>}
        {!loading && filteredTransactions.length === 0 && (
          <div className="text-center text-gray-500 py-8 md:py-10 text-sm md:text-base">No transactions found.</div>
        )}
        {!loading &&
          filteredTransactions.map((tx) => (
            <div
              key={tx.id}
              className="bg-[#FBEFF2] rounded-xl p-3 md:px-6 md:py-5 shadow border border-[#E6F9F3] hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-6">
                {/* Left */}
                <div className="flex items-center gap-3 md:gap-4 min-w-0">
                  <div className="w-11 h-11 md:w-14 md:h-14 bg-[#4e1b29] rounded-full flex items-center justify-center shrink-0">
                    <CardIcon width={26} height={26} className="md:w-[32px] md:h-[32px]" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-[#222] text-sm md:text-base truncate max-w-[170px] md:max-w-[300px] tx-heading">
                      {tx.id}
                    </div>
                    <div className="text-[#7B7B7B] text-[10px] md:text-xs tx-small">#{tx.job?.id}</div>
                  </div>
                </div>

                {/* Right chips & action */}
                <div className="flex flex-wrap md:flex-nowrap items-center justify-start md:justify-end gap-2 md:gap-3">
                  <span
                    className="font-semibold px-3 md:px-6 py-1 md:py-2 rounded-full text-xs md:text-base text-white"
                    style={{ backgroundColor: statusColor(tx.status) }}
                  >
                    + ${tx.amount}
                  </span>
                  <span className="flex items-center gap-1.5 md:gap-2 bg-[#FBEFF2] border border-[#2A020D] text-[#2A020D] rounded-full px-3 md:px-6 py-1 md:py-2 text-xs md:text-base font-medium">
                    <LoadIcon className="w-4 h-4 md:w-5 md:h-5" />
                    {tx.status}
                  </span>
                  <span className="flex items-center gap-1.5 md:gap-2 bg-[#FBEFF2] border border-[#2A020D] text-[#2A020D] rounded-full px-3 md:px-6 py-1 md:py-2 text-xs md:text-base font-medium">
                    <CalendarIcon className="w-4 h-4 md:w-5 md:h-5" />
                    {new Date(tx.created_at).toLocaleDateString()}
                  </span>
                  <Button
                    onClick={() => router.push(`/lender/transaction/${tx.id}`)}
                    variant="outline"
                    className="rounded-full px-3 md:px-6 py-1.5 md:py-2 bg-white text-[#2A020D] border-[#2A020D] font-medium flex items-center gap-1.5 md:gap-2 shadow-none text-xs md:text-base"
                  >
                    <RightArrow className="w-5 h-5 md:w-8 md:h-8" />
                    <span className="hidden sm:inline">View Details</span>
                    <span className="sm:hidden">View</span>
                  </Button>
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* Pagination */}
      {meta.totalTransactions > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 md:gap-3 pt-3 md:pt-4 mb-3 md:mb-4 text-xs md:text-sm">
          <div className="flex items-center gap-2 md:gap-3">
            <button
              className="px-3 md:px-4 py-1.5 md:py-2 rounded-lg border disabled:opacity-50"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={meta.page <= 1 || usingExternal}
            >
              Prev
            </button>
            <button
              className="px-3 md:px-4 py-1.5 md:py-2 rounded-lg border disabled:opacity-50"
              onClick={() => setCurrentPage((p) => Math.min(meta.totalPages, p + 1))}
              disabled={meta.page >= meta.totalPages || usingExternal}
            >
              Next
            </button>
          </div>
          <div className="text-gray-600 tx-small">
            Page {meta.page} / {meta.totalPages} • {filteredTransactions.length} shown
          </div>
        </div>
      )}

      {/* New Job Button */}
      <div className="w-full pb-5 md:pb-6">
        <Button
          onClick={onNewJob}
          className="w-full bg-[#2A020D] text-white py-5 md:py-7 px-5 md:px-8 rounded-lg font-medium hover:bg-[#4e1b29] transition-colors flex items-center justify-center gap-2 text-sm md:text-base"
        >
          <Plus size={18} className="md:hidden" />
          <Plus size={20} className="hidden md:inline" />
          New Job Request
        </Button>
      </div>
    </div>
  );
}
