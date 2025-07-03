"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import AuthLayout from "../../../../components/auth-layout"
import { AuthInput } from "../../../../components/auth-input"
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
          className="w-full bg-[#1e5ba8] text-white py-4 rounded-full font-medium hover:bg-[#1a4f96] transition-colors"
        >
          Send Code
        </button>
      </form>
    </div>
  </div>
    </AuthLayout>
  )
}
