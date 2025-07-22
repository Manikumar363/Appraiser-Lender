"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import AuthLayout from "@/components/auth-layout";
import { RoleSelector } from "@/components/role-selector";
import { AuthInput } from "@/components/auth-input";
import { authApi } from "@/lib/api/auth";
import { Eye, EyeOff } from "lucide-react";

export default function AppraiserSignInPage() {
  const [selectedRole, setSelectedRole] = useState<"appraiser" | "lender">("appraiser");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

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
    setFieldErrors({});

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const errors: { [key: string]: string } = {};

    if (!trimmedEmail) errors.email = "Email is required";
    if (!trimmedPassword) errors.password = "Password is required";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.signIn(trimmedEmail, trimmedPassword);
      localStorage.setItem("authToken", res.token);
      toast.success("Login successful");
      router.push("/appraiser/dashboard");
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || "Login failed";
      setError(message);
      setPassword("");
      if (passwordRef.current) passwordRef.current.focus();
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="flex flex-col justify-center min-h-screen w-full items-center">
        <div className="w-full max-w-[765px] px-6">
          <div className="mb-4 mt-0">
            <h1 className="text-3xl font-semibold text-gray-800">Sign In as</h1>
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
              type="email"
              placeholder="Type your email here"
              value={email}
              onChange={setEmail}
              icon="email"
              autoFocus
              name="email"
              autoComplete="email"
            />
            {fieldErrors.email && <p className="text-red-600 text-sm">{fieldErrors.email}</p>}

            <div className="relative">
              <AuthInput
                type={showPassword ? "text" : "password"}
                placeholder="Type your password here"
                value={password}
                onChange={setPassword}
                icon="password"
                name="password"
                autoComplete="current-password"
              />
              {/* <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button> */}
            </div>
            {fieldErrors.password && <p className="text-red-600 text-sm">{fieldErrors.password}</p>}

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <div className="w-[765px] mx-auto flex justify-end -mt-2">
              <Link
                href="/appraiser/auth/forgot-password"
                className="text-[#333333] font-semibold text-medium"
              >
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              className="w-[765px] bg-[#1e5ba8] text-white py-4 rounded-full font-medium hover:bg-[#154c8c] transition-colors text-lg shadow-sm disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <div className="w-[765px] mx-auto flex justify-center mt-8 text-medium">
            <span className="text-gray-600">{"Don't Have An Account ? "}</span>
            <Link href="/appraiser/auth/signup" className="text-[#333333] font-semibold ml-1">
              Create One
            </Link>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
