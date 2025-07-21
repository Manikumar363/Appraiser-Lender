"use client";
import React, { useState, useEffect } from "react";
import { ExternalLink, Phone, MessageSquare, Map } from "lucide-react";
import DashboardLayout from "@/components/dashboard-layout";
import { appraiserJobsApi, AppraiserJob, JobsApiResponse } from "../lib/job";
import { SimpleJobStatusModal } from "./SimpleJobStatusModal";
import { ComplexJobStatusModal } from "./ComplexJobStatusModal";

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
  if (filter === "in-progress") return status === "site_visit_scheduled" || status === "post_visit_summary";
  if (filter === "completed") return status === "completed";
  return false;
}

function getStatusColor(status: string) {
  switch (status) {
    case "accepted": return "bg-blue-500";
    case "site_visit_scheduled": return "bg-yellow-500";
    case "post_visit_summary": return "bg-yellow-600";
    case "completed": return "bg-green-500";
    default: return "bg-gray-400";
  }
}

export default function AppraiserJobsPage() {
  const [jobs, setJobs] = useState<AppraiserJob[]>([]);
  const [admin, setAdmin] = useState<{ phone: string; country_code: string } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [modalJob, setModalJob] = useState<AppraiserJob | null>(null);
  const [modalType, setModalType] = useState<"simple" | "complex" | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");

  useEffect(() => {
    setLoading(true);
    appraiserJobsApi
      .fetchAcceptedJobs({ page: 1, limit: 10 })
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
        console.log("shubham",res);
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
            For help, contact admin: <span className="font-semibold">{admin.country_code} {admin.phone}</span>
          </div>
        )}

        <div className="flex gap-4 mb-6">
          {FILTERS.map(f => (
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
            {jobs.filter(job => filterJobs(job, activeFilter)).length === 0 && (
              <div className="text-gray-500">No jobs found for this filter.</div>
            )}
            {jobs.filter(job => filterJobs(job, activeFilter)).map(job => {
              const details = job.job;
              const job_status = details.job_status;
              return (
                <div
                  key={job.id}
                  className="flex justify-between items-center bg-[#e8fafa] p-4 rounded-lg shadow"
                >
                  <div>
                    <h3 className="font-semibold">
                      {details.property_type || "Appraisal"}
                      <span className="ml-1 bg-zinc-100 rounded px-2 text-xs font-normal text-gray-500">{details.id}</span>
                    </h3>
                    <p className="text-sm text-gray-600">{details.address ?? "—"}</p>
                    <span className={`inline-block mt-1 px-3 py-1 rounded-full text-white text-xs font-medium ${getStatusColor(job_status)}`}>
                      {(job_status || "-").replace(/_/g, " ").toUpperCase()}
                    </span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <button title="Chat"><MessageSquare size={18} /></button>
                    {!!details.phone && (
                      <a
                        href={`tel:+${details.country_code}${details.phone}`}
                        title="Call"
                        className="hover:text-blue-700"
                      >
                        <Phone size={18} />
                      </a>
                    )}
                    {job_status === "site_visit_scheduled" && details.location && Array.isArray(details.location.coordinates) && (
                      <button
                        title="Show Location"
                        onClick={() => {
                          const [lng, lat] = details.location.coordinates;
                          window.open(`https://maps.google.com/?q=${lat},${lng}`, "_blank");
                        }}
                        className="hover:text-blue-700"
                      >
                        <Map size={18} />
                      </button>
                    )}
                    {job_status !== "completed" && (
                      <button
                        title="Update status"
                        onClick={() => openModal(job)}
                        className="hover:text-blue-700"
                      >
                        <ExternalLink size={18} />
                      </button>
                    )}
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
            jobId={modalJob.job.id} // Using 6-digit job ID
            currentStatus={modalJob.job.job_status} // Pass current status
            onSubmit={payload => handleModalSubmit(modalJob.job.id, payload)} 
          />
        )}

        {/* Complex Modal for post_visit_summary → completed */}
        {modalJob && modalType === "complex" && (
          <ComplexJobStatusModal
            open={true}
            onClose={closeModal}
            jobId={modalJob.job.id} // Using 6-digit job ID
            onSubmit={payload => handleModalSubmit(modalJob.job.id, payload)} // Use 6-digit job ID
          />
        )}
      </div>
    </DashboardLayout>
  );
}
