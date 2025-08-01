"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { appraiserJobsApi, AppraiserJob, JobsApiResponse } from "../lib/job";
import { SimpleJobStatusModal } from "./SimpleJobStatusModal";
import { ComplexJobStatusModal } from "./ComplexJobStatusModal";
import {
  Msg,
  LoadIcon,
  Map,
  Update,
  Call,
  Next,
  Building,
  TimerIcon2,
  ProfileIcon3,
} from "@/components/icons";
import { toast } from "sonner";

interface AppraiserJobsContentProps {
  searchQuery?: string;
}

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
  if (filter === "active") return status === "active" || status === "accepted";
  if (filter === "in-progress")
    return (
      status === "site_visit_scheduled" ||
      status === "post_visit_summary" ||
      status === "client_visit"
    );
  if (filter === "completed") return status === "completed";
  return false;
}

function getStatusColor(status: string) {
  switch (status) {
    case "accepted":
      return "bg-[#014F9D]";
    case "active":
      return "bg-[#014F9D]";
    case "site_visit_scheduled":
      return "bg-[#FFC107]";
    case "client_visit":
      return "bg-[#FFC107]";
    case "post_visit_summary":
      return "bg-[#FFC107]";
    case "completed":
      return "bg-[#019D23]";
    default:
      return "bg-[#FFC107]";
  }
}

export default function AppraiserJobsContent({
  searchQuery = "",
}: AppraiserJobsContentProps) {
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
    toast.loading("Loading jobs...", { id: "loading-jobs" });

    appraiserJobsApi
      .fetchAcceptedJobs({ page: 1, limit: 20 })
      .then((res: JobsApiResponse) => {
        setJobs(Array.isArray(res.jobs) ? res.jobs : []);
        setAdmin(res.admin || null);
        toast.success("Jobs loaded successfully", { id: "loading-jobs" });
      })
      .catch(() => {
        setError("Failed to load jobs.");
        toast.error("Failed to load jobs", { id: "loading-jobs" });
      })
      .finally(() => setLoading(false));
  }, []);

  const handleModalSubmit = async (jobId: string, payload: any) => {
    try {
      toast.loading("Updating job status...", { id: "update-job" });

      await appraiserJobsApi.updateJobStatus(jobId, payload);
      setModalJob(null);
      setModalType(null);
      setLoading(true);

      const res = await appraiserJobsApi.fetchAcceptedJobs({
        page: 1,
        limit: 20,
      });
      setJobs(Array.isArray(res.jobs) ? res.jobs : []);
      setAdmin(res.admin || null);

      toast.success("Job status updated successfully", { id: "update-job" });
    } catch (error) {
      toast.error("Failed to update job status", { id: "update-job" });
    } finally {
      setLoading(false);
    }
  };

  const openModal = (job: AppraiserJob) => {
    setModalJob(job);
    const jobStatus = job.job.job_status;

    if (
      jobStatus === "accepted" ||
      jobStatus === "site_visit_scheduled" ||
      jobStatus === "client_visit" ||
      jobStatus === "active"
    ) {
      setModalType("simple");
    } else if (jobStatus === "post_visit_summary") {
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

  // Filter jobs based on search query
  const filteredJobs = jobs
    .filter((job) => filterJobs(job, activeFilter))
    .filter((job) => {
      if (!searchQuery) return true;
      const details = job.job;
      return (
        details.property_type
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        details.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        details.job_status?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        details.intended_username
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase())
      );
    });

  return (
    <div className=" p-2">
      <div className="flex-1">
        {/* Full-Width Filter Buttons */}
        <div className="flex gap-4 mb-6">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              className={`w-full py-2 rounded-full transition ${
                activeFilter === f.key
                  ? "bg-[#014F9D] hover:bg-blue-800 text-white"
                  : "border-[#014F9D] text-[#014F9D] hover:bg-blue-50 bg-transparent border"
              }`}
              onClick={() => setActiveFilter(f.key)}
            >
              {f.name}
            </button>
          ))}
        </div>

        {loading && (
          <div className="flex justify-center items-center py-12">
            <LoadIcon className="animate-spin w-8 h-8 text-[#014F9D]" />
          </div>
        )}

        {error && <div className="text-red-500">{error}</div>}

        {!loading && !error && (
          <div className="space-y-4">
            {filteredJobs.length === 0 && (
              <div className="flex items-center justify-center py-24">
                <span className="text-gray-500 text-xl font-medium">
                  No jobs found.
                </span>
              </div>
            )}

            {filteredJobs.map((job) => {
              const details = job.job;
              const job_status = details.job_status;

              const calculateTimeLeft = (expiresAt: string) => {
                if (job_status === "completed") return null;

                const now = new Date().getTime();
                const expiry = new Date(expiresAt).getTime();
                const diff = expiry - now;

                const baseClass =
                  "w-[108px] h-[36px] px-[10px] py-[8px] rounded-full border text-xs font-medium flex items-center justify-center";

                if (diff <= 0) {
                  return (
                    <span
                      className={`${baseClass} text-[#014F9D] border border-[#014F9D] flex items-center justify-center gap-1`}
                    >
                      <TimerIcon2 />
                      <span>Expired</span>
                    </span>
                  );
                }

                const hours = Math.floor(diff / (1000 * 60 * 60));
                const minutes = Math.floor(
                  (diff % (1000 * 60 * 60)) / (1000 * 60)
                );

                return (
                  <span
                    className={`${baseClass} text-[#014F9D] border border-[#014F9D] bg-white`}
                  >
                    <TimerIcon2 />
                    {hours > 0
                      ? `${hours}h ${minutes}m Left`
                      : `${minutes}m Left`}
                  </span>
                );
              };

              const timeLeftBadge = details.expires_at
                ? calculateTimeLeft(details.expires_at)
                : null;

              return (
                <div
                  key={job.id}
                  className="flex justify-between items-center bg-[#E9FFFD] p-4 rounded-lg shadow"
                >
                  {/* LEFT SIDE - Icon and Job Info */}
                  <div className="flex items-center gap-4">
                    <div>
                      <Building />
                    </div>

                    <div>
                      <h3 className="font-semibold text-base">
                        {details.property_type || "Appraisal"}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {details.address ?? "—"}
                      </p>

                      <span
                        className={`inline-block mt-2 text-white text-xs font-medium ${getStatusColor(
                          job_status
                        )}`}
                        style={{
                          height: 32,
                          borderRadius: 100,
                          padding: "8px 16px",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          opacity: 1,
                          gap: 10,
                          whiteSpace: "nowrap",
                          width: "auto",
                          minWidth: 60,
                          maxWidth: 200,
                        }}
                      >
                        <LoadIcon />{" "}
                        {(job_status || "-").replace(/_/g, " ").toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* RIGHT SIDE - Timer, User Badge, Action Icons */}
                  <div className="flex items-center gap-2">
                    {/* Timer Badge */}
                    {timeLeftBadge}

                    {/* User Badge */}
                    <span className="w-[108px] h-[36px] px-[10px] py-[8px] rounded-full border border-[#014F9D] text-[#014F9D] text-sm font-medium flex items-center gap-2 overflow-hidden whitespace-nowrap">
                      <ProfileIcon3 className="flex-shrink-0" />
                      <span className="truncate max-w-[60px] md:max-w-[120px]">
                        {details.intended_username}
                      </span>
                    </span>

                    {/* Action Icons */}
                    <div className="flex gap-2 items-center">
                      <button
                        title="Chat"
                        onClick={() => handleChatClick(details.id)}
                        className="hover:text-blue-700 transition-colors"
                      >
                        <Msg />
                      </button>

                      {(job_status === "accepted" || job_status === "active") &&
                        !!details.phone && (
                          <a
                            href={`tel:+${details.country_code}${details.phone}`}
                            title="Call"
                            className="hover:text-blue-700"
                          >
                            <Call />
                          </a>
                        )}

                      {job_status === "site_visit_scheduled" && (
                        <button
                          title="View Property Location"
                          onClick={() => {
                            const address =
                              details.resident_address || details.address || "";
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

                      {job_status !== "completed" && (
                        <button
                          title="Update status"
                          onClick={() => openModal(job)}
                          className="hover:text-blue-700"
                        >
                          {job_status === "post_visit_summary" ? (
                            <Next />
                          ) : (
                            <Update />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {modalJob && modalType === "simple" && (
          <SimpleJobStatusModal
            open={true}
            onClose={closeModal}
            jobId={modalJob.job.id}
            currentStatus={modalJob.job.job_status}
            jobData={modalJob.job}
            onSubmit={(payload) => handleModalSubmit(modalJob.job.id, payload)}
          />
        )}

        {modalJob && modalType === "complex" && (
          <ComplexJobStatusModal
            open={true}
            onClose={closeModal}
            jobId={modalJob.job.id}
            jobData={modalJob.job}
            onSubmit={(payload) => handleModalSubmit(modalJob.job.id, payload)}
          />
        )}
      </div>
    </div>
  );
}
