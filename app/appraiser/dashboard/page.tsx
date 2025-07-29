"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import DashboardLayout from "@/components/dashboard-layout";
import { appraiserJobsApi, AppraiserJob } from "@/app/appraiser/lib/job";
import {  } from "lucide-react";
import { HomeTimerIcon,BuildingIcon,LoadIcon,Select,Reject } from "../../../components/icons";
import { useAppraiserTimer } from "./Timer";

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
  const [loading, setLoading] = useState(true);
  const [jobActionLoading, setJobActionLoading] = useState<string | null>(null);
  
  const { 
    timer, 
    isRunning, 
    toggleLoading,
    initialLoading,
    handleToggle, 
    detectActualTimerState 
  } = useAppraiserTimer();

  // Job handlers with improved feedback
  const handleAcceptJob = async (jobId: string) => {
    if (jobActionLoading) return;
    
    try {
      setJobActionLoading(jobId);
      const loadingToast = toast.loading("Accepting job...");
      
      await appraiserJobsApi.acceptJob(jobId);
      setJobs(prev => prev.filter(job => job.job.id !== jobId));
      
      toast.success("Job accepted successfully!", {
        id: loadingToast,
        description: "You can now start working on this job"
      });
      
    } catch (err) {
      toast.error("Failed to accept job", {
        description: "Please try again or contact support"
      });
    } finally {
      setJobActionLoading(null);
    }
  };

  const handleDeclineJob = async (jobId: string) => {
    if (jobActionLoading) return;
    
    try {
      setJobActionLoading(jobId);
      const loadingToast = toast.loading("Declining job...");
      
      await appraiserJobsApi.declineJob(jobId);
      setJobs(prev => prev.filter(job => job.job.id !== jobId));
      
      toast.success("Job declined", {
        id: loadingToast,
        description: "The job has been removed from your list"
      });
      
    } catch (err) {
      toast.error("Failed to decline job", {
        description: "Please try again or contact support"
      });
    } finally {
      setJobActionLoading(null);
    }
  };

  // Initialize app
  useEffect(() => {
    const initializeApp = async () => {
      try {
        setLoading(true);
        
        // Load jobs first
        const jobsResult = await appraiserJobsApi.getPendingJobs().catch((err) => {
          toast.error("Failed to load jobs", {
            description: "Please refresh the page to try again"
          });
          return [];
        });
        setJobs(jobsResult);
        
        // Detect actual timer state
        await detectActualTimerState();
        
        if (jobsResult.length > 0) {
          toast.info(`${jobsResult.length} pending job${jobsResult.length > 1 ? 's' : ''} found`, {
            
          });
        }
        
      } catch (err) {
        toast.error("Failed to initialize dashboard", {
          description: "Please refresh the page"
        });
      } finally {
        setLoading(false);
      }
    };

    initializeApp();
  }, [detectActualTimerState]);

  const isTimerLoading = initialLoading || toggleLoading;

  return (
    <DashboardLayout role="appraiser">
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
                  {loading ? (
                    "Initializing dashboard..."
                  ) : isTimerLoading ? (
                    "Syncing timer state..."
                  ) : isRunning ? (
                    "Available for new job requests"
                  ) : (
                    "Timer is stopped"
                  )}
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
              <LoadIcon/>
              <span className="text-sm">Loading jobs...</span>
            </div>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-gray-400 mb-2">No jobs assigned yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="flex items-center justify-between bg-[#e8fafa] p-4 rounded-xl shadow-sm"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <BuildingIcon className="text-[#054c99]"  />
                    <h3 className="text-lg font-semibold text-gray-800">
                      {job.job.property_type || "Appraisal Job"}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600">{job.job.address}</p>
                  <span className="inline-flex items-center gap-1 text-xs text-white bg-orange-500 px-2 py-1 rounded-full mt-2">
                    ⏰ {formatTimeLeft(job.job.expires_at)}
                  </span>
                </div>
                
                {/* Enhanced Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAcceptJob(job.job.id)}
                    disabled={jobActionLoading === job.job.id}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-[#054c99] hover:bg-[#043a77] transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {jobActionLoading === job.job.id ? (
                      <LoadIcon className="text-white animate-spin" />
                    ) : (
                      <Select/>
                    )}
                  </button>
                  <button
                    onClick={() => handleDeclineJob(job.job.id)}
                    disabled={jobActionLoading === job.job.id}
                    className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-400 hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {jobActionLoading === job.job.id ? (
                      <LoadIcon/>
                    ) : (
                      <Reject/>
                    )}
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
