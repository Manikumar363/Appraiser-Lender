'use client'

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { MapIcon, MessageIcon, CalendarIcon, LoadIcon, PDFIcon, ImageIcon, CardIcon, RightArrow, BuildingIcon, LeftArrow } from "@/components/icons"
import { Button } from "../../../../components/ui/button"
import { Badge } from "../../../../components/ui/badge"
import DashboardLayout from "@/components/dashboard-layout"
import { getSingleJob, getProgressSteps, JobDetail } from "../../../../lib/api/jobs1"
import { formatDistanceToNow } from "date-fns"

// Stripe
import { Elements } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import StripeCheckout from "@/components/payments/StripeCheckout"

// Toasts (optional)
import { Toaster, toast } from "react-hot-toast"

// API helper
import { createPaymentIntent } from "@/lib/api/transaction"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PK as string)

function getCityCountry(address: string) {
  const parts = address.split(",").map(part => part.trim());
  if (parts.length >= 3) {
    return parts[2] + ", " + parts[parts.length - 1];
  }
  return address;
}

export default function JobDetailPage() {
  const params = useParams()!
  const [job, setJob] = useState<JobDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const router = useRouter()

  // Stripe state
  const [showCheckout, setShowCheckout] = useState(false)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [intentLoading, setIntentLoading] = useState(false)

  if (!params?.id || typeof params.id !== "string") {
    throw new Error("Invalid job ID")
  }
  const id = params.id

  const pollJobUntilPaid = async (jobId: string) => {
    for (let i = 0; i < 12; i++) {
      try {
        const refreshed = await getSingleJob(jobId, { noCache: true });
        const s = (refreshed.payment_status ?? "").toLowerCase();
        if (["completed", "succeeded", "paid"].includes(s)) {
          setJob(refreshed);
          return true;
        }
      } catch {}
      await new Promise((r) => setTimeout(r, 1200));
    }
    return false;
  };

  useEffect(() => {
    async function loadJob() {
      try {
        const j = await getSingleJob(id, { noCache: true });
        setJob(j);
        // If user landed back here and webhook is slightly delayed, poll once
        if ((j.payment_status ?? "").toLowerCase() === "pending") {
          pollJobUntilPaid(id);
        }
      } catch (e: any) {
        setError(e?.message || "Failed to load job");
      } finally {
        setLoading(false);
      }
    }
    loadJob();
  }, [id])

  // Start payment: create intent via API and open Elements modal
  const handlePayNowClick = async () => {
    if (!job?.id) return
    try {
      setIntentLoading(true)
      const { clientSecret } = await createPaymentIntent(job.id)
      if (!clientSecret) throw new Error("Missing client secret")
      setClientSecret(clientSecret)
      setShowCheckout(true)
      toast.success("Secure payment initialized")
    } catch (e: any) {
      toast.error(e?.message || "Could not start payment")
    } finally {
      setIntentLoading(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout role="lender">
        <div className="p-6">Loading details...</div>
      </DashboardLayout>
    )
  }
  if (error || !job) {
    return (
      <DashboardLayout role="lender">
        <div className="p-6 text-red-500">{error || "Job not found"}</div>
      </DashboardLayout>
    )
  }

  const progressSteps = getProgressSteps(job.status)
  const paymentStatus = (job.payment_status ?? "").toLowerCase()
  const isPaid = ["completed", "succeeded", "paid"].includes(paymentStatus)

  return (
    <DashboardLayout role="lender">
      <Toaster position="top-center" />
      <div className="min-h-screen p-4 sm:p-5 md:p-6 overflow-y-auto md:overflow-visible w-full">
        {/* Header */}
        <div className="flex items-start xl:items-center justify-between mb-6 gap-2">
          <button
            className="w-10 h-10 flex items-center justify-center rounded-full shadow mb-2 xl:mb-0 bg-white hover:bg-[#FBEFF2] transition"
            onClick={() => router.back()}
            aria-label="Back"
          >
            <LeftArrow className="w-6 h-6" />
          </button>
          <h1 className="text-lg sm:text-xl font-semibold text-gray-900">Job Details</h1>
        </div>

        {/* Info Card */}
        <div className="bg-[#FBEFF2] rounded-lg p-4 sm:p-5 md:p-6 shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#2A020D] rounded-full flex items-center justify-center">
                <BuildingIcon className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <h2 className="text-base sm:text-lg font-semibold">{job.intended_username}</h2>
                <p className="text-gray-600 text-xs sm:text-sm mb-1 break-words">{job.address}</p>
                <Badge
                  className="w-fit text-white inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium"
                  style={{
                    backgroundColor:
                      job.job_status === "active" ||
                      job.job_status === "client_visit" ||
                      job.job_status === "site_visit_scheduled" ||
                      job.job_status === "post_visit_summary"
                        ? "#FFC107"
                        : job.job_status === "completed"
                        ? "#22c55e"
                        : job.job_status === "cancelled"
                        ? "#ef4444"
                        : "#FFC107"
                  }}
                >
                  <LoadIcon className="w-4 h-4 mr-1.5" />
                  {job.job_status}
                </Badge>
              </div>
            </div>

            {/* Action buttons mobile (compact 3-up grid) */}
            <div className="mt-3 grid grid-cols-3 gap-2 sm:hidden w-full">
              <Button
                variant="outline"
                size="sm"
                aria-label="Location"
                className="flex items-center justify-center gap-1 rounded-full bg-[#FBEFF2] border border-[#2A020D] text-[#2A020D] px-2 py-1 text-[10px] font-medium hover:bg-[#F3DDE4]"
              >
                <MapIcon className="w-3.5 h-3.5" />
                <span className="truncate">{getCityCountry(job.address).split(',')[0]}</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                aria-label="Preferred date"
                className="flex items-center justify-center gap-1 rounded-full bg-[#FBEFF2] border border-[#2A020D] text-[#2A020D] px-2 py-1 text-[10px] font-medium hover:bg-[#F3DDE4]"
              >
                <CalendarIcon className="w-3.5 h-3.5" />
                <span>{new Date(job.preferred_date).toLocaleDateString()}</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                aria-label="Open chat"
                onClick={() => router.push(`/lender/chats/${job.id}`)}
                className="flex items-center justify-center gap-1 rounded-full bg-[#FBEFF2] border border-[#2A020D] text-[#2A020D] px-2 py-1 text-[10px] font-medium hover:bg-[#F3DDE4]"
              >
                <MessageIcon className="w-3.5 h-3.5" />
                <span>Chat</span>
              </Button>
            </div>

            {/* Action buttons tablet/desktop */}
            <div className="hidden sm:flex flex-wrap xl:flex-nowrap items-center gap-2 sm:gap-3">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 xl:flex-none bg-[#FBEFF2] border border-[#2A020D] text-[#2A020D] rounded-full px-4 sm:px-6 py-2 flex items-center gap-2 hover:bg-[#F3DDE4]"
              >
                <MapIcon className="w-5 h-5" />
                <span className="text-xs sm:text-sm">{getCityCountry(job.address)}</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 xl:flex-none bg-[#FBEFF2] border border-[#2A020D] text-[#2A020D] rounded-full px-4 sm:px-6 py-2 flex items-center gap-2 hover:bg-[#F3DDE4]"
              >
                <CalendarIcon className="w-4 h-4" />
                <span className="text-xs sm:text-sm">
                  {new Date(job.preferred_date).toLocaleDateString()}
                </span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/lender/chats/${job.id}`)}
                className="flex-1 xl:flex-none bg-[#FBEFF2] border border-[#2A020D] text-[#2A020D] rounded-full px-4 sm:px-6 py-2 flex items-center gap-2 hover:bg-[#F3DDE4]"
              >
                <MessageIcon className="w-5 h-5" />
                <span className="text-xs sm:text-sm">Message</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-[#2A020D] hover:bg-[#FBEFF2] p-2 rounded-full"
              >
                <RightArrow className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="bg-[#FBEFF2] rounded-lg p-4 sm:p-5 md:p-6 shadow-sm border border-gray-200 mb-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">
            Job Summary
          </h3>
          <div className="flex gap-4 sm:gap-6 xl:gap-8 overflow-x-auto xl:overflow-visible pb-2 xl:pb-0 no-scrollbar flex-nowrap xl:flex-wrap justify-start xl:justify-center">
            {progressSteps.map((step, i) => (
              <div key={i} className="flex flex-col items-center min-w-[64px]">
                <div
                  className={`
                    rounded-full flex items-center justify-center mb-1.5 sm:mb-2
                    w-10 h-10 sm:w-11 sm:h-11 xl:w-12 xl:h-12
                    ${step.status === "completed"
                      ? "bg-[#2A020D]"
                      : step.status === "current"
                      ? "bg-white border-[10px] sm:border-[12px] border-[#4B0E1C]"
                      : "bg-gray-400"}
                  `}
                />
                <span className="text-[10px] sm:text-xs text-gray-600 text-center leading-tight">
                  {step.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Files */}
        <div className="mb-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
            Uploaded Files
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 mb-4">
            {job.lender_doc &&
              job.lender_doc.split(",").map((url, idx) => {
                const ext = url.split(".").pop()?.toLowerCase();
                const isPdf = ext === "pdf";
                const isImage = ["png", "jpg", "jpeg"].includes(ext || "");
                return (
                  <div
                    key={idx}
                    className="bg-[#FBEFF2] rounded-xl py-5 sm:py-6 px-3 flex flex-col items-center text-center shadow-md"
                  >
                    {(isPdf || !isImage) ? (
                      <PDFIcon className="w-6 h-6 text-gray-700 mb-2" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-gray-700 mb-2" />
                    )}
                    <a
                      href={url}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-gray-700 text-[11px] sm:text-sm mb-1 truncate w-full"
                      title={url.split("/").pop()}
                    >
                      {url.split("/").pop()}
                    </a>
                    <span className="text-gray-500 text-[10px] sm:text-xs">
                      {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })
                        .replace("about ", "")
                        .replace("day", "d")
                        .replace("days", "d")}
                    </span>
                  </div>
                );
              })}
          </div>
          {job.lender_doc && (
            <Button
              className="w-full bg-[#2A020D] hover:bg-[#4e1b29] text-white py-5 sm:py-6 rounded-lg text-sm sm:text-base"
              onClick={() => job.lender_doc.split(",").forEach(u => window.open(u, "_blank"))}
            >
              Download All
            </Button>
          )}
        </div>

        {/* Transaction */}
        <div className="mb-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
            Transaction Summary
          </h3>
          <div className="bg-[#FBEFF2] rounded-xl px-4 sm:px-5 py-4 flex items-center justify-between shadow-md w-full xl:max-w-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#2A020D] rounded-full flex items-center justify-center">
                <CardIcon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <span className="text-lg sm:text-xl font-semibold text-gray-900">
                ${job.price}
              </span>
            </div>
            <Badge
              className={`${
                isPaid ? "bg-green-500 hover:bg-green-400" : "bg-orange-400 hover:bg-orange-300"
              } text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-sm sm:text-base transition-colors`}
            >
              {isPaid ? "Completed" : "Pending"}
            </Badge>
          </div>
        </div>

        {!isPaid && (
          <Button
            className="w-full bg-[#2A020D] hover:bg-[#4e1b29] text-white py-5 sm:py-6 xl:py-7 rounded-lg text-sm sm:text-base"
            onClick={handlePayNowClick}
            disabled={intentLoading}
          >
            {intentLoading ? "Preparing..." : "Pay Now"}
          </Button>
        )}

        {/* Stripe modal */}
        {showCheckout && clientSecret && (
          <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: "stripe" } }}>
            <StripeCheckout
              jobId={job.id}
              onClose={() => setShowCheckout(false)}
              onSuccess={async () => {
                setJob(prev => (prev ? { ...prev, payment_status: "completed" } as JobDetail : prev));
                await pollJobUntilPaid(id);
              }}
            />
          </Elements>
        )}
      </div>
    </DashboardLayout>
  )
}
