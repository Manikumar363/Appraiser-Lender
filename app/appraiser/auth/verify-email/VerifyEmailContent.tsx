"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthLayout from "@/components/auth-layout";
import { OTPInput } from "@/components/otp-input";
import { authApi } from "@/lib/api/auth";
import toast, { Toaster } from "react-hot-toast";

export function AppraiserVerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const type = searchParams.get("type") || "register";

  const [otp, setOtp] = useState("");
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [error, setError] = useState(""); // Add error state like lender side

  // Check if we have valid email
  useEffect(() => {
    if (!email) {
      toast.error("Email is required. Please restart the process.");
      router.push(
        type === "register"
          ? "/appraiser/auth/signup"
          : "/appraiser/auth/forgot-password"
      );
    }
  }, [email, router, type]);

  // Reset timer on email change
  useEffect(() => {
    setTimeLeft(60);
    setCanResend(false);
    setAttempts(0);
    setIsBlocked(false);
  }, [email]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  // Block after too many attempts
  useEffect(() => {
    if (attempts >= 3) {
      setIsBlocked(true);
      toast.error("Too many failed attempts. Please try again in 5 minutes.");
      setTimeout(() => {
        setIsBlocked(false);
        setAttempts(0);
      }, 5 * 60 * 1000);
    }
  }, [attempts]);

  // Format time like lender side
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleVerify = async () => {
    if (otp.length !== 4) {
      setError("Please enter the complete 4-digit code.");
      return;
    }

    if (isBlocked) {
      toast.error("Too many attempts. Please wait before trying again.");
      return;
    }

    setLoading(true);
    setError(""); // Clear previous errors
    const loadingToast = toast.loading("Verifying your code...");

    try {
      if (type === "register") {
        await authApi.verifyRegisterOtp(email, otp);

        toast.success(
          "Email verified successfully! Redirecting to sign in...",
          {
            id: loadingToast,
            duration: 3000,
          }
        );

        setTimeout(() => {
          router.push("/appraiser/auth/signin");
        }, 1500);
      } else {
        const res = await authApi.verifyOtp(email, otp);
        const userId = res.data.userId;

        if (!userId) {
          throw new Error("Invalid response from server. Please try again.");
        }

        toast.success("Code verified! Please set your new password.", {
          id: loadingToast,
          duration: 3000,
        });

        setTimeout(() => {
          router.push(
            `/appraiser/auth/set-new-password?userId=${encodeURIComponent(
              userId
            )}`
          );
        }, 1500);
      }

      setAttempts(0);
    } catch (err: any) {
      setAttempts((prev) => prev + 1);

      const errorMessage = err?.response?.data?.message?.toLowerCase() || "";

      if (errorMessage.includes("invalid") || errorMessage.includes("wrong")) {
        const remainingAttempts = 3 - attempts - 1;
        const errorMsg = `Invalid code. ${remainingAttempts} attempts remaining.`;
        setError(errorMsg);
        toast.error(errorMsg, { id: loadingToast });
      } else if (errorMessage.includes("expired")) {
        setError("Code has expired. Please request a new one.");
        toast.error("Code has expired. Please request a new one.", {
          id: loadingToast,
        });
        setCanResend(true);
        setTimeLeft(0);
      } else {
        const errorMsg =
          err?.response?.data?.message ||
          "Verification failed. Please try again.";
        setError(errorMsg);
        toast.error(errorMsg, { id: loadingToast });
      }

      setOtp("");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend || resendLoading) return;

    setResendLoading(true);
    setError(""); // Clear previous errors
    const loadingToast = toast.loading("Sending new code...");

    try {
      if (type === "register") {
        await authApi.resendRegisterOtp(email);
      } else {
        await authApi.forgotPassword(email);
      }

      setOtp("");
      setTimeLeft(60);
      setCanResend(false);
      setAttempts(0);

      toast.success("New verification code sent to your email!", {
        id: loadingToast,
        duration: 4000,
      });
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || "";

      if (errorMessage.includes("rate") || errorMessage.includes("limit")) {
        setError("Please wait before requesting another code.");
        toast.error("Please wait before requesting another code.", {
          id: loadingToast,
        });
      } else {
        const errorMsg =
          errorMessage || "Failed to send code. Please try again.";
        setError(errorMsg);
        toast.error(errorMsg, { id: loadingToast });
      }
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#ffffff",
            color: "#374151",
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            fontSize: "14px",
            maxWidth: "450px",
            padding: "12px 16px",
          },
          success: {
            iconTheme: { primary: "#10b981", secondary: "#ffffff" },
          },
          error: {
            iconTheme: { primary: "#ef4444", secondary: "#ffffff" },
          },
        }}
      />

      {/* UI Structure matching lender side exactly */}
      <div className="flex flex-col justify-center items-center min-h-screen w-full text-center px-4">
        <h1 className="text-4xl font-bold text-gray-800 mb-4 self-start text-left">
          Email Verification
        </h1>

        <p className="text-gray-600 mb-8 text-base self-start text-left">
          Enter the verification code we just sent on your email address{" "}
          <span className="text-orange-500 font-medium">{email}</span>
          {attempts > 0 && (
            <span className="block text-red-500 text-sm mt-1">
              {3 - attempts} attempts remaining
            </span>
          )}
        </p>

        <OTPInput
          length={4}
          value={otp}
          onChange={setOtp}
          onComplete={() => {}}
        />

        {error && (
          <p className="text-red-600 text-sm text-center mt-0 mb-0">{error}</p>
        )}

        {isBlocked && (
          <p className="text-red-600 text-sm text-center mt-2 mb-0 bg-red-50 p-2 rounded">
            Account temporarily blocked. Please try again later.
          </p>
        )}

        <div className="flex items-center justify-center gap-4 mb-8 mt-2">
          <div className="bg-blue-200 text-blue-800 px-5 py-2 rounded-full font-medium text-base border border-[#2A020D]">
            {formatTime(timeLeft)}
          </div>
          <button
            onClick={handleResend}
            disabled={!canResend || resendLoading}
            className={`px-5 py-2 rounded-full font-medium transition-colors text-base ${
              canResend && !resendLoading
                ? "bg-orange-600 text-white hover:bg-orange-600"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {resendLoading ? "Sending..." : "Resend OTP"}
          </button>
        </div>

        <button
          onClick={handleVerify}
          disabled={otp.length !== 4 || loading || isBlocked}
          className={`w-full py-4 rounded-full font-medium transition-colors text-base ${
            otp.length === 4 && !loading && !isBlocked
              ? "bg-[#2A020D] text-white hover:bg-[#4e1b29]"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          {loading ? "Verifying..." : "Verify"}
        </button>
      </div>
    </AuthLayout>
  );
}
