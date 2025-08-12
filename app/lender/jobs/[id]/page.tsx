'use client'

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import {MapIcon, MessageIcon, CalendarIcon, LoadIcon, PDFIcon, ImageIcon, CardIcon, RightArrow, BuildingIcon, LeftArrow} from "@/components/icons"
import { Button } from "../../../../components/ui/button"
import { Badge } from "../../../../components/ui/badge"
import DashboardLayout from "@/components/dashboard-layout"
import { getSingleJob, getProgressSteps, JobDetail,getStatusColor } from "../../../../lib/api/jobs1"
import { formatDistanceToNow } from "date-fns";

export default function JobDetailPage() {
  const params = useParams()!
  const [job, setJob] = useState<JobDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const router = useRouter()

  if (!params?.id || typeof params.id !== "string") {
    throw new Error("Invalid job ID")
  }
   const id = params.id

  useEffect(() => {
    async function loadJob() {
      try {
        const data = await getSingleJob(id);
        setJob(data)
      } catch (err: any) {
        setError(err.message || "Failed to load job")
      } finally {
        setLoading(false)
      }
    }
    loadJob()
  }, [id])

  if (loading) return <DashboardLayout role="lender"><div className="p-6">Loading details...</div></DashboardLayout>
  if (error || !job) return <DashboardLayout role="lender"><div className="p-6 text-red-500">{error || "Job not found"}</div></DashboardLayout>

  const progressSteps = getProgressSteps(job.status)

  return (
    <DashboardLayout role="lender">
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
                  className="w-fit text-white inline-flex items-center px-4 py-2 rounded-full text-sm font-medium"
                  style={{
                    backgroundColor:
                      job.status === "pending" ||
                      job.status === "client-visit" ||
                      job.status === "site-visit-scheduled" ||
                      job.status === "post-visit-summary"
                        ? "#FFC107"
                        : job.status === "accepted"
                        ? "#22c55e"
                        : job.status === "cancelled"
                        ? "#ef4444"
                        : "#FFC107"                
                  }}>
                  <LoadIcon className="w-4 h-4 mr-2" />
                  {job.job_status}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="bg-[#FBEFF2] border border-[#2A020D] text-[#2A020D] rounded-full px-6 py-2 flex items-center gap-2 hover:bg-blue-100 transition-colors">
                <MapIcon className="w-6 h-6 mr-1 " />
                {job.address}
              </Button>
              <Button variant="outline" size="sm" className="bg-[#FBEFF2] border border-[#2A020D] text-[#2A020D] rounded-full px-6 py-2 flex items-center gap-2 hover:bg-blue-100 transition-colors">
                <CalendarIcon className="w-4 h-4 mr-2" />
                {new Date(job.preferred_date).toLocaleDateString()}
              </Button>
              <Button variant="outline" size="sm" className="bg-[#FBEFF2] border border-[#2A020D] text-[#2A020D] rounded-full px-6 py-2 flex items-center gap-2 hover:bg-blue-100 transition-colors"
              onClick={() => router.push(`/lender/chats/${job.id}`)}>
                <MessageIcon className="w-5 h-5 mr-1" />
                Message
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600 p-2">
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
             <Badge className={`${job.status === "completed" ? "bg-green-500" : "bg-orange-400"} text-white px-4 py-2 rounded-full text-lg`}>
              {job.status ? job.status.charAt(0).toUpperCase() + job.status.slice(1) : "Pending"}
            </Badge>
          </div>
        </div>

        {/* Accept 
        {job.status !== "completed" && (
          <Button className="w-full bg-[#2A020D] hover:bg-[#4e1b29] text-white py-7 rounded-lg text-lg">
            Accept
          </Button>
        )}*/}
      </div>
    </DashboardLayout>
  )
}
