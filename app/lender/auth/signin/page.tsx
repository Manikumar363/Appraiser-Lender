"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import AuthLayout from "../../../../components/auth-layout"
import { RoleSelector } from "../../../../components/role-selector"
import { AuthInput } from "../../../../components/auth-input"
import { useRouter } from "next/navigation"
import { userAuth } from "@/lib/api/userAuth" //  import your API

export default function LenderSignInPage() {
  const [selectedRole, setSelectedRole] = useState<"appraiser" | "lender">("lender")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try{
      const res= await userAuth.signIn(email,password,);

      console.log("Login successful", res);
      
      localStorage.setItem("authToken", res.token);
      router.push("/lender/dashboard");
    }catch(err: any){
      setError(err.response?.data?.message || "Invalid credentials");
      return false
    }finally{
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
      <div className="flex flex-col justify-center min-h-screen w-full items-center">
      <div className="w-full max-w-[713px] px-6">
      <div className="mb-4 mt-0">
        <h1 className="text-3xl font-semibold text-gray-800">Sign In as</h1>
      </div>
      <div className="mb-6">
        <RoleSelector selectedRole={selectedRole} onRoleChange={handleRoleChange} />
      </div>
      <div className="mb-5">
        <h2 className="text-[32px] font-bold text-gray-800 leading-snug mb-1">Welcome Back Lenders</h2>
        <p className="text-gray-500 text-sm">Log in to manage your jobs and updates.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <AuthInput type="email" placeholder="Type your email here" value={email} onChange={setEmail} icon="email" />

        <AuthInput
          type="password"
          placeholder="Type your password here"
          value={password}
          onChange={setPassword}
          icon="password"
        />

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <div className="text-right -mt-3 mb-5">
          <Link
            href="/lender/auth/forgot-password"
            className="text-[#333333] font-semibold text-sm"
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
        <Link href="/lender/auth/signup" className="text-[#333333] font-semibold ">
          Create One
        </Link>
      </div>
      </div>
      </div>
    </AuthLayout>
  )
}
