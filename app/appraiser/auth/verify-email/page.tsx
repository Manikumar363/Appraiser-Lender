"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import AuthLayout from "@/components/auth-layout"
import { OTPInput } from "@/components/otp-input"
import { authApi } from "@/lib/api/auth"
// Make sure to install react-hot-toast: npm i react-hot-toast
import { toast } from "react-hot-toast"

export default function AppraiserVerifyEmailPage() {
  const [otp, setOtp] = useState("")
  const [timeLeft, setTimeLeft] = useState(60)
  const [canResend, setCanResend] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  const email = searchParams.get("email") || ""
  const type = searchParams.get("type") || "register" // default to register if missing

  // Reset timer when component mounts
  useEffect(() => {
    setTimeLeft(60)
  }, [email])

  // Decrement timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      setCanResend(true)
    }
  }, [timeLeft])

  // Reset toast/error on OTP change
  useEffect(() => {
    toast.dismiss() // dismiss any previous toast
  }, [otp])

  // OTP Verification handler
  const handleVerify = async () => {
    if (otp.length !== 4) return
    setLoading(true)
    try {
      
        await authApi.verifyRegisterOtp(email, otp)
        toast.success("Email verified! You can now sign in.")
        router.push("/appraiser/auth/signin")
    } catch (err: any) {
      // Show API error
      toast.error(err.response?.data?.message || "Invalid OTP. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Resend OTP handler
  const handleResend = async () => {
    if (!canResend) return
    try {
     
        await authApi.resendRegisterOtp(email)
      toast.success("OTP resent to your email.")
      setOtp("")
      setTimeLeft(60)
      setCanResend(false)
      toast.success("OTP resent to your email.")
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to resend OTP.")
    }
  }

  return (
    <AuthLayout>
      <div className="flex flex-col justify-center items-center min-h-screen w-full text-center px-4">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Verify Your Email</h1>
        <p className="text-gray-600 mb-4">
          Code sent to <span className="text-orange-500">{email}</span>
        </p>

        <OTPInput
          length={4}
          value={otp}
          onChange={setOtp}
          onComplete={handleVerify}
        />

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
          disabled={otp.length !== 4 || loading}
          className={`w-full py-4 rounded-full font-medium flex items-center justify-center ${
            otp.length === 4 && !loading
              ? "bg-[#1e5ba8] text-white"
              : "bg-gray-300 text-gray-500"
          }`}
        >
          {loading ? (
            <span className="loader mr-2"></span> // You can use a spinner or just write "Verifying..."
          ) : (
            "Verify"
          )}
        </button>
      </div>
    </AuthLayout>
  )
}
