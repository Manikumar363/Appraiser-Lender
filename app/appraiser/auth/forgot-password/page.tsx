"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthLayout from "@/components/auth-layout";
import { AuthInput } from "@/components/auth-input";
import { authApi } from "@/lib/api/auth";
import toast, { Toaster } from "react-hot-toast";

export default function AppraiserForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(""); // reset error

    const trimmedEmail = email.trim();

    // Basic validation
    if (!trimmedEmail) {
      setFormError("Please enter your email address.");
      toast.error("Please enter your email address.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setFormError("Please enter a valid email address.");
      toast.error("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      await authApi.forgotPassword(trimmedEmail);
      toast.success("Reset code sent to your email!");

      router.push(
        `/appraiser/auth/verify-email?email=${encodeURIComponent(
          trimmedEmail
        )}&type=reset`
      );
    } catch (err: any) {
      const backendMessage =
        err?.response?.data?.message || "Failed to send reset code.";
      setFormError(backendMessage); // visible under input
      toast.error(backendMessage);
    } finally {
      setLoading(false);
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
      <div className="flex items-center justify-center min-h-screen px-4 sm:px-6">
        <div className="w-full">
          <div className="mb-4">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-5">
              Forgot Password
            </h1>
            <p className="text-gray-800 text-sm sm:text-base">
              Don't worry! It happens. Please enter the email address linked
              with your account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AuthInput
              type="email"
              placeholder="Type your email here"
              value={email}
              onChange={setEmail}
              icon="email"
              autoComplete="email"
            />

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-[#2A020D] text-white py-3 sm:py-4 rounded-full font-medium transition-colors ${
                loading ? "opacity-60 cursor-not-allowed" : "hover:bg-[#4e1b29]"
              }`}
            >
              {loading ? "Sending..." : "Send Code"}
            </button>
          </form>
          {formError && (
            <p className="text-red-600 text-sm mt-2">{formError}</p>
          )}

          <div className="mt-6 w-full text-center">
            <Link
              href="/appraiser/auth/signin"
              className="text-[#2A020D] hover:underline text-sm font-medium"
            >
              ← Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
