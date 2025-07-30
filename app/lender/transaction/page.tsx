"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard-layout";
import TransactionContent from "./TransactionContent";
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

interface TransactionPageProps {
  searchQuery?: string;
}

export default function TransactionPage({ searchQuery = "" }: TransactionPageProps) {
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
      <TransactionContent
        transactions={transactions}
        loading={loading}
        activeStatus={activeStatus}
        setActiveStatus={setActiveStatus}
        searchQuery={searchQuery}
        onNewJob={() => router.push(`/lender/dashboard/new`)}
      />
    </DashboardLayout>
  );
}