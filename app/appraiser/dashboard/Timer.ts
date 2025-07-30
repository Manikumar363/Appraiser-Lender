"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import { toast } from "sonner";
import { appraiserJobsApi } from "@/app/appraiser/lib/job";

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

export function useAppraiserTimer() {
  const [timer, setTimer] = useState("00:00:00");
  const [isRunning, setIsRunning] = useState(false);
  const [toggleLoading, setToggleLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  
  // References for accurate timer calculation
  const timerStartTime = useRef<number>(0);
  const baseSeconds = useRef<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const actualTimerState = useRef<boolean>(false);

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
  }, [clearTimerInterval]);

  // Detect actual timer state by trying to start/stop
  const detectActualTimerState = useCallback(async () => {
    try {
      // First get the duration for display
      const durationRes = await appraiserJobsApi.getTimerDuration();
      const currentDuration = durationRes.duration || "00:00:00";
      
      // Try to start timer to detect state
      try {
        const startRes = await appraiserJobsApi.startTimer();
        
        // Timer was stopped, now it's started
        const newDuration = startRes.duration || currentDuration;
        actualTimerState.current = true;
        setIsRunning(true);
        startLocalTimer(newDuration);
        
        if (!initialLoading) {
          toast.success("Timer started automatically", {
            description: "Synchronized with server state"
          });
        }
        
        return { success: true, wasRunning: false, nowRunning: true };
        
      } catch (startError: any) {
        if (startError.response?.data?.message?.includes("already running") || 
            startError.response?.data?.message?.includes("active timer")) {
          
          // Timer is already running
          actualTimerState.current = true;
          setIsRunning(true);
          startLocalTimer(currentDuration);
          
          return { success: true, wasRunning: true, nowRunning: true };
          
        } else {
          // Unknown error, assume stopped
          actualTimerState.current = false;
          setIsRunning(false);
          stopLocalTimer(currentDuration);
          
          return { success: false, wasRunning: false, nowRunning: false };
        }
      }
      
    } catch (err) {
      // Fallback to stopped state
      actualTimerState.current = false;
      setIsRunning(false);
      stopLocalTimer("00:00:00");
      
      if (!initialLoading) {
        toast.error("Failed to sync timer state", {
          description: "Please try refreshing the page"
        });
      }
      
      return { success: false, wasRunning: false, nowRunning: false };
    } finally {
      setInitialLoading(false);
    }
  }, [startLocalTimer, stopLocalTimer, initialLoading]);

  // Handle timer toggle
  const handleToggle = async () => {
    if (toggleLoading) return;
    
    try {
      setToggleLoading(true);
      
      if (isRunning && actualTimerState.current) {
        // Show loading toast
        const loadingToast = toast.loading("Stopping timer...");
        
        try {
          const stopRes = await appraiserJobsApi.stopTimer();
          
          const finalDuration = stopRes.duration || "00:00:00";
          actualTimerState.current = false;
          setIsRunning(false);
          stopLocalTimer(finalDuration);
          
          toast.success("Timer stopped successfully", {
            id: loadingToast,
            description: `Final time: ${finalDuration}`
          });
          
        } catch (stopError: any) {
          if (stopError.response?.data?.message?.includes("No active timer")) {
            // Timer was already stopped
            actualTimerState.current = false;
            setIsRunning(false);
            
            const durationRes = await appraiserJobsApi.getTimerDuration();
            stopLocalTimer(durationRes.duration || "00:00:00");
            
            toast.success("Timer synchronized", {
              id: loadingToast,
              description: "Timer was already stopped"
            });
          } else {
            throw stopError;
          }
        }
        
      } else {
        // Show loading toast
        const loadingToast = toast.loading("Starting timer...");
        
        try {
          const startRes = await appraiserJobsApi.startTimer();
          
          const newDuration = startRes.duration || "00:00:00";
          actualTimerState.current = true;
          setIsRunning(true);
          startLocalTimer(newDuration);
          
          toast.success("Timer started successfully", {
            id: loadingToast,
            description: "You're now available for jobs"
          });
          
        } catch (startError: any) {
          if (startError.response?.data?.message?.includes("already running")) {
            // Timer was already running
            actualTimerState.current = true;
            setIsRunning(true);
            
            const durationRes = await appraiserJobsApi.getTimerDuration();
            startLocalTimer(durationRes.duration || "00:00:00");
            
            toast.success("Timer synchronized", {
              id: loadingToast,
              description: "Timer was already running"
            });
          } else {
            throw startError;
          }
        }
      }
      
    } catch (err: any) {
      toast.error("Timer operation failed", {
        description: "Syncing with server state..."
      });
      
      // Force state detection on any error
      setTimeout(() => {
        detectActualTimerState();
      }, 500);
      
    } finally {
      setToggleLoading(false);
    }
  };

  // Handle browser visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        detectActualTimerState();
      }
    };

    const handleFocus = () => {
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
      detectActualTimerState();
    }, 5 * 60 * 1000); // 5 minutes
    
    return () => clearInterval(syncInterval);
  }, [isRunning, detectActualTimerState]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimerInterval();
    };
  }, [clearTimerInterval]);

  return {
    timer,
    isRunning,
    toggleLoading,
    initialLoading,
    handleToggle,
    detectActualTimerState,
  };
}
