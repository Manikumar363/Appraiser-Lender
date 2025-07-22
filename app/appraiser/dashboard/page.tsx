"use client";

import { useEffect, useState, useRef, useCallback } from "react";
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

// Helper functions for time conversion
function durationToSeconds(duration: string): number {
  const [h, m, s] = duration.split(":").map(Number);
  return h * 3600 + m * 60 + s;
}

function secondsToDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [
    String(h).padStart(2, "0"),
    String(m).padStart(2, "0"),
    String(s).padStart(2, "0"),
  ].join(":");
}

export default function AppraiserDashboardPage() {
  const [jobs, setJobs] = useState<AppraiserJob[]>([]);
  const [timer, setTimer] = useState("00:00:00");
  const [isRunning, setIsRunning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toggleLoading, setToggleLoading] = useState(false);
  
  // References for accurate timer calculation
  const timerStartTime = useRef<number>(0);
  const baseSeconds = useRef<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const actualTimerState = useRef<boolean>(false); // Track the REAL state

  // Job handlers
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

  // Clear timer interval
  const clearTimerInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Start local timer counting
  const startLocalTimer = useCallback((currentDuration: string) => {
    clearTimerInterval();
    
    const seconds = durationToSeconds(currentDuration);
    baseSeconds.current = seconds;
    timerStartTime.current = Date.now();
    setTimer(currentDuration);
    
    console.log("▶️ Starting local timer with duration:", currentDuration);
    
    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - timerStartTime.current) / 1000);
      const totalSeconds = baseSeconds.current + elapsed;
      setTimer(secondsToDuration(totalSeconds));
    }, 1000);
  }, [clearTimerInterval]);

  // Stop local timer
  const stopLocalTimer = useCallback((finalDuration: string) => {
    clearTimerInterval();
    setTimer(finalDuration);
    baseSeconds.current = 0;
    timerStartTime.current = 0;
    console.log("⏹️ Stopped local timer with final duration:", finalDuration);
  }, [clearTimerInterval]);

  // Detect actual timer state by trying to start/stop
  const detectActualTimerState = useCallback(async () => {
    try {
      console.log("🔍 Detecting actual timer state...");
      
      // First get the duration for display
      const durationRes = await appraiserJobsApi.getTimerDuration();
      const currentDuration = durationRes.duration || "00:00:00";
      
      console.log("📊 Current duration from server:", currentDuration);
      
      // Try to start timer to detect state
      try {
        const startRes = await appraiserJobsApi.startTimer();
        console.log("✅ Start successful - timer was stopped, now started");
        
        // Timer was stopped, now it's started
        const newDuration = startRes.duration || currentDuration;
        actualTimerState.current = true;
        setIsRunning(true);
        startLocalTimer(newDuration);
        
        return { success: true, wasRunning: false, nowRunning: true };
        
      } catch (startError: any) {
        console.log("❌ Start failed:", startError.response?.data?.message || startError.message);
        
        if (startError.response?.data?.message?.includes("already running") || 
            startError.response?.data?.message?.includes("active timer")) {
          console.log("✅ Timer is actually running");
          
          // Timer is already running
          actualTimerState.current = true;
          setIsRunning(true);
          startLocalTimer(currentDuration);
          
          return { success: true, wasRunning: true, nowRunning: true };
          
        } else {
          console.log("❌ Unknown start error, assuming stopped");
          
          // Unknown error, assume stopped
          actualTimerState.current = false;
          setIsRunning(false);
          stopLocalTimer(currentDuration);
          
          return { success: false, wasRunning: false, nowRunning: false };
        }
      }
      
    } catch (err) {
      console.error("❌ State detection failed:", err);
      
      // Fallback to stopped state
      actualTimerState.current = false;
      setIsRunning(false);
      stopLocalTimer("00:00:00");
      
      return { success: false, wasRunning: false, nowRunning: false };
    }
  }, [startLocalTimer, stopLocalTimer]);

  // Initialize app
  useEffect(() => {
    const initializeApp = async () => {
      try {
        setLoading(true);
        console.log("🚀 Initializing app...");
        
        // Load jobs first
        const jobsResult = await appraiserJobsApi.getPendingJobs().catch(err => {
          console.error("Failed to load jobs:", err);
          return [];
        });
        setJobs(jobsResult);
        
        // Detect actual timer state
        await detectActualTimerState();
        
        console.log("✅ App initialized successfully");
        
      } catch (err) {
        console.error("❌ App initialization failed:", err);
        setTimer("00:00:00");
        setIsRunning(false);
        actualTimerState.current = false;
      } finally {
        setLoading(false);
      }
    };

    initializeApp();
  }, []); // Empty dependency - only run once

  // Handle browser visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log("👁️ Tab became visible, detecting timer state...");
        detectActualTimerState();
      }
    };

    const handleFocus = () => {
      console.log("🎯 Window focused, detecting timer state...");
      detectActualTimerState();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [detectActualTimerState]);

  // Periodic sync (every 5 minutes when running)
  useEffect(() => {
    if (!isRunning) return;
    
    const syncInterval = setInterval(() => {
      console.log("🔄 Periodic sync - detecting timer state...");
      detectActualTimerState();
    }, 5 * 60 * 1000); // 5 minutes
    
    return () => clearInterval(syncInterval);
  }, [isRunning, detectActualTimerState]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log("🧹 Cleaning up timers on unmount");
      clearTimerInterval();
    };
  }, [clearTimerInterval]);

  // Handle timer toggle
  const handleToggle = async () => {
    if (toggleLoading) return;
    
    try {
      setToggleLoading(true);
      console.log("🔄 Toggling timer:", { 
        frontendState: isRunning, 
        actualState: actualTimerState.current 
      });
      
      if (isRunning && actualTimerState.current) {
        console.log("⏹️ Stopping timer...");
        
        try {
          const stopRes = await appraiserJobsApi.stopTimer();
          console.log("✅ Stop successful:", stopRes);
          
          const finalDuration = stopRes.duration || "00:00:00";
          actualTimerState.current = false;
          setIsRunning(false);
          stopLocalTimer(finalDuration);
          
        } catch (stopError: any) {
          console.log("❌ Stop failed:", stopError.response?.data?.message);
          
          if (stopError.response?.data?.message?.includes("No active timer")) {
            console.log("✅ Timer was already stopped, syncing state");
            // Timer was already stopped
            actualTimerState.current = false;
            setIsRunning(false);
            
            const durationRes = await appraiserJobsApi.getTimerDuration();
            stopLocalTimer(durationRes.duration || "00:00:00");
          } else {
            throw stopError;
          }
        }
        
      } else {
        console.log("▶️ Starting timer...");
        
        try {
          const startRes = await appraiserJobsApi.startTimer();
          console.log("✅ Start successful:", startRes);
          
          const newDuration = startRes.duration || "00:00:00";
          actualTimerState.current = true;
          setIsRunning(true);
          startLocalTimer(newDuration);
          
        } catch (startError: any) {
          console.log("❌ Start failed:", startError.response?.data?.message);
          
          if (startError.response?.data?.message?.includes("already running")) {
            console.log("✅ Timer was already running, syncing state");
            // Timer was already running
            actualTimerState.current = true;
            setIsRunning(true);
            
            const durationRes = await appraiserJobsApi.getTimerDuration();
            startLocalTimer(durationRes.duration || "00:00:00");
          } else {
            throw startError;
          }
        }
      }
      
    } catch (err: any) {
      console.error("❌ Toggle timer failed:", err);
      
      // Force state detection on any error
      console.log("🔄 Error occurred, forcing state detection...");
      setTimeout(() => {
        detectActualTimerState();
      }, 500);
      
      alert("Timer operation failed. State has been synced with server.");
      
    } finally {
      setToggleLoading(false);
    }
  };

  return (
    <DashboardLayout role="appraiser">
      <div className="space-y-6">
        {/* Timer Section */}
        <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow border">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 flex items-center justify-center">
                <HomeTimerIcon color={isRunning ? "#00F90A" : "#9CA3AF"} />
              </div>
              <div className="flex flex-col justify-center">
                <div className="text-sm font-medium text-gray-700">{timer}</div>
                <div className="text-sm text-gray-500">
                  {loading ? (
                    "Loading..."
                  ) : isRunning ? (
                    "Available for new job requests."
                  ) : (
                    "Timer is stopped"
                  )}
                </div>
              </div>
            </div>
          </div>
          <div
            onClick={handleToggle}
            className={`w-11 h-6 rounded-full relative cursor-pointer transition duration-300 ${
              loading || toggleLoading ? "opacity-50 cursor-not-allowed" : ""
            } ${isRunning ? "bg-[#00F90A]" : "bg-gray-300"}`}
          >
            <div
              className={`w-4 h-4 bg-white rounded-full shadow absolute top-1 left-1 transition-transform duration-300 ${
                isRunning ? "translate-x-5" : ""
              }`}
            />
            {toggleLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
        </div>

        {/* Jobs Section */}
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
