"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
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

  const emailRef = useRef<HTMLInputElement | null>(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
  }, []); 

  const handleRoleChange = (role: "appraiser" | "lender") => {
    if (role === selectedRole) return;
    setSelectedRole(role);

    if (role === "lender") {
      const toastId = toast.loading("Switching to Lender sign in...");
      setTimeout(() => {
        toast.dismiss(toastId);
        router.replace("/lender/auth/signin");
      }, 1000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail) {
      toast.error("Please enter your email address");
      emailRef.current?.focus();
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      toast.error("Please enter a valid email address");
      emailRef.current?.focus();
      return;
    }

    if (!trimmedPassword) {
      toast.error("Please enter your password");
      passwordRef.current?.focus();
      return;
    }

    setLoading(true);
    const loadingToast = toast.loading("Signing you in...");

    try {
      const res = await authApi.signIn(trimmedEmail, trimmedPassword);
      localStorage.setItem("authToken", res.token);

      toast.success("Welcome back! Redirecting to dashboard...", {
        id: loadingToast,
        duration: 3000,
      });

      setTimeout(() => {
        router.replace("/appraiser/dashboard");
      }, 1000);
    } catch (err: any) {
      const status = err?.response?.status;
      const message = err?.response?.data?.message || err?.message || "Sign in failed";

      if (status === 401 || status === 403) {
        setPassword("");
        setTimeout(() => {
          passwordRef.current?.focus();
        }, 100);
        toast.error("Invalid email or password. Please try again.", {
          id: loadingToast,
          duration: 5000,
        });
      } else if (status === 429) {
        toast.error("Too many attempts. Please wait a moment and try again.", {
          id: loadingToast,
          duration: 5000,
        });
      } else if (status >= 500 && status <= 599) {
        toast.error("Server error. Please try again in a few minutes.", {
          id: loadingToast,
          duration: 5000,
        });
      } else {
        toast.error(message, { 
          id: loadingToast,
          duration: 5000,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 5000,
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

      <div className="flex flex-col justify-center min-h-screen w-full items-center">
        <div className="w-full max-w-[765px] px-6">
          <div className="mb-4 mt-0">
            <h1 className="text-3xl font-semibold text-gray-800">Sign In as</h1>
          </div>

          <div className="mb-6">
            <RoleSelector selectedRole={selectedRole} onRoleChange={handleRoleChange} />
          </div>

          <div className="mb-5">
            <h2
              className="text-[42px] font-semibold text-gray-800 leading-[100%] mb-1"
              style={{
              fontFamily: "Urbanist",
              fontWeight: 600,
              fontStyle: "normal",
              letterSpacing: "0%",
              }}
            >
              Welcome Back Appraisers
            </h2>
            <p className="text-gray-500 text-sm">
              Log in to manage your jobs and updates.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="on">
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

            <div className="relative w-[765px]">
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
                className="absolute top-1/2 right-6 -translate-y-1/2 text-gray-500 hover:text-gray-700 z-10 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
              </button>
            </div>

            <div className="w-[765px] mx-auto flex justify-end mt-2 mb-4">
              <Link
                href="/appraiser/auth/forgot-password"
                className="text-[#333333] font-semibold hover:underline transition-all"
              >
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              className="w-[765px] bg-[#2A020D] text-white py-4 rounded-full font-medium hover:bg-[#2A020D] transition-colors text-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <div className="w-[765px] mx-auto flex justify-center mt-8">
            <span className="text-gray-600">Don't Have An Account? </span>
            <Link
              href="/appraiser/auth/signup"
              className="text-[#333333] font-semibold ml-1 hover:underline transition-all"
            >
              Create One
            </Link>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}