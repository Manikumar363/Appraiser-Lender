"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import AuthLayout from "../../../../components/auth-layout"
import { RoleSelector } from "../../../../components/role-selector"
import { AuthInput } from "../../../../components/auth-input"
import { useRouter } from "next/navigation"

export default function LenderSignUpPage() {
  const [selectedRole, setSelectedRole] = useState<"appraiser" | "lender">("lender")
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [phone, setPhone] = useState("")
  const [acceptTerms, setAcceptTerms] = useState(false)
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!acceptTerms) {
      alert("Please accept the Terms of Use and Privacy Policy")
      return
    }
    // Handle sign up logic here
    console.log("Lender Sign up:", { selectedRole, username, email, password, phone })

    // After successful registration, redirect to email verification
    router.push(`/lender/auth/verify-email?email=${encodeURIComponent(email)}`)
  }

  const handleRoleChange = (role: "appraiser" | "lender") => {
    setSelectedRole(role)
    // If user selects appraiser, redirect to appraiser auth
    if (role === "appraiser") {
      router.push("/appraiser/auth/signup")
    }
  }

  return (
    <AuthLayout>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">Sign Up as</h1>
      </div>

      <RoleSelector selectedRole={selectedRole} onRoleChange={handleRoleChange} />

      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Create Your Lender Account</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <AuthInput
          type="text"
          placeholder="Type your username here"
          value={username}
          onChange={setUsername}
          icon="user"
        />

        <AuthInput type="email" placeholder="Type your email here" value={email} onChange={setEmail} icon="email" />

        <AuthInput
          type="password"
          placeholder="Type your password here"
          value={password}
          onChange={setPassword}
          icon="password"
        />

        <AuthInput type="tel" placeholder="Enter Your Mobile Number" value={phone} onChange={setPhone} icon="phone" />

        <div className="flex items-center gap-3 mb-8">
          <div className="relative">
            <input
              type="checkbox"
              id="terms"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="sr-only"
            />
            <label
              htmlFor="terms"
              className={`flex items-center justify-center w-7 h-7 rounded border-2 cursor-pointer transition-colors ${
                acceptTerms ? "bg-[#1e5ba8] border-[#1e5ba8]" : "bg-white border-gray-300"
              }`}
            >
              {acceptTerms && (
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </label>
          </div>
          <label htmlFor="terms" className="text-gray-700 text-base cursor-pointer">
            <Link href="/lender/terms" className="text-[#1e5ba8] hover:underline font-medium">
              Terms of Use
            </Link>{" "}
            <Link href="/lender/privacy" className="text-[#1e5ba8] hover:underline font-medium">
              Privacy Policy
            </Link>
          </label>
        </div>

        <button
          type="submit"
          className="w-full bg-[#1e5ba8] text-white py-5 rounded-full font-semibold hover:bg-[#1a4f96] transition-colors text-xl"
        >
          Sign Up
        </button>
      </form>

      <div className="text-center mt-6">
        <span className="text-gray-600">Already Have An Account ? </span>
        <Link href="/lender/auth/signin" className="text-[#1e5ba8] font-medium hover:underline">
          Sign In
        </Link>
      </div>
    </AuthLayout>
  )
}
