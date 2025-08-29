"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/components/dashboard-layout";
import {
  CalendarIcon,
  CardIcon,
  LeftArrow,
  LoadIcon,
  ResidentialIcon,
} from "@/components/icons";
import { Button } from "@/components/ui/button";
import { getSingleTransaction } from "@/lib/api/transaction";

function getCityCountry(address: string) {
  const parts = address.split(",").map((part) => part.trim());
  if (parts.length >= 3) {
    return parts[2] + ", " + parts[parts.length - 1];
  }
  return address;
}

export default function TransactionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [transaction, setTransaction] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTransaction() {
      setLoading(true);
      try {
        const data = await getSingleTransaction(id);
        setTransaction(data.transaction);
      } catch (err) {
        // handle error
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchTransaction();
  }, [id]);

  if (loading) {
    return (
      <DashboardLayout role="lender">
        <div className="w-full min-h-screen flex items-center justify-center text-gray-500">
          Loading...
        </div>
      </DashboardLayout>
    );
  }

  if (!transaction) {
    return (
      <DashboardLayout role="lender">
        <div className="w-full min-h-screen flex items-center justify-center text-gray-500">
          Transaction not found.
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="lender">
      <div className="flex flex-col h-full min-h-[calc(90vh-14px)]">
        {/* Back Button and Title */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <button
              className="w-10 h-10 flex items-center justify-center rounded-full shadow mb-4"
              onClick={() => router.back()}
              aria-label="Back"
            >
              <LeftArrow className="w-10 h-10" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900">
              Job Details
            </h1>
          </div>

          {/* Transaction Card */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-[#FBEFF2] rounded-2xl px-4 md:px-6 py-5 shadow border border-[#E6F9F3] mb-6 gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-[#4e1b29] rounded-full flex items-center justify-center">
                <CardIcon width={32} height={32} />
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-[#222] text-base break-all">
                  {transaction.id}
                </div>
                <div className="text-[#7B7B7B] text-xs">
                  #{transaction.job?.id}
                </div>
              </div>
            </div>

            {/* badges */}
            <div className="flex flex-wrap gap-2">
              <span
                className="font-semibold px-4 py-2 rounded-full text-sm md:text-base text-white"
                style={{
                  backgroundColor:
                    transaction.status?.toLowerCase() === "pending"
                      ? "#FFC107"
                      : transaction.status?.toLowerCase() === "completed"
                      ? "#00F90A"
                      : transaction.status?.toLowerCase() === "cancelled"
                      ? "#FD5D2D"
                      : "#007BFF",
                }}
              >
                + $ {transaction.amount}
              </span>

              <span className="flex items-center gap-1 bg-[#FBEFF2] text-[#2A020D] border border-[#2A020D] rounded-full px-3 py-1 text-sm">
                <LoadIcon className="w-4 h-4" />
                {transaction.status}
              </span>

              <span className="flex items-center gap-1 bg-[#FBEFF2] border border-[#2A020D] text-[#2A020D] rounded-full px-3 py-1 text-sm">
                <CalendarIcon className="w-4 h-4" />
                {new Date(transaction.created_at).toLocaleDateString()}
              </span>

              <span className="flex items-center gap-1 bg-[#FBEFF2] border border-[#2A020D] text-[#2A020D] rounded-full px-3 py-1 text-sm break-all max-w-[180px] md:max-w-none">
                <ResidentialIcon className="w-4 h-4" />
                {getCityCountry(transaction.job?.address)}
              </span>
            </div>
          </div>

          {/* Payment Section */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Payment Section</h2>
            <div className="flex flex-col md:flex-row md:items-start md:justify-between bg-[#FBEFF2] rounded-2xl px-4 md:px-6 py-6 shadow border border-[#E6F9F3] gap-4">
              {/* Left */}
              <div className="flex items-start gap-3 w-full md:w-2/3">
                <img
                  src={
                    transaction.card_details?.brand === "visa"
                      ? "/images/visa.png"
                      : "/images/master-card3.png"
                  }
                  alt="Card Logo"
                  className="w-12 h-12 object-contain"
                />
                <div className="min-w-0">
                  <div className="font-semibold text-base md:text-lg text-[#222] break-all">
                    {transaction.job?.address || "Residential Appraisal"}
                  </div>
                  <div className="text-[#7B7B7B] text-sm md:text-base mt-1 break-all">
                    Transaction ID : {transaction.id}
                    <br />
                    Reference Number: {transaction.payment_id || "N/A"}
                    <br />
                    Payment Date:{" "}
                    {transaction.updated_at
                      ? new Date(transaction.updated_at).toLocaleDateString()
                      : "N/A"}
                  </div>
                </div>
              </div>

              {/* Right */}
              <div className="flex flex-col items-start md:items-end gap-2 w-full md:w-1/3 break-all">
                <span className="bg-[#2A020D] text-white rounded-full px-4 py-2 font-semibold text-sm md:text-base">
                  {transaction.card_details
                    ? `****${transaction.card_details.last4}`
                    : ""}
                </span>
                <div className="text-[#222] text-sm md:text-base break-all">
                  {transaction.id}
                </div>
                <div className="text-[#222] text-sm md:text-base">
                  {transaction.invoice ? (
                    <a
                      href={transaction.invoice}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline text-blue-700"
                    >
                      View Invoice
                    </a>
                  ) : (
                    "No Invoice"
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Download Receipt */}
        <div className="w-full pb-8">
          {transaction.invoice ? (
            <a
              href={transaction.invoice}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full"
            >
              <Button className="w-full bg-[#2A020D] text-white py-7 px-8 rounded-lg hover:bg-[#4e1b29] transition-colors flex items-center justify-center gap-2">
                Download Receipt
              </Button>
            </a>
          ) : (
            <Button
              className="w-full bg-[#2A020D] text-white py-7 px-8 rounded-lg hover:bg-[#4e1b29] transition-colors flex items-center justify-center gap-2 cursor-not-allowed"
            >
              Download Receipt
            </Button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
