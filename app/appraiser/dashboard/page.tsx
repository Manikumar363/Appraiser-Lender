"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard-layout";

import { appraiserJobsApi, AppraiserJob } from "@/app/appraiser/lib/job";
import { CheckCircle, XCircle, Building2 } from "lucide-react";

// Utility
function formatTimeLeft(expiry: string): string {
  const now = new Date();
  const exp = new Date(expiry);
  const diffMs = exp.getTime() - now.getTime();
  if (diffMs <= 0) return "Expired";
  const mins = Math.floor(diffMs / 60000);
  return `${mins} Min Left`;
}

export default function AppraiserDashboardPage() {
  const [jobs, setJobs] = useState<AppraiserJob[]>([]);
  const [timer, setTimer] = useState("00:00:00");
  const [isAvailable, setIsAvailable] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log("📡 Fetching pending jobs and timer duration...");
        const [jobList, duration] = await Promise.all([
          appraiserJobsApi.getPendingJobs(),
          appraiserJobsApi.getTimerDuration(),
        ]);
        console.log("✅ Pending jobs response:", jobList);
        console.log("⏱ Timer duration:", duration);
        setJobs(jobList);
        setTimer(duration);
        setIsAvailable(duration !== "00:00:00");
      } catch (err) {
        console.error("❌ Failed to load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleToggle = async () => {
    try {
      console.log("🔄 Toggling availability. Current:", isAvailable);
      if (isAvailable) {
        const res = await appraiserJobsApi.stopTimer();
        console.log("🛑 Stopped timer:", res);
        setIsAvailable(false);
        setTimer("00:00:00");
      } else {
        const res = await appraiserJobsApi.startTimer();
        console.log("✅ Started timer:", res);
        setIsAvailable(true);
        setTimer(res.duration || "00:00:01");
      }
    } catch (err) {
      console.error("❌ Error toggling availability:", err);
    }
  };

  useEffect(() => {
    console.log("📦 Updated job state:", jobs);
  }, [jobs]);

  return (
    <DashboardLayout role="appraiser">
      <div className="space-y-6">
        {/* Timer/Availability Switch */}
        <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow border">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${isAvailable ? "bg-green-500" : "bg-gray-400"} animate-pulse`} />
            <span className="text-sm font-medium text-gray-700">
              {timer} Available For New Job Requests.
            </span>
          </div>
          <div
  onClick={handleToggle}
  className={`w-11 h-6 rounded-full transition duration-300 relative cursor-pointer ${
    isAvailable ? "bg-green-600" : "bg-gray-300"
  }`}
>
  <div
    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transform transition-transform duration-300 ${
      isAvailable ? "translate-x-5" : ""
    }`}
  />
</div>

        </div>

        {/* Jobs Section */}
        {loading ? (
          <p className="text-center text-sm text-gray-500">Loading jobs...</p>
        ) : jobs.length === 0 ? (
          <p className="text-center text-sm text-gray-400">No jobs assigned yet.</p>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => {
              console.log("🧾 Rendering job card:", job);
              return (
                <div
                  key={job.id}
                  className="flex items-center justify-between bg-[#e8fafa] p-4 rounded-xl shadow-sm"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <Building2 className="text-[#054c99]" size={20} />
                      <h3 className="text-lg font-semibold text-gray-800">
                        {job.job.property_type || "Appraisal Job"}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600">{job.job.address}</p>
                    <span className="inline-flex items-center gap-1 text-xs text-white bg-orange-500 px-2 py-1 rounded-full mt-2">
                      ⏰ {formatTimeLeft(job.job.expires_at)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="w-10 h-10 flex items-center justify-center rounded-full bg-[#054c99] hover:bg-[#043a77] transition">
                      <CheckCircle className="text-white" size={20} />
                    </button>
                    <button className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-400 hover:bg-gray-100 transition">
                      <XCircle className="text-gray-600" size={20} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
