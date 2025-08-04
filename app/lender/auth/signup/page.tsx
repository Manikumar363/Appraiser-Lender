"use client"

import type React from "react"

import { useState, useRef } from "react"
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
import { Eye, EyeOff } from "lucide-react"; // Add this import at the top


// Add this helper at the top or in a utils file
function validatePassword(password: string) {
  if (!password) return "Password is required.";
  if (password.length < 8) return "Password must be at least 8 characters.";
  if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter.";
  if (!/[a-z]/.test(password)) return "Password must contain at least one lowercase letter.";
  if (!/[0-9]/.test(password)) return "Password must contain at least one digit.";
  if (!/[^A-Za-z0-9]/.test(password)) return "Password must contain at least one special character.";
  return "";
}

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
  const [showPassword, setShowPassword] = useState(false);
  const passwordRef = useRef<HTMLInputElement>(null);

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");
  setFieldErrors({});

  // Enhanced field validations
  if (!username.trim()) {
    toast.error("Username is required.");
    return;
  }
  if (!email.trim()) {
    toast.error("Email is required.");
    return;
  }

  // Enhanced password validation
  const passwordError = validatePassword(password);
  if (passwordError) {
    toast.error(passwordError);
    return;
  }

  if (!phone || phone.replace(/\D/g, "").length < 10) {
    toast.error("Please enter a valid phone number.");
    return;
  }

  if (!acceptTerms) {
    toast.error("Please accept the Terms of Use and Privacy Policy.");
    return;
  }

  // Parse phone
  let countryCode = "";
  let phoneNumber = "";
  if (phone.startsWith("+")) {
    const match = phone.match(/^\+\d+/);
    if (match) {
      countryCode = match[0];
      phoneNumber = phone.slice(countryCode.length).replace(/\D/g, "");
    } else {
      countryCode = "+1";
      phoneNumber = phone;
    }
  } else {
    countryCode = "+1";
    phoneNumber = phone;
  }

  try {
    setLoading(true);
    const loadingToast = toast.loading("Creating your account...");

    const response = await userAuth.signUp({
      username: username.trim(),
      email: email.trim(),
      password,
      phone: phoneNumber,
      country_code: countryCode,
    });

    toast.success("Account created! Please check your email for verification.", {
      id: loadingToast,
      duration: 5000,
    });

    localStorage.setItem("signupEmail", email.trim());
    setTimeout(() => {
      router.push(`/lender/auth/verify-email?email=${encodeURIComponent(email.trim())}`);
    }, 1500);

  } catch (err: any) {
    toast.error(err.response?.data?.message || "Sign up failed. Try again.");
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

      {/* Password Input */}
      <div className="relative w-[765px]">
        <AuthInput
          ref={passwordRef}
          type={showPassword ? "text" : "password"}
          placeholder="Type your password here"
          value={password}
          onChange={setPassword}
          icon="password"
          name="password"
          autoComplete="new-password"
        />
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute top-1/2 right-6 -translate-y-1/2 text-gray-500 hover:text-gray-700 z-10 transition-colors"
          aria-label={showPassword ? "Hide password" : "Show password"}
          tabIndex={-1}
        >
          {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
        </button>
      </div>
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
