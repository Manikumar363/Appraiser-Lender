// app/appraiser/auth/signin/page.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import AuthLayout from "@/components/auth-layout";
import { RoleSelector } from "@/components/role-selector";
import { AuthInput } from "@/components/auth-input";
import { authApi } from "@/lib/api/auth";

export default function AppraiserSignInPage() {
  const [selectedRole, setSelectedRole] = useState<"appraiser" | "lender">("appraiser");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Focus refs for improved UX
  const emailRef = useRef<HTMLInputElement | null>(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);

  const router = useRouter();

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    if (token) router.push("/appraiser/dashboard");
  }, [router]);

  const handleRoleChange = (role: "appraiser" | "lender") => {
    setSelectedRole(role);
    if (role === "lender") {
      router.push("/lender/auth/signin");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password.trim()) {
      setError("Email and password are required.");
      toast.error("Email and password are required.");
      // Focus first empty input
      if (!trimmedEmail && emailRef.current) emailRef.current.focus();
      else if (!password && passwordRef.current) passwordRef.current.focus();
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.signIn(trimmedEmail, password);
      localStorage.setItem("authToken", res.token);
      toast.success("Login successful");
      router.push("/appraiser/dashboard");
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || "Login failed";
      setError(message);
      toast.error(message);
      setPassword(""); // Security: clear password field on error
      // Optionally, focus password field if login failed
      if (passwordRef.current) passwordRef.current.focus();
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="flex flex-col justify-center min-h-screen w-full items-center">
        <div className="w-full max-w-[713px] px-6">
          <div className="mb-4 mt-0">
            <h1 className="text-[22px] font-medium text-gray-800">Sign In as</h1>
          </div>

          <div className="mb-6">
            <RoleSelector selectedRole={selectedRole} onRoleChange={handleRoleChange} />
          </div>

          <div className="mb-5">
            <h2 className="text-[32px] font-bold text-gray-800 leading-snug mb-1">
              Welcome Back Appraisers
            </h2>
            <p className="text-gray-500 text-sm">Log in to manage your jobs and updates.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" autoComplete="on">
            <AuthInput
              ref={emailRef}
              type="email"
              placeholder="Type your email here"
              value={email}
              onChange={setEmail}
              icon="email"
              autoFocus
              name="email"
              autoComplete="email"
            />

            <div className="relative">
              <AuthInput
                ref={passwordRef}
                type={showPassword ? "text" : "password"}
                placeholder="Type your password here"
                value={password}
                onChange={setPassword}
                icon="password"
                name="password"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-4 top-3 text-sm text-blue-600 hover:underline"
                tabIndex={-1}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <div className="text-right -mt-3 mb-5">
              <Link
                href="/appraiser/auth/forgot-password"
                className="text-gray-600 hover:text-[#1e5ba8] transition-colors text-sm"
              >
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              className="w-full bg-[#1e5ba8] text-white py-4 rounded-full font-medium hover:bg-[#154c8c] transition-colors text-base shadow-sm disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <div className="text-center mt-8 text-sm">
            <span className="text-gray-600">{"Don't Have An Account ? "}</span>
            <Link href="/appraiser/auth/signup" className="text-[#1e5ba8] font-semibold hover:underline">
              Create One
            </Link>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
