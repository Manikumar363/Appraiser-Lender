"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import AuthLayout from "@/components/auth-layout";
import { RoleSelector } from "@/components/role-selector";
import { AuthInput } from "@/components/auth-input";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api/auth";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

export default function AppraiserSignUpPage() {
  const [selectedRole, setSelectedRole] = useState<"appraiser" | "lender">("appraiser");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullPhone, setFullPhone] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Field refs for focus after error (optional)
  const usernameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // --- Field-level validation ---
    if (!username.trim()) {
      setError("Please enter your username.");
      if (usernameRef.current) usernameRef.current.focus();
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      if (emailRef.current) emailRef.current.focus();
      return;
    }
    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters.");
      if (passwordRef.current) passwordRef.current.focus();
      return;
    }
    if (!fullPhone || fullPhone.replace(/\D/g, "").length < 10) {
      setError("Please enter a valid phone number.");
      return;
    }
    if (!acceptTerms) {
      setError("Please accept the Terms of Use and Privacy Policy.");
      return;
    }

    // --- Phone parsing ---
    let countryCode = "";
    let phoneNumber = "";
    if (fullPhone.startsWith("+")) {
      const match = fullPhone.match(/^\+\d+/);
      if (match) {
        countryCode = match[0];
        phoneNumber = fullPhone.slice(countryCode.length).replace(/\D/g, "");
      } else {
        countryCode = "+1";
        phoneNumber = fullPhone;
      }
    } else {
      countryCode = "+1";
      phoneNumber = fullPhone;
    }

    try {
      setLoading(true);
      await authApi.signUp(username.trim(), email.trim(), password, phoneNumber, countryCode);
      router.push(`/appraiser/auth/verify-email?email=${encodeURIComponent(email.trim())}`);
    } catch (err: any) {
      setError(err.response?.data?.message || "Sign up failed. Try again.");
    } finally {
      setLoading(false);
    }
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
        Create Your {selectedRole === "lender" ? "Lender" : "Appraiser"} Account
      </h2>

      <div className="w-full max-w-[713px] mx-auto">
        <form onSubmit={handleSubmit} className="space-y-5" autoComplete="on">
          <AuthInput
            ref={usernameRef}
            type="text"
            placeholder="Type your username here"
            value={username}
            onChange={setUsername}
            icon="user"
            name="username"
            autoComplete="username"
            autoFocus
          />

          <AuthInput
            ref={emailRef}
            type="email"
            placeholder="Type your email here"
            value={email}
            onChange={setEmail}
            icon="email"
            name="email"
            autoComplete="email"
          />

          <AuthInput
            ref={passwordRef}
            type="password"
            placeholder="Type your password here"
            value={password}
            onChange={setPassword}
            icon="password"
            name="password"
            autoComplete="new-password"
          />

          {/* Phone Input - styled to match AuthInput */}
          <div className="relative mb-6">
            <label htmlFor="phone" className="block text-gray-900 mb-2 text-sm font-medium">
              Phone Number
            </label>
            <PhoneInput
              country={"us"}
              value={fullPhone}
              onChange={setFullPhone}
              placeholder="Type your phone number here"
              inputProps={{ id: "phone", name: "phone", autoComplete: "tel" }}
              inputClass="!w-full !h-[52px] !text-base !pl-[58px] !pr-4 !rounded-full !border !border-black focus:!border-[#1e5ba8] focus:!shadow-md transition-all"
              containerClass="!w-full"
              buttonClass="!border-r !border-black !rounded-l-full"
              enableSearch
            />
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          {/* Terms checkbox */}
          <div className="flex justify-center">
            <div className="flex items-start gap-3 mb-5 max-w-[600px]">
              <div className="pt-1">
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
              <label
                htmlFor="terms"
                className="text-gray-700 text-base cursor-pointer flex flex-wrap gap-2 items-center"
              >
                <Link href="/appraiser/terms" className="text-[#1e5ba8] hover:underline font-medium">
                  Terms of Use
                </Link>
                <span>and</span>
                <Link href="/appraiser/privacy" className="text-[#1e5ba8] hover:underline font-medium">
                  Privacy Policy
                </Link>
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#1e5ba8] text-white py-4 rounded-full font-semibold hover:bg-[#1a4f96] transition-colors text-base mb-2 shadow-sm disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Signing Up..." : "Sign Up"}
          </button>
        </form>

        <div className="text-center mt-4">
          <span className="text-gray-700 text-base">Already Have An Account? </span>
          <Link href="/appraiser/auth/signin" className="text-[#1e5ba8] font-medium hover:underline text-base">
            Sign In
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
