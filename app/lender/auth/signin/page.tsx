"use client"

import { useState } from "react"
import Link from "next/link"
import AuthLayout from "../../../../components/auth-layout"
import { RoleSelector } from "../../../../components/role-selector"
import { AuthInput } from "../../../../components/auth-input"
import { useRouter } from "next/navigation"
import { userAuth } from "@/lib/api/userAuth"
import toast, { Toaster } from "react-hot-toast";

export default function LenderSignInPage() {
  const [selectedRole, setSelectedRole] = useState<"appraiser" | "lender">("lender")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setFieldErrors({});

    // Validate fields
    const errors: { [key: string]: string } = {};
    if (!email.trim()) errors.email = "Email is required";
    if (!password.trim()) errors.password = "Password is required"; 

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setLoading(false);
      return;
    }

    try {
      const res = await userAuth.signIn(email, password);
      localStorage.setItem("authToken", res.token);
      toast.success("Login successful", {
        duration: 5000,
        style: {
          minWidth: "350px",
          maxWidth: "500px",
          fontSize: "1.1rem",
          padding: "18px 24px",
          textAlign: "center",
          fontWeight: "medium",
        },
      });
      setTimeout(() => {
        router.push("/lender/dashboard");
      }, 1200);
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid credentials");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (role: "appraiser" | "lender") => {
    setSelectedRole(role)
    if (role === "appraiser") {
      router.push("/appraiser/auth/signin")
    }
  }

  return (
    <AuthLayout>
      <Toaster position="top-center" /> {/* if needed add py-24 than adding min-h-screen*/}
      <div className="flex flex-col justify-center min-h-screen w-full items-center">
        <div className="w-full max-w-[765px]  px-6">
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
              Welcome Back Lenders
            </h2>
            <p className="text-gray-500 text-sm">Log in to manage your jobs and updates.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <AuthInput type="email" placeholder="Type your email here" value={email} onChange={setEmail} icon="email" />
            {fieldErrors.email && (
              <p className="text-red-600 text-sm">{fieldErrors.email}</p>
            )}

            <AuthInput
              type="password"
              placeholder="Type your password here"
              value={password}
              onChange={setPassword}
              icon="password"
            />
            {fieldErrors.password && (
              <p className="text-red-600 text-sm">{fieldErrors.password}</p>
            )}

            {error && <p className="text-red-600 text-sm">{error}</p>}

            {/* Align Forgot Password to end of input fields */}
            <div className=" w-[765px] mx-auto flex justify-end -mt-2">
              <Link
                href="/lender/auth/forgot-password"
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

          {/* Center Create One below the button */}
          <div className="w-[765px] mx-auto flex justify-center mt-8 text-medium">
            <span className="text-gray-600">{"Don't Have An Account ? "}</span>
            <Link href="/lender/auth/signup" className="text-[#333333] font-semibold ml-1">
              Create One
            </Link>
          </div>
        </div>
      </div>
    </AuthLayout>
  )
}