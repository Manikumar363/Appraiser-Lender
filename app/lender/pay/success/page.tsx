"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export const dynamic = "force-dynamic";

function SuccessContent() {
  const router = useRouter();
  const params = useSearchParams();
  const status = (params.get("redirect_status") || "succeeded").toLowerCase();
  const jobId = params.get("jobId") || "";

  useEffect(() => {
    // If Stripe returned anything other than "succeeded", send to cancel page
    if (status !== "succeeded") {
      router.replace(
        `/lender/pay/cancel?jobId=${encodeURIComponent(jobId)}&redirect_status=${encodeURIComponent(
          status
        )}`
      );
      return;
    }

    const t = setTimeout(() => {
      if (jobId) router.replace(`/lender/jobs/${jobId}`);
      else router.replace("/lender/dashboard");
    }, 1200);
    return () => clearTimeout(t);
  }, [status, jobId, router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-green-200 bg-white p-6 text-center shadow">
        <h1 className="text-xl font-semibold mb-2">Payment Successful</h1>
        <p className="text-gray-600">Finalizing and redirecting…</p>
      </div>
    </div>
  );
}

export default function LenderPaySuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading…</div>}>
      <SuccessContent />
    </Suspense>
  );
}