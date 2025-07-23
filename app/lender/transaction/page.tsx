"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard-layout";
import { TransctionIcon, CalendarIcon, CardIcon, LoadIcon, RightArrow } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
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

export default function TransactionPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState<string>("All");
  const router = useRouter();

  useEffect(() => {
    async function fetchTransactions() {
      setLoading(true);
      try {
        const params: any = { page: 1, limit: 10 };
        if (activeStatus !== "All") params.status = activeStatus;
        const data = await getTransactions(params);
        setTransactions(data.transactions);
      } catch (err) {
        // handle error
      } finally {
        setLoading(false);
      }
    }
    fetchTransactions();
  }, [activeStatus]);

  return (
    <DashboardLayout role="lender">
      <div className="flex flex-col h-full min-h-[calc(90vh-14px)]">
        {/* Filter Tabs */}
        <div className="flex gap-4 mb-8">
          {STATUS_TABS.map((status) => (
            <Button
              key={status}
              onClick={() => setActiveStatus(status)}
              className={`rounded-full w-full py-2 font-semibold shadow-none ${
                activeStatus === status
                  ? "bg-[#014F9D] hover:bg-blue-800 text-white"
                  : "border-[#014F9D] text-[#014F9D] hover:bg-blue-50 bg-transparent border"
              }`}
              variant={activeStatus === status ? "default" : "outline"}
            >
              {status}
            </Button>
          ))}
        </div>

        {/* Transaction List */}
        <div className="flex flex-col gap-6 pb-32">
          {loading ? (
            <div className="text-center text-gray-500 py-10">Loading...</div>
          ) : transactions.length === 0 ? (
            <div className="text-center text-gray-500 py-10">No transactions found.</div>
          ) : (
            transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center bg-cyan-50 rounded-2xl px-6 py-5 shadow border border-[#E6F9F3] hover:shadow-md transition-shadow"
              >
                {/* Left: Icon and IDs */}
                <div className="flex items-center gap-4 min-w-[350px]">
                  <div className="w-14 h-14 bg-[#0066B2] rounded-full flex items-center justify-center">
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
                          ? "#FFC107" // orange
                          : tx.status.toLowerCase() === "completed"
                          ? "#00F90A" // green
                          : tx.status.toLowerCase() === "cancelled"
                          ? "#FD5D2D" // red
                          : tx.status.toLowerCase() === "refund"
                          ? "#007BFF" // blue
                          : "#FFC107", // default
                    }}
                  >
                    + $ {tx.amount}
                  </span>
                  <span className={`flex items-center gap-2 bg-cyan-50 border border-[#0066B2] text-[#0066B2] rounded-full px-6 py-2 font-medium transition-colors cursor-pointer hover:brightness-110`}>
                    <LoadIcon className="w-5 h-5" />
                    {tx.status}
                  </span>
                  <span className="flex items-center gap-2 bg-cyan-50 border border-[#0066B2] text-[#0066B2] rounded-full px-6 py-2 font-medium transition-colors cursor-pointer hover:brightness-110">
                    <CalendarIcon className="w-5 h-5" />
                    {new Date(tx.created_at).toLocaleDateString()}
                  </span>
                  <Button
                    onClick={() => router.push(`/lender/transaction/${tx.id}`)}
                    variant="outline"
                    className="rounded-full px-6 py-2 bg-white text-[#0066B2] border-[#0066B2] font-medium flex items-center gap-2 shadow-none transition-colors cursor-pointer hover:brightness-110"
                  >
                    <RightArrow className="w-8 h-8" />
                    View Details
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* New Job Request Button fixed at bottom */}
        <div className="w-full pb-8">
          <Button
            onClick={() => router.push(`/lender/dashboard/new`)}
            className="w-full bg-[#1e5ba8] text-white py-6 px-8 rounded-lg font-medium hover:bg-[#1a4f96] transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={20} /> New Job Request
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}