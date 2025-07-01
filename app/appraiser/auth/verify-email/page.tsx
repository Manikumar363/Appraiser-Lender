"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import AuthLayout from "../../../../components/auth-layout"
import { OTPInput } from "../../../../components/otp-input"

export default function LenderVerifyEmailPage() {
  const [otp, setOtp] = useState("")
  const [timeLeft, setTimeLeft] = useState(60)
  const [canResend, setCanResend] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email") || "abc@gmail.com"

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      setCanResend(true)
    }
  }, [timeLeft])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleOTPComplete = (otpValue: string) => {
    // Handle OTP verification logic here
    console.log("Lender OTP entered:", otpValue)
  }

  const handleVerify = () => {
    if (otp.length === 4) {
      // Handle verification logic here
      console.log("Verifying Lender OTP:", otp)
      router.push("/lender/dashboard")
    }
  }

  const handleResendOTP = () => {
    if (canResend) {
      // Handle resend OTP logic here
      console.log("Resending Lender OTP")
      setTimeLeft(60)
      setCanResend(false)
      setOtp("")
    }
  }

  return (
    <AuthLayout>
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Email Verification</h1>

        <p className="text-gray-600 mb-8 text-base">
          Enter the verification code we just sent on your email address{" "}
          <span className="text-orange-500 font-medium">{email}</span>
        </p>

        <OTPInput length={4} value={otp} onChange={setOtp} onComplete={handleOTPComplete} />

        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="bg-gray-200 text-gray-600 px-6 py-3 rounded-full font-medium text-base">
            {formatTime(timeLeft)}
          </div>
          <button
            onClick={handleResendOTP}
            disabled={!canResend}
            className={`px-6 py-3 rounded-full font-medium transition-colors text-base ${
              canResend
                ? "bg-orange-500 text-white hover:bg-orange-600"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            Resend OTP
          </button>
        </div>

        <button
          onClick={handleVerify}
          disabled={otp.length !== 4}
          className={`w-full py-4 rounded-full font-medium transition-colors text-base ${
            otp.length === 4
              ? "bg-[#1e5ba8] text-white hover:bg-[#1a4f96]"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Verify
        </button>
      </div>
    </AuthLayout>
  )
}
