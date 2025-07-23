"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthLayout from "@/components/auth-layout";
import { AuthInput } from "@/components/auth-input";
import { authApi } from "@/lib/api/auth";
import { toast } from "react-hot-toast";

export default function AppraiserForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState(""); // for user-friendly error display

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(""); // reset error

    const trimmedEmail = email.trim();

    // Basic validation
    if (!trimmedEmail) {
      setFormError("Please enter your email address.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setFormError("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      await authApi.forgotPassword(trimmedEmail);
      toast.success("Reset code sent to your email!");

      router.push(
        `/appraiser/auth/verify-email?email=${encodeURIComponent(trimmedEmail)}&type=reset`
      );
    } catch (err: any) {
      const backendMessage =
        err?.response?.data?.message || "Failed to send reset code.";
      setFormError(backendMessage); // visible under input
      toast.error(backendMessage); // optional toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="flex items-center justify-center min-h-screen px-6">
        <div className="w-full max-w-[713px]">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-5">
              Forgot Password
            </h1>
            <p className="text-gray-800 text-base">
              Don't worry! It happens. Please enter the email address linked
              with your account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <AuthInput
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={setEmail}
                icon="email"
                autoComplete="email"
              />
              {formError && (
                <p className="mt-2 text-sm text-red-600">{formError}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !email.trim()}
              className={`w-full py-4 rounded-full font-medium transition-colors ${
                loading || !email.trim()
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-[#1e5ba8] text-white hover:bg-[#1a4f96]"
              }`}
            >
              {loading ? "Sending..." : "Send Reset Code"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/appraiser/auth/signin"
              className="text-[#1e5ba8] hover:underline text-sm font-medium"
            >
              ← Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
