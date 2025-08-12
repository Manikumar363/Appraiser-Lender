"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import AuthLayout from "../../../../components/auth-layout"
import { AuthInput } from "../../../../components/auth-input"
import { useRouter } from "next/navigation"
import { userAuth } from "@/lib/api/userAuth"
import { Toaster, toast } from "react-hot-toast";

export default function LenderForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const router = useRouter()
  const [loading, setLoading]= useState(false)
  const [error, setError]= useState("")
  const [formError, setFormError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setLoading(true);

    const trimmedEmail = email.trim();

    // Basic validation
    if (!trimmedEmail) {
      setFormError("Please enter your email address.");
      toast.error("Please enter your email address.");
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setFormError("Please enter a valid email address.");
      toast.error("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    try {
      await userAuth.forgotPassword(trimmedEmail);
      toast.success("Reset code sent to your email!");
      router.push(`/lender/auth/verify-email?email=${encodeURIComponent(trimmedEmail)}&type=reset`);
    } catch (err: any) {
      const backendMessage = err?.response?.data?.message || "Failed to send reset code.";
      setFormError(backendMessage);
      toast.error(backendMessage);
    } finally {
      setLoading(false);
    }
  }

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
      <div className="flex items-center justify-center py-52 px-6">
    <div className="w-full max-w-[765px]">
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
         className={`w-[765px] bg-[#2A020D] text-white py-4 rounded-full font-medium transition-colors ${
           loading ? "opacity-60 cursor-not-allowed" : "hover:bg-[#4e1b29]"
         }`}
        >
          {loading ? "Sending..." : "Send Code"}
        </button>
      </form>
      {formError && <p className="text-red-600 text-sm mt-2">{formError}</p>}
    </div>
  </div>
    </AuthLayout>
  )
}
