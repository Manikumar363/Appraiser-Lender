"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import AuthLayout from "../../../../components/auth-layout"
import { RoleSelector } from "../../../../components/role-selector"
import { AuthInput } from "../../../../components/auth-input"
import { useRouter } from "next/navigation"
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { userAuth } from "@/lib/api/userAuth";


export default function LenderSignUpPage() {
  const [selectedRole, setSelectedRole] = useState<"appraiser" | "lender">("lender")
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [phone, setPhone] = useState("")
  const [acceptTerms, setAcceptTerms] = useState(false)
  const router = useRouter()
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");

  if (!acceptTerms) {
    alert("Please accept the Terms of Use and Privacy Policy");
    return;
  }

  try {
    setLoading(true);

    let countryCode = "";
    let phoneNumber = "";

    if (phone.startsWith("+")) {
      const match = phone.match(/^\+\d+/);
      if (match) {
        countryCode = match[0];
        phoneNumber = phone.slice(countryCode.length);
      } else {
        countryCode = "+1";
        phoneNumber = phone;
      }
    } else {
      countryCode = "+1";
      phoneNumber = phone;
    }

    // ✅ CORRECTED: use userAuth.signUp instead of userAuth()
    const response = await userAuth.signUp({
      username,
      email,
      password,
      phone: phoneNumber,
      country_code: countryCode,
    });

    console.log("Signup Success:", response);

    // ✅ Store for OTP page
    localStorage.setItem("signupEmail", email);

    // ✅ Redirect to OTP verification screen
    router.push(`/lender/auth/verify-email?email=${email}`);
  } catch (err: any) {
    console.error("Signup error:", err);
    setError(err.response?.data?.message || "Sign up failed. Try again.");
  } finally {
    setLoading(false);
  }
};

  const handleRoleChange = (role: "appraiser" | "lender") => {
    setSelectedRole(role)
    // If user selects appraiser, redirect to appraiser auth
    if (role === "appraiser") {
      router.push("/appraiser/auth/signup")
    }
  }

  return (
    <AuthLayout>
      
      <div className="mt-10 mb-6 space-y-4">
       <h1 className="text-3xl font-semibold text-gray-800">Sign Up as</h1>
       <RoleSelector selectedRole={selectedRole} onRoleChange={handleRoleChange} />
      </div>
    
     <h2 className="text-3xl font-bold text-gray-800 mb-4 w-full max-w-[713px] mx-auto">Create Your Lender Account</h2>

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

      <div className="relative">
        <label className="block text-gray-700 mb-2 text-sm font-medium">Phone Number</label>
        <PhoneInput
        country={"us"}
        value={phone}
        onChange={setPhone}
        placeholder="Type your phone number here" // ✅ add this!
        inputClass="!w-full !h-[52px] !text-base !pl-[58px] !pr-4 !rounded-full !border !border-black focus:!border-[#1e5ba8] focus:!shadow-md transition-all"
        containerClass="!w-full"
        buttonClass="!border-r !border-black !rounded-l-full"
        enableSearch
        />

      </div>
      {error && <p className="text-red-600 text-sm">{error}</p>}

      {/* Terms Checkbox */}
      <div className="flex justify-center">
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
       
        <label htmlFor="terms" className="text-gray-700 text-base cursor-pointer flex flex-wrap gap-2 items-center">
          <span className="flex flex-wrap gap-2">
          <Link href="/lender/terms" className="text-[#333333] hover:underline font-medium">
            Terms of Use
          </Link>
          <span></span>
          
          <Link href="/lender/privacy" className="text-[#333333] hover:underline font-medium">
            Privacy Policy
          </Link>
          </span>
        </label>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full bg-[#1e5ba8] text-white py-4 rounded-full font-semibold hover:bg-[#1a4f96] transition-colors text-base mb-2 shadow-sm disabled:opacity-50"
        disabled={loading}
      >
        {loading ? "Signing up..." : "Sign Up"}
      </button>
    </form>

    {/* Footer Link */}
    <div className="text-center mt-4">
      <span className="text-gray-700 text-base">Already Have An Account? </span>
      <Link href="/lender/auth/signin" className="text-[#1e5ba8] font-medium hover:underline text-base">
        Sign In
      </Link>
    </div>
  </div>
    </AuthLayout>
  )
}
