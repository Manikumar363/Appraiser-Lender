"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/components/dashboard-layout";
import { CalendarIcon, CardIcon, LeftArrow, LoadIcon, ResidentialIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { getSingleTransaction } from "@/lib/api/transaction";

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
        <div className="w-full min-h-screen flex items-center justify-center text-gray-500">Loading...</div>
      </DashboardLayout>
    );
  }

  if (!transaction) {
    return (
      <DashboardLayout role="lender">
        <div className="w-full min-h-screen flex items-center justify-center text-gray-500">Transaction not found.</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="lender">
      <div className="flex flex-col h-full min-h-[calc(90vh-14px)]">
        {/* Back Button and Content */}
        <div className="flex-1">
          {/* Back Button */}
          <div className="flex items-center justify-between mb-6">
            <button
              className="w-10 h-10 flex items-center justify-center rounded-full shadow mb-4"
              onClick={() => router.back()}
              aria-label="Back"
            >
              <LeftArrow className="w-10 h-10" />
            </button>
            <h1 className="text-xl justify-between font-semibold text-gray-900">Job Details</h1>
          </div>

          {/* Transaction Details */}
          {/* Transaction Card */}
          <div className="flex items-center justify-between bg-cyan-50 rounded-2xl px-6 py-5 shadow border border-[#E6F9F3] mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-[#0066B2] rounded-full flex items-center justify-center">
                <CardIcon width={32} height={32} />
              </div>
              <div>
                <div className="font-semibold text-[#222] text-base truncate max-w-[300px]">{transaction.id}</div>
                <div className="text-[#7B7B7B] text-xs">#{transaction.job?.id}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span
                className="font-semibold px-6 py-2 rounded-full text-base text-white transition-colors cursor-pointer hover:brightness-110"
                style={{
                  backgroundColor:
                    transaction.status?.toLowerCase() === "pending"
                      ? "#FFC107"
                      : transaction.status?.toLowerCase() === "completed"
                      ? "#00F90A"
                      : transaction.status?.toLowerCase() === "cancelled"
                      ? "#FD5D2D"
                      : transaction.status?.toLowerCase() === "refund"
                      ? "#007BFF"
                      : "#FFC107",
                }}
              >
                + $ {transaction.amount}
              </span>
              <span className="flex items-center gap-2 bg-[#0066B2] text-white rounded-full px-6 py-2 font-medium transition-colors cursor-pointer hover:bg-[#014F9D]">
                <LoadIcon className="w-5 h-5" />
                {transaction.status}
              </span>
              <span className="flex items-center gap-2 bg-cyan-50 border border-[#0066B2] text-[#0066B2] rounded-full px-6 py-2 font-medium transition-all duration-150 cursor-pointer hover:bg-[#e0f2fe] hover:border-[#014F9D]">
                <CalendarIcon className="w-5 h-5" />
                {new Date(transaction.created_at).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-2 bg-white border border-[#0066B2] text-[#0066B2] rounded-full px-6 py-2 font-medium transition-all duration-150 cursor-pointer hover:bg-[#e0f2fe] hover:border-[#014F9D]">
                <ResidentialIcon className="w-5 h-5" />
                {transaction.job?.address}
              </span>
            </div>
          </div>

          {/* Payment Section */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Payment Section</h2>
            <div className="flex items-center justify-between bg-cyan-100 rounded-2xl px-6 py-6 shadow border border-[#E6F9F3]">
              {/* Left: Logo and Title */}
              <div className="flex items-center gap-4">
                {transaction.card_details?.brand === "visa" ? (
                  <img
                    src="/visa.png"
                    alt="Visa Logo"
                    className="w-14 h-14 rounded-full object-contain bg-white"
                  />
                ) : transaction.card_details?.brand === "mastercard" ? (
                  <img
                    src="/mastercard.png"
                    alt="Mastercard Logo"
                    className="w-14 h-14 rounded-full object-contain bg-white"
                  />
                ) : (
                  <img
                    src="/images/mastercard.png"
                    alt="Mastercard Logo"
                    className="w-14 h-14 rounded-full object-contain bg-white"
                  />
                )}
                <div>
                  <div className="font-semibold text-lg text-[#222]">
                    {transaction.card?.type}
                  </div>
                  <div className="text-[#7B7B7B] text-base mt-2">
                    Transaction ID :<br />
                    Reference Number<br />
                    Payment Date
                  </div>
                </div>
              </div>
              {/* Right: Card, IDs, Date */}
              <div className="flex flex-col items-end gap-2">
                <span className="bg-[#1e5ba8] text-white rounded-full px-6 py-2 font-semibold text-base mb-2">
                  {transaction.card_details ? `****${transaction.card_details.last4}` : ""}
                </span>
                <div className="text-[#222] text-base">{transaction.id}</div>
                <div className="text-[#222] text-base">
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
                <div className="text-[#222] text-base">
                  {new Date(transaction.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Download Receipt Button at the very bottom */}
        <div className="w-full pb-8 ">
          {transaction.invoice ? (
            <a
              href={transaction.invoice}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full"
            >
              <Button className="w-full bg-[#014F9D] text-white py-7 px-8 rounded-lg font-large hover:bg-[#1a4f96] transition-colors flex items-center justify-center gap-2">
                Download Receipt
              </Button>
            </a>
          ) : (
            <Button
              className="w-full bg-[#1e5ba8] text-white py-7 px-8 rounded-lg font-large hover:bg-[#1a4f96]  transition-colors flex items-center justify-center gap-2 cursor-not-allowed"
              
            >
              Download Receipt
            </Button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}