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
      <div className="p-6 min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            className="w-10 h-10 flex items-center justify-center rounded-full shadow mb-4"
            onClick={() => router.back()}
            aria-label="Back"
          >
            <LeftArrow className="w-10 h-10" />
          </button>
          <h1 className="text-xl font-semibold text-gray-900">Job Details</h1>
        </div>

        {/* Info Card */}
        <div className="bg-[#FBEFF2] rounded-lg p-6 shadow-sm border border-gray-200 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#2A020D] rounded-full flex items-center justify-center">
                <BuildingIcon className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <h2 className="text-lg font-semibold">{job.purpose}</h2>
                <p className="text-gray-600 text-sm mb-1">{job.address}</p>
                <Badge
                  className="w-fit text-white inline-flex items-center px-4 py-2 rounded-full text-sm font-medium cursor-pointer"
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
                  }}>
                  <LoadIcon className="w-4 h-4 mr-2" />
                  {job.job_status}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="bg-[#FBEFF2] border border-[#2A020D] text-[#2A020D] rounded-full px-6 py-2 flex items-center gap-2 hover:bg-[#F3DDE4] transition-colors">
                <MapIcon className="w-6 h-6 mr-1 " />
                {job.address}
              </Button>
              <Button variant="outline" size="sm" className="bg-[#FBEFF2] border border-[#2A020D] text-[#2A020D] rounded-full px-6 py-2 flex items-center gap-2 hover:bg-[#F3DDE4] transition-colors">
                <CalendarIcon className="w-4 h-4 mr-2" />
                {new Date(job.preferred_date).toLocaleDateString()}
              </Button>
              <Button variant="outline" size="sm" className="bg-[#FBEFF2] border border-[#2A020D] text-[#2A020D] rounded-full px-6 py-2 flex items-center gap-2 hover:bg-[#F3DDE4] transition-colors"
              onClick={() => router.push(`/lender/chats/${job.id}`)}>
                <MessageIcon className="w-5 h-5 mr-1" />
                Message
              </Button>
              <Button variant="ghost" size="sm" className="text-white hover:text-white p-2">
                <RightArrow className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="bg-[#FBEFF2] rounded-lg p-6 shadow-sm border border-gray-200 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Job Summary</h3>
          <div className="flex items-center justify-center gap-8">
            {progressSteps.map((step, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2
                  ${step.status === "completed" ? "bg-[#2A020D]" : step.status === "current" ? "bg-white border-[14px] border-[#4B0E1C]" : "bg-gray-400"}
                `}>
                  {step.status === "current" && <div className="bg-[#2A020D]" />}
                </div>
                <span className="text-sm text-gray-600 text-center">{step.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Files */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Uploaded Files</h3>
          <div className="flex flex-wrap gap-4 mb-4">
            {job.lender_doc &&
              job.lender_doc
                .split(",")
                .map((url, idx) => {
                  const ext = url.split(".").pop()?.toLowerCase();
                  const isPdf = ext === "pdf";
                  const isImage = ext === "png" || ext === "jpg" || ext === "jpeg";
                  return (
                    <div key={idx} className="bg-[#FBEFF2] rounded-xl py-7 px-3 w-[200px] flex flex-col items-center text-center shadow-md">
                      {isPdf ? (
                        <PDFIcon className="w-6 h-6 text-gray-700 mb-2" />
                      ) : isImage ? (
                        <ImageIcon className="w-6 h-6 text-gray-700 mb-2" />
                      ) : (
                        <PDFIcon className="w-6 h-6 text-gray-700 mb-2" />
                      )}
                      <a
                        href={url}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-gray-700 text-sm mb-1 truncate max-w-[160px] block"
                        title={url.split("/").pop()} // Show full filename on hover
                      >
                        {url.split("/").pop()}
                      </a>
                      <span className="text-gray-500 text-sm">
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
              className="w-full bg-[#2A020D] hover:bg-[#4e1b29] text-white py-7 rounded-lg"
              onClick={() => {
                job.lender_doc.split(",").forEach((url) => {
                  window.open(url, "_blank");
                });
              }}
            >
              Download All
            </Button>
          )}
        </div>

        {/* Transaction */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction Summary</h3>
          <div className="bg-[#FBEFF2] rounded-xl px-5 py-4 flex items-center justify-between shadow-md max-w-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#2A020D] rounded-full flex items-center justify-center">
                <CardIcon className="w-8 h-8 text-white" />
              </div>
              <span className="text-xl font-semibold text-gray-900">${job.price}</span>
            </div>
            <Badge
              className={`${isPaid ? "bg-green-500 hover:bg-green-400" : "bg-orange-400 hover:bg-orange-300"} text-white px-4 py-2 rounded-full text-lg transition-colors duration-200 cursor-pointer`}
            >
              {isPaid ? "Completed" : "Pending"}
            </Badge>
          </div>
        </div>

        {!isPaid && (
          <Button
            className="w-full bg-[#2A020D] hover:bg-[#4e1b29] text-white py-7 rounded-lg text-lg"
            onClick={handlePayNowClick}
            disabled={intentLoading}
          >
            {intentLoading ? "Preparing..." : "Pay Now"}
          </Button>
        )}

        {/* Stripe modal */}
        {showCheckout && clientSecret && (
          <Elements
            stripe={stripePromise}
            options={{ clientSecret, appearance: { theme: "stripe" } }}
          >
            <StripeCheckout
              jobId={job.id}
              onClose={() => setShowCheckout(false)}
              onSuccess={async () => {
                // Optimistic UI
                setJob(prev => (prev ? { ...prev, payment_status: "completed" } as JobDetail : prev))
                // Reconcile with backend
                await pollJobUntilPaid(id);
              }}
            />
          </Elements>
        )}
      </div>
    </DashboardLayout>
  )
}
