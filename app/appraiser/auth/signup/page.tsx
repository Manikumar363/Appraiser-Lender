"use client";

import type React from "react";

import { useState } from "react";
import Link from "next/link";
import AuthLayout from "@/components/auth-layout";
import { RoleSelector } from "@/components/role-selector";
import { AuthInput } from "@/components/auth-input";
import { useRouter } from "next/navigation";

export default function AppraiserSignUpPage() {
  const [selectedRole, setSelectedRole] = useState<"appraiser" | "lender">("appraiser");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [company, setCompany] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptTerms) {
      alert("Please accept the Terms of Use and Privacy Policy");
      return;
    }

    console.log("Appraiser Sign up:", {
      selectedRole,
      username,
      email,
      password,
      company,
    });

    // After successful registration, redirect to email verification
    router.push(`/appraiser/auth/verify-email?email=${encodeURIComponent(email)}`);
  };

  const handleRoleChange = (role: "appraiser" | "lender") => {
    setSelectedRole(role);
    if (role === "lender") {
      router.push("/lender/auth/signup");
    }
  };

  return (
    <AuthLayout>
      <div className="mt-10 mb-6 space-y-4">
        <h1 className="text-3xl font-semibold text-gray-800">Sign Up as</h1>
        <RoleSelector selectedRole={selectedRole} onRoleChange={handleRoleChange} />
      </div>

      <h2 className="text-3xl font-bold text-gray-800 mb-4 w-full max-w-[713px] mx-auto">
        Create Your Appraiser Account
      </h2>

      <div className="w-full max-w-[713px] mx-auto">
        <form onSubmit={handleSubmit} className="space-y-5">
          <AuthInput
            type="text"
            placeholder="Type your username here"
            value={username}
            onChange={setUsername}
            icon="user"
          />

          <AuthInput
            type="email"
            placeholder="Type your email here"
            value={email}
            onChange={setEmail}
            icon="email"
          />

          <AuthInput
            type="password"
            placeholder="Type your password here"
            value={password}
            onChange={setPassword}
            icon="password"
          />

          <AuthInput
            type="tel"
            placeholder="Enter Your Company Name"
            value={company}
            onChange={setCompany}
            icon="company"
          />

          {/* Terms Checkbox */}
          <div className="flex items-start gap-3 mb-5">
            <div className="relative pt-1">
              <input
                type="checkbox"
                id="terms"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="sr-only"
              />
              <label
                htmlFor="terms"
                className={`flex items-center justify-center w-5 h-5 rounded border-2 cursor-pointer transition-colors ${
                  acceptTerms ? "bg-[#1e5ba8] border-[#1e5ba8]" : "bg-white border-gray-300"
                }`}
              >
                {acceptTerms && (
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </label>
            </div>
            <label htmlFor="terms" className="text-gray-700 text-base cursor-pointer leading-relaxed">
              <span className="flex flex-wrap gap-2">
                <Link href="/appraiser/terms" className="text-[#1e5ba8] hover:underline font-medium">
                  Terms of Use
                </Link>
                <span> </span>
                <Link href="/appraiser/privacy" className="text-[#1e5ba8] hover:underline font-medium">
                  Privacy Policy
                </Link>
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-[#1e5ba8] text-white py-4 rounded-full font-semibold hover:bg-[#1a4f96] transition-colors text-base mb-2 shadow-sm"
          >
            Sign Up
          </button>
        </form>

        {/* Footer Link */}
        <div className="text-center mt-4">
          <span className="text-gray-700 text-base">Already Have An Account? </span>
          <Link
            href="/appraiser/auth/signin"
            className="text-[#1e5ba8] font-medium hover:underline text-base"
          >
            Sign In
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
