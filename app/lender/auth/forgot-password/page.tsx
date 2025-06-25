"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import AuthLayout from "../../components/auth-layout"
import { AuthInput } from "../../components/auth-input"
import { useRouter } from "next/navigation"

export default function LenderForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle forgot password logic here
    console.log("Lender Forgot password for:", email)

    // After sending reset email, redirect to verification or show success message
    router.push(`/lender/auth/verify-email?email=${encodeURIComponent(email)}`)
  }

  return (
    <AuthLayout>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Forgot Password</h1>
        <p className="text-gray-600 text-base">Enter your email address and we'll send you a reset link.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <AuthInput type="email" placeholder="Type your email here" value={email} onChange={setEmail} icon="email" />

        <button
          type="submit"
          className="w-full bg-[#1e5ba8] text-white py-4 rounded-full font-medium hover:bg-[#1a4f96] transition-colors"
        >
          Send Reset Link
        </button>
      </form>

      <div className="text-center mt-6">
        <span className="text-gray-600">Remember your password? </span>
        <Link href="/lender/auth/signin" className="text-[#1e5ba8] font-medium hover:underline">
          Sign In
        </Link>
      </div>
    </AuthLayout>
  )
}
