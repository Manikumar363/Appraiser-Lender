"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard-layout";
import { appraiserJobsApi, AppraiserJob } from "@/app/appraiser/lib/job";
import { CheckCircle, XCircle, Building2 } from "lucide-react";
import { HomeTimerIcon } from "../../../components/icons";

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
  const [isRunning, setIsRunning] = useState(false);
  const [loading, setLoading] = useState(true);

//accpt and decline job
const handleAcceptJob = async (jobId: string) => {
  try {
    await appraiserJobsApi.acceptJob(jobId);
    setJobs(prev => prev.filter(job => job.job.id !== jobId));
  } catch (err) {
    console.error("❌ Accept job failed", err);
    alert("Failed to accept the job.");
  }
};

const handleDeclineJob = async (jobId: string) => {
  try {
    await appraiserJobsApi.declineJob(jobId);
    setJobs(prev => prev.filter(job => job.job.id !== jobId));
  } catch (err) {
    console.error("❌ Decline job failed", err);
    alert("Failed to decline the job.");
  }
};


  // 🔁 Tick logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setTimer((prev) => {
          const [h, m, s] = prev.split(":").map(Number);
          const total = h * 3600 + m * 60 + s + 1;
          return [
            String(Math.floor(total / 3600)).padStart(2, "0"),
            String(Math.floor((total % 3600) / 60)).padStart(2, "0"),
            String(total % 60).padStart(2, "0"),
          ].join(":");
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  // 🔁 On Load
  useEffect(() => {
    const load = async () => {
      try {
        const [jobList, durationRes, statusCheck] = await Promise.all([
          appraiserJobsApi.getPendingJobs(),
          appraiserJobsApi.getTimerDuration(),
          appraiserJobsApi.stopTimer(), 
        ]);

        setJobs(jobList);
        setTimer(durationRes.duration);
        setIsRunning(statusCheck.status); 
      } catch (err) {
        console.error("Init error:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const handleToggle = async () => {
    try {
      if (isRunning) {
        const stopRes = await appraiserJobsApi.stopTimer();
        setTimer(stopRes.duration);
        setIsRunning(false);
      } else {
        const startRes = await appraiserJobsApi.startTimer();
        setTimer(startRes.duration);
        setIsRunning(true);
      }
    } catch (err) {
      console.error("Toggle error:", err);
      alert("Failed to toggle timer.");
    }
  };

  return (
    <DashboardLayout role="appraiser">
      <div className="space-y-6">
        <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow border">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 flex items-center justify-center">
              <HomeTimerIcon color={isRunning ? "#00F90A" : "#9CA3AF"} />
              </div>
              <div className="flex flex-col justify-center">
              <div className="text-sm font-medium text-gray-700">{timer}</div>
              <div className="text-sm text-gray-500">
                {isRunning ? "Available for new job requests." : "Timer is stopped"}
              </div>
              </div>
            </div>
          </div>
            <div
            onClick={handleToggle}
            className={`w-11 h-6 rounded-full relative cursor-pointer transition duration-300 ${
              isRunning ? "bg-[#00F90A]" : "bg-gray-300"
            }`}
            >
            <div
              className={`w-4 h-4 bg-white rounded-full shadow absolute top-1 left-1 transition-transform duration-300 ${
              isRunning ? "translate-x-5" : ""
              }`}
            />
            </div>
        </div>

        {loading ? (
          <p className="text-center text-sm text-gray-500">Loading jobs...</p>
        ) : jobs.length === 0 ? (
          <p className="text-center text-sm text-gray-400">No jobs assigned yet.</p>
        ) : (
          <div className="space-y-4">
          
            {jobs.map((job) => (
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
                 <button
  onClick={() => handleAcceptJob(job.job.id)}
  className="w-10 h-10 flex items-center justify-center rounded-full bg-[#054c99] hover:bg-[#043a77] transition"
>
  <CheckCircle className="text-white" size={20} />
</button>

<button
  onClick={() => handleDeclineJob(job.job.id)}
  className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-400 hover:bg-gray-100 transition"
>
  <XCircle className="text-gray-600" size={20} />
</button>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
