"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthLayout from "@/components/auth-layout";
import { OTPInput } from "@/components/otp-input";
import { authApi } from "@/lib/api/auth";
import { toast } from "react-hot-toast";

export function AppraiserVerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const type = searchParams.get("type") || "register"; // "register" or "reset"

  const [otp, setOtp] = useState("");
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);

  // Check if we have valid email
  useEffect(() => {
    if (!email) {
      toast.error("Email is required. Please restart the process.");
      router.push(type === "register" ? "/appraiser/auth/signup" : "/appraiser/auth/forgot-password");
    }
  }, [email, router, type]);

  // Reset timer on email change
  useEffect(() => {
    setTimeLeft(60);
    setCanResend(false);
    setAttempts(0);
    setIsBlocked(false);
  }, [email]);

  // Countdown timer with visual feedback
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
      if (timeLeft === 0) {
        toast("You can now resend the OTP", {
          icon: "⏰",
          duration: 3000,
        });
      }
    }
  }, [timeLeft]);

  // Auto-focus behavior and clear toasts
  useEffect(() => {
    toast.dismiss();
  }, [otp]);

  // Block after too many attempts
  useEffect(() => {
    if (attempts >= 3) {
      setIsBlocked(true);
      toast.error("Too many failed attempts. Please try again in 5 minutes.");
      setTimeout(() => {
        setIsBlocked(false);
        setAttempts(0);
      }, 5 * 60 * 1000); // 5 minutes
    }
  }, [attempts]);

  const handleVerify = async () => {
    if (otp.length !== 4) {
      toast.error("Please enter a complete 4-digit code.");
      return;
    }

    if (isBlocked) {
      toast.error("Too many attempts. Please wait before trying again.");
      return;
    }

    // Visual feedback - show loading immediately
    setLoading(true);
    
    try {
      if (type === "register") {
        // Signup flow
        await authApi.verifyRegisterOtp(email, otp);
        
        // Success feedback with progression
        toast.success("Email verified successfully!");
        setTimeout(() => {
          toast.success("Redirecting to sign in...");
        }, 800);
        
        setTimeout(() => {
          router.push("/appraiser/auth/signin");
        }, 2000);
        
      } else {
        // Reset password flow
        const res = await authApi.verifyOtp(email, otp);
        const userId = res.data.userId;
        
        if (!userId) {
          throw new Error("Invalid response from server. Please try again.");
        }
        
        // Success feedback
        toast.success("OTP verified successfully!");
        setTimeout(() => {
          toast.success("Please set your new password...");
        }, 800);
        
        setTimeout(() => {
          router.push(`/appraiser/auth/set-new-password?userId=${encodeURIComponent(userId)}`);
        }, 1500);
      }
      
      // Reset attempts on success
      setAttempts(0);
      
    } catch (err: any) {
      console.error("OTP verification error:", err);
      
      // Increment failed attempts
      setAttempts(prev => prev + 1);
      
      // Handle different error scenarios with specific messages
      const errorMessage = err?.response?.data?.message?.toLowerCase() || "";
      
      if (errorMessage.includes("invalid") || errorMessage.includes("wrong")) {
        toast.error(`Invalid OTP. ${3 - attempts - 1} attempts remaining.`);
      } else if (errorMessage.includes("expired")) {
        toast.error("OTP has expired. Please request a new one.");
        setCanResend(true);
        setTimeLeft(0);
      } else if (errorMessage.includes("not found") || errorMessage.includes("user")) {
        toast.error("Account not found. Please restart the process.");
        setTimeout(() => {
          router.push(type === "register" ? "/appraiser/auth/signup" : "/appraiser/auth/forgot-password");
        }, 2000);
      } else if (errorMessage.includes("blocked") || errorMessage.includes("limit")) {
        toast.error("Too many attempts. Please try again later.");
        setIsBlocked(true);
      } else {
        toast.error(err?.response?.data?.message || "Verification failed. Please try again.");
      }
      
      // Clear OTP on error for better UX
      setOtp("");
      
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend || resendLoading) return;
    
    setResendLoading(true);
    
    try {
      if (type === "register") {
        await authApi.resendRegisterOtp(email);
      } else {
        await authApi.forgotPassword(email);
      }
      
      // Reset state
      setOtp("");
      setTimeLeft(60);
      setCanResend(false);
      setAttempts(0); // Reset attempts on new OTP
      
      // Success feedback
      toast.success("New OTP sent to your email!");
      toast("Check your inbox and spam folder", {
        icon: "📧",
        duration: 4000,
      });
      
    } catch (err: any) {
      console.error("Resend OTP error:", err);
      
      const errorMessage = err?.response?.data?.message || "";
      
      if (errorMessage.includes("rate") || errorMessage.includes("limit")) {
        toast.error("Please wait before requesting another code.");
      } else if (errorMessage.includes("not found")) {
        toast.error("Email not found. Please restart the process.");
      } else {
        toast.error(errorMessage || "Failed to resend OTP. Please try again.");
      }
    } finally {
      setResendLoading(false);
    }
  };

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Mask email for privacy
  const maskEmail = (email: string) => {
    const [name, domain] = email.split("@");
    if (!name || !domain) return email;
    return `${name[0]}${"*".repeat(Math.max(name.length - 2, 1))}${name.slice(-1)}@${domain}`;
  };

  return (
    <AuthLayout>
      <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center max-w-md mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">
            {type === "reset" ? "Verify Reset Code" : "Verify Your Email"}
          </h1>
          <p className="text-gray-600 mb-2">
            Enter the 4-digit code sent to
          </p>
          <p className="text-orange-500 font-medium">
            {maskEmail(email)}
          </p>
          {attempts > 0 && (
            <p className="text-sm text-red-500 mt-2">
              {3 - attempts} attempts remaining
            </p>
          )}
        </div>

        {/* OTP Input */}
        <div className="mb-8">
          <OTPInput
            length={4}
            value={otp}
            onChange={setOtp}
            onComplete={handleVerify}
          />
          
          {/* Error state indicator */}
          {attempts > 0 && !isBlocked && (
            <p className="text-sm text-red-500 mt-2">
              Please check your code and try again
            </p>
          )}
          
          {isBlocked && (
            <p className="text-sm text-red-600 mt-2 bg-red-50 p-2 rounded">
              Account temporarily blocked. Please try again later.
            </p>
          )}
        </div>

        {/* Timer and Resend */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className={`px-6 py-3 rounded-full font-mono text-sm ${
            timeLeft <= 10 
              ? 'bg-red-100 text-red-600 animate-pulse' 
              : 'bg-gray-200 text-gray-700'
          }`}>
            {timeLeft > 0 ? formatTime(timeLeft) : "Expired"}
          </div>
          
          <button
            onClick={handleResend}
            disabled={!canResend || resendLoading}
            className={`px-6 py-3 rounded-full font-medium transition-all duration-200 ${
              canResend && !resendLoading
                ? "bg-orange-500 text-white hover:bg-orange-600 transform hover:scale-105"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {resendLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Sending...
              </span>
            ) : (
              "Resend OTP"
            )}
          </button>
        </div>

        {/* Verify Button */}
        <button
          onClick={handleVerify}
          disabled={otp.length !== 4 || loading || isBlocked}
          className={`w-full py-4 rounded-full font-medium transition-all duration-200 ${
            otp.length === 4 && !loading && !isBlocked
              ? "bg-[#1e5ba8] text-white hover:bg-[#1a4f96] transform hover:scale-[1.02]"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              Verifying...
            </span>
          ) : (
            "Verify Code"
          )}
        </button>

        {/* Help Text */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 mb-2">
            Didn't receive the code?
          </p>
          <div className="space-x-4">
            <button
              onClick={() => router.push(type === "register" ? "/appraiser/auth/signup" : "/appraiser/auth/forgot-password")}
              className="text-[#1e5ba8] hover:underline text-sm font-medium"
            >
              Try Different Email
            </button>
            <span className="text-gray-300">|</span>
            <button
              onClick={() => router.push("/appraiser/auth/signin")}
              className="text-[#1e5ba8] hover:underline text-sm font-medium"
            >
              Back to Sign In
            </button>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
