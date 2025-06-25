"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import AuthLayout from "../../components/auth-layout"
import { RoleSelector } from "../../components/role-selector"
import { AuthInput } from "../../components/auth-input"
import { useRouter } from "next/navigation"

export default function LenderSignInPage() {
  const [selectedRole, setSelectedRole] = useState<"appraiser" | "lender">("lender")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle sign in logic here
    console.log("Lender Sign in:", { selectedRole, email, password })

    // After successful authentication, redirect to lender dashboard
    router.push("/lender/dashboard")
  }

  const handleRoleChange = (role: "appraiser" | "lender") => {
    setSelectedRole(role)
    // If user selects appraiser, redirect to appraiser auth
    if (role === "appraiser") {
      router.push("/appraiser/auth/signin")
    }
  }

  return (
    <AuthLayout>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-medium text-gray-800 mb-2">Sign In as</h1>
      </div>

      <RoleSelector selectedRole={selectedRole} onRoleChange={handleRoleChange} />

      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back Lenders</h2>
        <p className="text-gray-500 text-base">Log in to manage your jobs and updates.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <AuthInput type="email" placeholder="Type your email here" value={email} onChange={setEmail} icon="email" />

        <AuthInput
          type="password"
          placeholder="Type your password here"
          value={password}
          onChange={setPassword}
          icon="password"
        />

        <div className="text-right mb-6">
          <Link
            href="/lender/auth/forgot-password"
            className="text-gray-600 hover:text-[#1e5ba8] transition-colors text-base"
          >
            Forgot Password?
          </Link>
        </div>

        <button
          type="submit"
          className="w-full bg-[#1e5ba8] text-white py-4 rounded-full font-medium hover:bg-[#1a4f96] transition-colors text-lg shadow-sm"
        >
          Sign In
        </button>
      </form>

      <div className="text-center mt-8">
        <span className="text-gray-600">{"Don't Have An Account ? "}</span>
        <Link href="/lender/auth/signup" className="text-[#1e5ba8] font-medium hover:underline">
          Create One
        </Link>
      </div>
    </AuthLayout>
  )
}
