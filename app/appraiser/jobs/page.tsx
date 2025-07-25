"use client";
import React, { useState, useEffect } from "react";
// import { } from "lucide-react";
import { useRouter } from "next/navigation";

import DashboardLayout from "@/components/dashboard-layout";
import { appraiserJobsApi, AppraiserJob, JobsApiResponse } from "../lib/job";
import { SimpleJobStatusModal } from "./SimpleJobStatusModal";
import { ComplexJobStatusModal } from "./ComplexJobStatusModal";
import { Msg, Map, Update, Call, Next, Building } from "@/components/icons";

type FilterKey = "all" | "active" | "in-progress" | "completed";

const FILTERS: { name: string; key: FilterKey }[] = [
  { name: "All", key: "all" },
  { name: "Active", key: "active" },
  { name: "In Progress", key: "in-progress" },
  { name: "Completed", key: "completed" },
];

function filterJobs(job: AppraiserJob, filter: FilterKey) {
  const status = job.job.job_status;
  if (filter === "all") return true;
  if (filter === "active") return status === "accepted";
  if (filter === "in-progress")
    return status === "site_visit_scheduled" || status === "post_visit_summary";
  if (filter === "completed") return status === "completed";
  return false;
}

function getStatusColor(status: string) {
  switch (status) {
    case "accepted":
      return "bg-blue-500";
    case "site_visit_scheduled":
      return "bg-yellow-500";
    case "post_visit_summary":
      return "bg-yellow-600";
    case "completed":
      return "bg-green-500";
    default:
      return "bg-gray-400";
  }
}

export default function AppraiserJobsPage() {
  const [jobs, setJobs] = useState<AppraiserJob[]>([]);
  const [admin, setAdmin] = useState<{
    phone: string;
    country_code: string;
  } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [modalJob, setModalJob] = useState<AppraiserJob | null>(null);
  const [modalType, setModalType] = useState<"simple" | "complex" | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");

  const router = useRouter();

  useEffect(() => {
    setLoading(true);
    appraiserJobsApi
      .fetchAcceptedJobs({ page: 1, limit: 20 })
      .then((res: JobsApiResponse) => {
        console.log("JOBS API RAW RESPONSE:", res);
        setJobs(Array.isArray(res.jobs) ? res.jobs : []);
        setAdmin(res.admin || null);
      })
      .catch(() => setError("Failed to load jobs."))
      .finally(() => setLoading(false));
  }, []);

  const handleModalSubmit = async (jobId: string, payload: any) => {
    // Use the 6-digit job ID for the API call
    await appraiserJobsApi.updateJobStatus(jobId, payload);
    setModalJob(null);
    setModalType(null);
    setLoading(true);
    appraiserJobsApi
      .fetchAcceptedJobs({ page: 1, limit: 10 })
      .then((res: JobsApiResponse) => {
        setJobs(Array.isArray(res.jobs) ? res.jobs : []);
        console.log("shubham job res", res);
        setAdmin(res.admin || null);
      })
      .finally(() => setLoading(false));
  };

  const openModal = (job: AppraiserJob) => {
    setModalJob(job);
    const jobStatus = job.job.job_status;

    // Simple modal for: accepted → site_visit_scheduled AND site_visit_scheduled → post_visit_summary
    if (jobStatus === "accepted" || jobStatus === "site_visit_scheduled") {
      setModalType("simple");
    }
    // Complex modal for: post_visit_summary → completed
    else if (jobStatus === "post_visit_summary") {
      setModalType("complex");
    }
  };

  const handleChatClick = (jobId: string) => {
  router.push(`/appraiser/chats/${jobId}`);
};


  const closeModal = () => {
    setModalJob(null);
    setModalType(null);
  };

  return (
    <DashboardLayout role="appraiser">
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-2">Jobs</h1>
        {admin && (
          <div className="mb-4 p-2 bg-sky-50 rounded text-xs text-gray-700">
            For help, contact admin:{" "}
            <span className="font-semibold">
              {admin.country_code} {admin.phone}
            </span>
          </div>
        )}

        <div className="flex gap-4 mb-6">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              className={`px-6 py-2 rounded-full transition ${
                activeFilter === f.key
                  ? "bg-blue-800 text-white"
                  : "border bg-white border-gray-300 text-gray-600"
              }`}
              onClick={() => setActiveFilter(f.key)}
            >
              {f.name}
            </button>
          ))}
        </div>

        {loading && <div>Loading...</div>}
        {error && <div className="text-red-500">{error}</div>}
        {!loading && !error && (
          <div className="space-y-4">
            {jobs.filter((job) => filterJobs(job, activeFilter)).length ===
              0 && (
              <div className="text-gray-500">
                No jobs found for this filter.
              </div>
            )}
            {jobs
              .filter((job) => filterJobs(job, activeFilter))
              .map((job) => {
                const details = job.job;
                const job_status = details.job_status;

                // Calculate timer from expires_at
                const calculateTimeLeft = (expiresAt: string) => {
                  const now = new Date().getTime();
                  const expiry = new Date(expiresAt).getTime();
                  const diff = expiry - now;

                  if (diff <= 0) return "Expired";

                  const hours = Math.floor(diff / (1000 * 60 * 60));
                  const minutes = Math.floor(
                    (diff % (1000 * 60 * 60)) / (1000 * 60)
                  );

                  if (hours > 0) return `${hours}h ${minutes}m Left`;
                  return `${minutes} Min Left`;
                };

                const timeLeft = details.expires_at
                  ? calculateTimeLeft(details.expires_at)
                  : "";
                const isExpired = timeLeft === "Expired";

                return (
                  <div
                    key={job.id}
                    className="flex justify-between items-center bg-[#e8fafa] p-4 rounded-lg shadow"
                  >
                    {/* LEFT SIDE - Icon and Job Info */}
                    <div className="flex items-start gap-4">
                      {/* Building Icon */}
                      <div>
                        <Building />
                      </div>

                      {/* Job Details */}
                      <div>
                        <h3 className="font-semibold text-base">
                          {details.property_type || "Appraisal"}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {details.address ?? "—"}
                        </p>

                        {/* Status Badge - ORIGINAL NAMES KEPT */}
                        <span
                          className={`inline-block mt-2 px-3 py-1 rounded-full text-white text-xs font-medium ${getStatusColor(
                            job_status
                          )}`}
                        >
                          {(job_status || "-").replace(/_/g, " ").toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* RIGHT SIDE - Timer, User Badge, Action Icons */}
                    <div className="flex items-center gap-2">
                      {/* Timer Badge */}
                      {timeLeft && (
                        <div
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            isExpired
                              ? "bg-red-100 text-red-700"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {timeLeft}
                        </div>
                      )}

                      {/* User Badge */}
                      <div className="px-2 py-1 rounded bg-gray-100 text-gray-800 text-xs font-medium border">
                        {details.intended_username || "Joe Done"}
                      </div>

                      {/* Action Icons */}
                      <div className="flex gap-2 items-center">
                        {/* CHAT - Always present */}
<button 
  title="Chat" 
  onClick={() => handleChatClick(details.id)}
  className="hover:text-blue-700 transition-colors"
>    
  <Msg />
</button>


                        {/* CALL - Only for "accepted" status */}
                        {job_status === "accepted" && !!details.phone && (
                          <a
                            href={`tel:+${details.country_code}${details.phone}`}
                            title="Call"
                            className="hover:text-blue-700"
                          >
                            <Call />
                          </a>
                        )}

                        {/* MAP - Only for "site_visit_scheduled" status */}
                        {job_status === "site_visit_scheduled" && (
                          <button
                            title="View Property Location"
                            onClick={() => {
                              const address =
                                details.resident_address ||
                                details.address ||
                                "";
                              if (address) {
                                window.open(
                                  `https://maps.google.com/maps?q=${encodeURIComponent(
                                    address
                                  )}`,
                                  "_blank"
                                );
                              } else if (
                                details.location &&
                                Array.isArray(details.location.coordinates)
                              ) {
                                const [lng, lat] = details.location.coordinates;
                                window.open(
                                  `https://maps.google.com/?q=${lat},${lng}`,
                                  "_blank"
                                );
                              }
                            }}
                            className="hover:text-blue-700"
                          >
                            <Map />
                          </button>
                        )}

                        {/* UPDATE STATUS - For all except "completed" */}
                        {job_status !== "completed" && (
                          <button
                            title="Update status"
                            onClick={() => openModal(job)}
                            className="hover:text-blue-700"
                          >
                            <Update />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}

        {/* Simple Modal for accepted → site_visit_scheduled AND site_visit_scheduled → post_visit_summary */}
        {modalJob && modalType === "simple" && (
          <SimpleJobStatusModal
            open={true}
            onClose={closeModal}
            jobId={modalJob.job.id}
            currentStatus={modalJob.job.job_status}
            jobData={modalJob.job} // Pass the job data
            onSubmit={(payload) => handleModalSubmit(modalJob.job.id, payload)}
          />
        )}

       {/* Complex Modal for post_visit_summary → completed */}
{modalJob && modalType === "complex" && (
  <ComplexJobStatusModal
    open={true}
    onClose={closeModal}
    jobId={modalJob.job.id}
    jobData={modalJob.job} // Pass the job data
    onSubmit={payload => handleModalSubmit(modalJob.job.id, payload)}
  />
)}

      </div>
    </DashboardLayout>
  );
}
