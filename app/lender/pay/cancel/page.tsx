"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export const dynamic = "force-dynamic";

function CancelContent() {
  const router = useRouter();
  const params = useSearchParams();
  const jobId = params.get("jobId") || "";
  const status = params.get("redirect_status") || "canceled";

  useEffect(() => {
    const t = setTimeout(() => {
      if (jobId) router.replace(`/lender/jobs/${jobId}`);
      else router.replace("/lender/dashboard");
    }, 1500);
    return () => clearTimeout(t);
  }, [jobId, router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-6 text-center shadow">
        <h1 className="text-xl font-semibold mb-2 text-red-700">Payment Canceled</h1>
        <p className="text-gray-600 mb-4">
          {status === "requires_payment_method"
            ? "Authentication failed or was canceled."
            : "Your payment was canceled."}
        </p>
        <button
          onClick={() => (jobId ? router.replace(`/lender/jobs/${jobId}`) : router.replace("/lender/dashboard"))}
          className="w-full bg-[#2A020D] hover:bg-[#4e1b29] text-white py-3 rounded-lg"
        >
          Go back
        </button>
      </div>
    </div>
  );
}

export default function LenderPayCancelPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading…</div>}>
      <CancelContent />
    </Suspense>
  );
}