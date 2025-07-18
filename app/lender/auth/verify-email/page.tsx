"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import AuthLayout from "../../../../components/auth-layout"
import { OTPInput } from "../../../../components/otp-input"
import {userAuth} from "@/lib/api/userAuth";

export default function LenderVerifyEmailPage() {
  const [otp, setOtp] = useState("")
  const [timeLeft, setTimeLeft] = useState(60)
  const [canResend, setCanResend] = useState(false)
  const [error, setError]= useState("");
  const [loading, setLoading]= useState(false);

  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email") || "abc@gmail.com"
  const type = searchParams.get("type") || "register" // default to register if missing

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

  const handleVerify = async () => {
    if (otp.length !== 4) return
    try {
      if (type === "register") {
        await userAuth.verifyRegisterOtp(email, otp)
        router.push("/lender/dashboard")
      } else if (type === "reset") {
        await userAuth.verifyOtp(email, otp)
        router.push(`/lender/auth/set-new-password?email=${encodeURIComponent(email)}`)
      } else {
        throw new Error("Invalid verification type.")
      }
    } catch (err: any) {
      console.error(err)
      setError(err.response?.data?.message || "Invalid OTP.")
      return false
    }
  }

  const handleResend = async () => {
    if (!canResend) return
    try {
      if (type === "register") {
        await userAuth.resendRegisterOtp(email)
      } else if (type === "reset") {
        await userAuth.forgotPassword(email) // for reset, you trigger forgot again to resend OTP
      }
      setTimeLeft(60)
      setCanResend(false)
      setOtp("")
    } catch (err: any) {
      console.error(err)
      setError(err.response?.data?.message || "Failed to resend OTP.")
    }
  }

  return (
    <AuthLayout>
      <div className="flex flex-col justify-center items-center min-h-screen w-full text-center px-4">
        
        <h1 className="text-4xl font-bold text-gray-800 mb-4 self-start text-left">Email Verification</h1>

        <p className="text-gray-600 mb-8 text-base self-start text-left">
          Enter the verification code we just sent on your email address{" "}
          <span className="text-orange-500 font-medium">{email}</span>
        </p>

        <OTPInput length={4} value={otp} onChange={setOtp} onComplete={()=>{}}/>

        {error && <p className="text-red-600 mt-2 text-sm">{error}</p>}

        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="bg-blue-200 text-blue-800 px-5 py-2 rounded-full font-medium text-base border border-[#014F9D]">
            {formatTime(timeLeft)}
          </div>
          <button
            onClick={handleResend}
            disabled={!canResend}
            className={`px-5 py-2 rounded-full font-medium transition-colors text-base ${
              canResend
                ? "bg-orange-600 text-white hover:bg-orange-600"
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
          {loading ? "Verifying..." : "Verify"}
        </button>
      </div>
    </AuthLayout>
  )
}
