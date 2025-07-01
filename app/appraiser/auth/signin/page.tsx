"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import AuthLayout from "../../../../components/auth-layout"
import { RoleSelector } from "../../../../components/role-selector"
import { AuthInput } from "../../../../components/auth-input"
import { useRouter } from "next/navigation"
import axios from "@/lib/api/axios"

export default function AppraiserSignInPage() {
  const [selectedRole, setSelectedRole] = useState<"appraiser" | "lender">("appraiser")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await axios.post(
        "/appraiser/login",
        { email, password },
        { withCredentials: true } // ✅ if your backend sets httpOnly cookies
      )

      console.log("Login successful", res.data)

      if (res.data?.token) {
        localStorage.setItem("appraiserToken", res.data.token)
        router.push("/appraiser/dashboard")
      } else {
        setError("Login failed, please try again.")
      }

    } catch (err: any) {
      console.error(err)
      setError(err.response?.data?.message || "Invalid credentials")
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = (role: "appraiser" | "lender") => {
    setSelectedRole(role)
    if (role === "lender") {
      router.push("/lender/auth/signin")
    }
  }

  return (
    <AuthLayout>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-medium text-gray-800 mb-2">Sign In as</h1>
      </div>

      <RoleSelector selectedRole={selectedRole} onRoleChange={handleRoleChange} />

      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back Appraisers</h2>
        <p className="text-gray-500 text-base">Log in to manage your jobs and updates.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
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

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <div className="text-right mb-6">
          <Link
            href="/appraiser/auth/forgot-password"
            className="text-gray-600 hover:text-[#1e5ba8] transition-colors text-base"
          >
            Forgot Password?
          </Link>
        </div>

        <button
          type="submit"
          className="w-full bg-[#1e5ba8] text-white py-4 rounded-full font-medium hover:bg-[#1a4f96] transition-colors text-lg shadow-sm disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Signing In..." : "Sign In"}
        </button>
      </form>

      <div className="text-center mt-8">
        <span className="text-gray-600">{"Don't Have An Account ? "}</span>
        <Link href="/appraiser/auth/signup" className="text-[#1e5ba8] font-medium hover:underline">
          Create One
        </Link>
      </div>
    </AuthLayout>
  )
}
