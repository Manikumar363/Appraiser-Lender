"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import AuthLayout from "../../../../components/auth-layout"
import { AuthInput } from "../../../../components/auth-input"
import { useRouter } from "next/navigation"
import { userAuth } from "@/lib/api/userAuth"

export default function LenderForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const router = useRouter()
  const [loading, setLoading]= useState(false)
  const [error, setError]= useState("")

  const handleSubmit =async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    // Handle forgot password logic here
     try {
    // 🔥 Call forgot password API
    const res = await userAuth.forgotPassword(email)

    console.log("Forgot password response:", res)

    // ✅ Redirect to verify email/OTP screen
    router.push(`/lender/auth/verify-email?email=${encodeURIComponent(email)}&type=reset`)
  } catch (err: any) {
    console.error("Forgot password error:", err)
    setError(err.response?.data?.message || "Something went wrong.Please try again.")
  } finally {
    setLoading(false)
  }
  }

  return (
    <AuthLayout>
      <div className="flex items-center justify-center min-h-screen px-6">
    <div className="w-full max-w-[713px]">
      <div className="mb-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-5">Forgot Password</h1>
        <p className="text-gray-800 text-base">
          Don't worry! It occurs. Please enter the email address linked with your account.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthInput
          type="email"
          placeholder="Type your email here"
          value={email}
          onChange={setEmail}
          icon="email"
        />

        <button
         type="submit"
         disabled={loading}
         className={`w-full bg-[#1e5ba8] text-white py-4 rounded-full font-medium transition-colors ${
           loading ? "opacity-60 cursor-not-allowed" : "hover:bg-[#1a4f96]"
         }`}
        >
          {loading ? "Sending..." : "Send Code"}
        </button>
      </form>
      {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
    </div>
  </div>
    </AuthLayout>
  )
}
