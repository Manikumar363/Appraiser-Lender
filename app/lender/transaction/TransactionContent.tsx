import { TransctionIcon, CalendarIcon, CardIcon, LoadIcon, RightArrow } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
}

const PAGE_SIZE = 10;

export default function TransactionContent({
  activeStatus,
  setActiveStatus,
  searchQuery,
  onNewJob,
}: TransactionContentProps) {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [meta, setMeta] = useState<{ page: number; totalPages: number; totalTransactions: number }>({
    page: 1,
    totalPages: 1,
    totalTransactions: 0,
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter transactions by searchQuery
  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.job?.address?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      activeStatus === "All" || tx.status.toLowerCase() === activeStatus.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  
  useEffect(() => {
    async function fetchTransactions() {
      setLoading(true);
      const res = await getTransactions({
        page: currentPage,
        limit: PAGE_SIZE,
      });
      setTransactions(res.transactions || []);
      setMeta({
        page: res.page,
        totalPages: res.totalPages,
        totalTransactions: res.transactions?.length ?? 0,
      });
      setLoading(false);
    }
    fetchTransactions();
  }, [currentPage, activeStatus, searchQuery]);

  return (
    <div className="flex flex-col h-full min-h-[calc(90vh-14px)]">
      {/* Filter Tabs */}
      <div className="flex gap-4 mb-8">
        {STATUS_TABS.map((status) => (
          <Button
            key={status}
            onClick={() => setActiveStatus(status)}
            className={`rounded-full w-full py-2 font-semibold shadow-none ${
              activeStatus === status
                ? "bg-[#2A020D] hover:bg-[#4e1b29] text-white"
                : "border-[#2A020D] text-[#2A020D] hover:bg-[#FBEFF2] bg-transparent border"
            }`}
            variant={activeStatus === status ? "default" : "outline"}
          >
            {status}
          </Button>
        ))}
      </div>

      {/* Transaction List */}
      <div className="flex-1 flex flex-col gap-6">
        {loading ? (
          <div className="text-center text-gray-500 py-10">Loading...</div>
        ) : filteredTransactions.length === 0 ? (
          <div className="text-center text-gray-500 py-10">No transactions found.</div>
        ) : (
          filteredTransactions.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center bg-[#FBEFF2] rounded-2xl px-6 py-5 shadow border border-[#E6F9F3] hover:shadow-md transition-shadow"
            >
              {/* Left: Icon and IDs */}
              <div className="flex items-center gap-4 min-w-[350px]">
                <div className="w-14 h-14 bg-[#4e1b29] rounded-full flex items-center justify-center">
                  <CardIcon width={32} height={32} />
                </div>
                <div>
                  <div className="font-semibold text-[#222] text-base truncate max-w-[300px]">{tx.id}</div>
                  <div className="text-[#7B7B7B] text-xs">#{tx.job?.id}</div>
                </div>
              </div>

              {/* Right: All details and View Details button in a single row, no gap */}
              <div className="flex-1 flex items-center justify-end space-x-4 flex-wrap md:flex-nowrap">
                <span
                  className="font-semibold px-6 py-2 rounded-full text-base text-white transition-colors cursor-pointer hover:brightness-110"
                  style={{
                    backgroundColor:
                      tx.status.toLowerCase() === "pending"
                        ? "#FFC107"
                        : tx.status.toLowerCase() === "completed"
                        ? "#00F90A"
                        : tx.status.toLowerCase() === "cancelled"
                        ? "#FD5D2D"
                        : tx.status.toLowerCase() === "refund"
                        ? "#007BFF"
                        : "#FFC107",
                  }}
                >
                  + $ {tx.amount}
                </span>
                <span className={`flex items-center gap-2 bg-[#FBEFF2] border border-[#2A020D] text-[#2A020D] rounded-full px-6 py-2 font-medium transition-colors cursor-pointer hover:brightness-110`}>
                  <LoadIcon className="w-5 h-5" />
                  {tx.status}
                </span>
                <span className="flex items-center gap-2 bg-[#FBEFF2] border border-[#2A020D] text-[#2A020D] rounded-full px-6 py-2 font-medium transition-colors cursor-pointer hover:brightness-110">
                  <CalendarIcon className="w-5 h-5" />
                  {new Date(tx.created_at).toLocaleDateString()}
                </span>
                <Button
                  onClick={() => router.push(`/lender/transaction/${tx.id}`)}
                  variant="outline"
                  className="rounded-full px-6 py-2 bg-white text-[#2A020D] border-[#2A020D] font-medium flex items-center gap-2 shadow-none transition-colors cursor-pointer hover:brightness-110"
                >
                  <RightArrow className="w-8 h-8" />
                  View Details
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination Controls */}
      {meta.totalTransactions > 0 && (
        <div className="flex items-center justify-between pt-4 mb-4">
          <button
            className="px-4 py-2 rounded-lg border text-sm disabled:opacity-50"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={meta.page <= 1}
          >
            Previous
          </button>
          <div className="text-sm text-gray-600">
            Page {meta.page} of {meta.totalPages} • Showing {(meta.page - 1) * PAGE_SIZE + (transactions.length ? 1 : 0)}-
            {Math.min(meta.page * PAGE_SIZE, meta.totalTransactions)} of {meta.totalTransactions}
          </div>
          <button
            className="px-4 py-2 rounded-lg border text-sm disabled:opacity-50"
            onClick={() => setCurrentPage((p) => Math.min(meta.totalPages, p + 1))}
            disabled={meta.page >= meta.totalPages}
          >
            Next
          </button>
        </div>
      )}

      {/* New Job Request Button fixed at bottom */}
      <div className="w-full pb-8">
        <Button
          onClick={onNewJob}
          className="w-full bg-[#2A020D] text-white py-7 px-8 rounded-lg font-medium hover:bg-[#4e1b29] transition-colors flex items-center justify-center gap-2"
        >
          <Plus size={20} /> New Job Request
        </Button>
      </div>
    </div>
  );
}
