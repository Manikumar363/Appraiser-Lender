"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthLayout from "@/components/auth-layout";
import { OTPInput } from "@/components/otp-input";
import { authApi } from "@/lib/api/auth";

export default function AppraiserVerifyEmailPage() {
  const [otp, setOtp] = useState("");
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  const handleVerify = async () => {
    if (otp.length !== 4) return;
    try {
      await authApi.verifyRegisterOtp(email, otp);
      router.push("/appraiser/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid OTP.");
    }
  };

  const handleResend = async () => {
  if (!canResend) return;

  try {
    console.log("Resending OTP for:", email);
    await authApi.resendRegisterOtp(email);
    console.log("OTP resent successfully!");
    setTimeLeft(60);
    setCanResend(false);
    setOtp("");
  } catch (err: any) {
    console.error("Resend failed:", err);
    setError(err.response?.data?.message || "Failed to resend OTP.");
  }
};

  return (
    <AuthLayout>
      <div className="flex flex-col justify-center items-center min-h-screen w-full text-center px-4">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Verify Your Email</h1>
        <p className="text-gray-600 mb-4">Code sent to <span className="text-orange-500">{email}</span></p>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <OTPInput length={4} value={otp} onChange={setOtp} onComplete={handleVerify} />

        <div className="flex items-center justify-center gap-4 mb-8 mt-6">
          <div className="bg-gray-200 px-6 py-3 rounded-full">{timeLeft}s</div>
          <button
            onClick={handleResend}
            disabled={!canResend}
            className={`px-6 py-3 rounded-full font-medium ${
              canResend ? "bg-orange-500 text-white" : "bg-gray-300 text-gray-500"
            }`}
          >
            Resend OTP
          </button>
        </div>

        <button
          onClick={handleVerify}
          disabled={otp.length !== 4}
          className={`w-full py-4 rounded-full font-medium ${
            otp.length === 4
              ? "bg-[#1e5ba8] text-white"
              : "bg-gray-300 text-gray-500"
          }`}
        >
          Verify
        </button>
      </div>
    </AuthLayout>
  );
}
