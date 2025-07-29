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
import { set } from "date-fns"
import { toast, Toaster } from "react-hot-toast"


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
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");
  setFieldErrors({});


  // ✅ Validate fields
  const errors: {[key: string]: string} = {};
  if(!username.trim()) errors.username= "Username is required";
  if(!email.trim()) errors.email= "Email is required";
  if(!password.trim()) errors.password= "Password is required";
  if(!phone.trim()) errors.phone= "Phone number is required";
  if (!acceptTerms) {
    toast.error("Please accept the Terms of Use and Privacy Policy", {
      duration: 4000,
      style: {
        minWidth: "250px",
        maxWidth: "500px",
        fontSize: "1rem",
        padding: "18px 24px",
        textAlign: "center",
        fontWeight: "medium", 
      },
    });
    return;
  }

  if(Object.keys(errors).length > 0) {
    setFieldErrors(errors);
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
    toast.success("Signup successful",{
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
      // ✅ Redirect to OTP verification screen
      router.push(`/lender/auth/verify-email?email=${email}`);
    }, 1200); // 1.2 seconds delay

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
      <Toaster position="top-right" />
      
      <div className="mt-10 mb-6 space-y-4">
       <h1 className="text-3xl font-semibold text-gray-800">Sign Up as</h1>
       <RoleSelector selectedRole={selectedRole} onRoleChange={handleRoleChange} />
      </div>
    
      <h2
            className="text-[42px] font-semibold text-gray-800 leading-[100%] mb-1"
              style={{
              fontFamily: "Urbanist",
              fontWeight: 600,
              fontStyle: "normal",
              letterSpacing: "0%",
              }}
            >Create Your Lender Account</h2>

      <div className="w-full max-w-[765px] mx-auto">
    <form onSubmit={handleSubmit} className="space-y-5">
      <AuthInput
        type="text"
        placeholder="Type your username here"
        value={username}
        onChange={setUsername}
        icon="user"
      />
      {fieldErrors.username && (
        <p className="text-red-600 text-sm">{fieldErrors.username}</p>
      )}

      <AuthInput
        type="email"
        placeholder="Type your email here"
        value={email}
        onChange={setEmail}
        icon="email"
      />
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

      {/* Phone Input */}

      <div className="relative">
        <PhoneInput
        country={"us"}
        value={phone}
        onChange={setPhone}
        placeholder="Type your phone number here" // ✅ add this!
        inputClass="!w-[765px] !h-[52px] !text-base !pl-[58px] !pr-4 !rounded-full !border !border-black focus:!border-[#1e5ba8] focus:!shadow-md"
        containerClass="!w-full"
        buttonClass="!border-r !border-black !rounded-l-full"
        enableSearch
        />
        {fieldErrors.phone && (
          <p className="text-red-600 text-sm mt-1">{fieldErrors.phone}</p>
        )}

      </div>
      {error && <p className="text-red-600 text-sm">{error}</p>}    

      {/* Terms Checkbox */}
      <div className=" w-[765px] mx-auto flex items-center justify-center gap-3">
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
        
       
        <label htmlFor="terms" className="text-gray-700 text-base cursor-pointer flex flex-wrap gap-2 items-center justify-center">
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
        className="w-[765px] bg-[#1e5ba8] text-white py-4 rounded-full font-semibold hover:bg-[#1a4f96] transition-colors text-base mb-2 shadow-sm disabled:opacity-50"
        disabled={loading}
      >
        {loading ? "Signing up..." : "Sign Up"}
      </button>
    </form>

    {/* Footer Link */}
    <div className=" w-[765px] mx-auto text-center mt-4"> {/* change w-[765px] mx-auto at buttons and text tags in authentication pages, it will correctly align */}
      <span className="text-gray-700 text-base">Already Have An Account? </span>
      <Link href="/lender/auth/signin" className="text-[#333333] font-medium hover:underline text-base">
        Sign In
      </Link>
    </div>
  </div>
    </AuthLayout>
  )
}
