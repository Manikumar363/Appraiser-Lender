"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { appraiserJobsApi, AppraiserJob } from "@/app/appraiser/lib/job";
import {
  HomeTimerIcon,
  BuildingIcon,
  LoadIcon,
  Select,
  Reject,
  TimerIcon,
} from "../../../components/icons";
import { useAppraiserTimer } from "./Timer";

interface DashboardContentProps {
  searchQuery?: string;
}

function formatTimeLeft(expiry: string): string {
  const now = new Date();
  const exp = new Date(expiry);
  const diffMs = exp.getTime() - now.getTime();
  if (diffMs <= 0) return "Expired";
  const mins = Math.floor(diffMs / 60000);
  return `${mins} Min Left`;
}

export default function DashboardContent({
  searchQuery = "",
}: DashboardContentProps) {
  const [jobs, setJobs] = useState<AppraiserJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [jobActionLoading, setJobActionLoading] = useState<string | null>(null);

  const {
    timer,
    isRunning,
    toggleLoading,
    initialLoading,
    handleToggle,
    detectActualTimerState,
  } = useAppraiserTimer();

  const handleAcceptJob = async (jobId: string) => {
    if (jobActionLoading) return;

    try {
      setJobActionLoading(jobId);
      await appraiserJobsApi.acceptJob(jobId);
      setJobs((prev) => prev.filter((job) => job.job.id !== jobId));
      toast.success("Job accepted successfully!");
    } catch (err) {
      toast.error("Failed to accept job");
    } finally {
      setJobActionLoading(null);
    }
  };

  const handleDeclineJob = async (jobId: string) => {
    if (jobActionLoading) return;

    try {
      setJobActionLoading(jobId);
      await appraiserJobsApi.declineJob(jobId);
      setJobs((prev) => prev.filter((job) => job.job.id !== jobId));
      toast.success("Job declined");
    } catch (err) {
      toast.error("Failed to decline job");
    } finally {
      setJobActionLoading(null);
    }
  };

  // Initialize app
  useEffect(() => {
    const initializeApp = async () => {
      try {
        setLoading(true);

        const jobsResult = await appraiserJobsApi.getPendingJobs().catch(() => {
          toast.error("Failed to load jobs");
          return [];
        });

        setJobs(jobsResult);
        await detectActualTimerState();
      } catch (err) {
        toast.error("Failed to initialize dashboard");
      } finally {
        setLoading(false);
      }
    };

    initializeApp();
  }, [detectActualTimerState]);

  // Filter jobs based on search query
  const filteredJobs = jobs.filter((job) => {
    if (!searchQuery) return true;
    const details = job.job;
    return (
      details.property_type
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      details.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      details.intended_username
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
  });

  const isTimerLoading = initialLoading || toggleLoading;

  return (
    <div className="space-y-6">
      {/* Timer Section */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow border">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center">
              {isTimerLoading ? (
                <LoadIcon className="animate-spin text-gray-400" />
              ) : (
                <HomeTimerIcon color={isRunning ? "#00F90A" : "#9CA3AF"} />
              )}
            </div>
            <div className="flex flex-col justify-center">
              <div className="text-sm font-medium text-gray-700">
                {isTimerLoading ? "Loading..." : timer}
              </div>
              <div className="text-sm text-gray-500">
                {loading
                  ? "Initializing dashboard..."
                  : isTimerLoading
                  ? "Syncing timer state..."
                  : isRunning
                  ? "Available for new job requests"
                  : "Timer is stopped"}
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Toggle Switch */}
        <div
          onClick={handleToggle}
          className={`w-11 h-6 rounded-full relative cursor-pointer transition duration-300 ${
            loading || isTimerLoading ? "opacity-50 cursor-not-allowed" : ""
          } ${isRunning ? "bg-[#00F90A]" : "bg-gray-300"}`}
        >
          <div
            className={`w-4 h-4 bg-white rounded-full shadow absolute top-1 left-1 transition-transform duration-300 ${
              isRunning ? "translate-x-5" : ""
            }`}
          />
          {isTimerLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <LoadIcon className="w-3 h-3 text-gray-600 animate-spin" />
            </div>
          )}
        </div>
      </div>

      {/* Jobs Section */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-3 text-gray-500">
            <LoadIcon className="w-4 h-4 text-[#2A020D] animate-spin" />
            <span className="text-sm">Loading jobs...</span>
          </div>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-gray-400 mb-2">
            {searchQuery
              ? "No jobs found matching your search."
              : "No jobs assigned yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className="flex items-center justify-between bg-[#e8fafa] p-4 rounded-xl shadow-sm"
            >
              {/* LEFT SIDE - Fixed Layout Structure */}
              <div className="flex items-center gap-4">
                {/* Building Icon in Blue Circle */}
                <div className="w-12 h-12 bg-[#2A020D] rounded-full flex items-center justify-center flex-shrink-0">
                  <BuildingIcon className="w-6 h-6 text-white" />
                </div>

                {/* Job Details - Properly Stacked */}
                <div className="flex flex-col">
                  {/* Job Title */}
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">
                    {job.job.property_type || "Residential Appraisal"}
                  </h3>

                  {/* Address */}
                  <p className="text-sm text-gray-600 mb-2">
                    {job.job.address}
                  </p>

                  {/* Timer Badge */}
                  <span className="inline-flex items-center gap-1 text-xs text-white bg-[#FD5D2D] px-2 py-0.5 rounded-full w-fit">
                    <TimerIcon /> {formatTimeLeft(job.job.expires_at)}
                  </span>
                </div>
              </div>

              {/* RIGHT SIDE - Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleAcceptJob(job.job.id)}
                  disabled={jobActionLoading === job.job.id}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-[#2A020D] hover:bg-[#4e1b29] transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {jobActionLoading === job.job.id ? (
                    <LoadIcon className="text-white animate-spin" />
                  ) : (
                    <Select />
                  )}
                </button>
                <button
                  onClick={() => handleDeclineJob(job.job.id)}
                  disabled={jobActionLoading === job.job.id}
                  className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-400 hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {jobActionLoading === job.job.id ? <LoadIcon /> : <Reject />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
