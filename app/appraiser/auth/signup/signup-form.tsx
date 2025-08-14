"use client";

import React, { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { AuthInput } from "@/components/auth-input";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api/auth";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import toast from 'react-hot-toast';

// Simple debounce hook - FIXED
const useDebounce = (callback: Function, delay: number) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  return useCallback((...args: any[]) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => callback(...args), delay);
  }, [callback, delay]);
};

// Enhanced but reasonable password validation
const validatePassword = (password: string) => {
  if (!password) return "Password is required";
  if (password.length < 8) return "Password must be at least 8 characters";
  if (password.length > 128) return "Password is too long";
  
  // Check for at least one letter and one number (reasonable requirement)
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  
  if (!hasLetter) return "Password must contain at least one letter";
  if (!hasNumber) return "Password must contain at least one number";
  
  return null; // Valid password
};

export default function SignUpForm() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullPhone, setFullPhone] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<string | null>(null);

  const usernameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const router = useRouter();

  // Debounced password validation for real-time feedback
  const debouncedPasswordCheck = useDebounce((pwd: string) => {
    if (pwd) {
      const error = validatePassword(pwd);
      setPasswordStrength(error);
    } else {
      setPasswordStrength(null);
    }
  }, 300);

  // Enhanced password change handler
  const handlePasswordChange = (value: string) => {
    setPassword(value);
    debouncedPasswordCheck(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Enhanced validation with better password checking
    if (!username.trim()) {
      toast.error("Please enter your username.");
      usernameRef.current?.focus();
      return;
    }
    
    if (username.trim().length < 3) {
      toast.error("Username must be at least 3 characters.");
      usernameRef.current?.focus();
      return;
    }
    
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address.");
      emailRef.current?.focus();
      return;
    }
    
    // Use the enhanced password validation
    const passwordError = validatePassword(password);
    if (passwordError) {
      toast.error(passwordError);
      passwordRef.current?.focus();
      return;
    }
    
    if (!fullPhone || fullPhone.replace(/\D/g, "").length < 10) {
      toast.error("Please enter a valid phone number.");
      return;
    }
    
    if (!acceptTerms) {
      toast.error("Please accept the Terms of Use and Privacy Policy.");
      return;
    }

    // Simple phone parsing
    let countryCode = "";
    let phoneNumber = "";
    if (fullPhone.startsWith("+")) {
      const match = fullPhone.match(/^\+\d+/);
      if (match) {
        countryCode = match[0];
        phoneNumber = fullPhone.slice(countryCode.length).replace(/\D/g, "");
      } else {
        countryCode = "+1";
        phoneNumber = fullPhone;
      }
    } else {
      countryCode = "+1";
      phoneNumber = fullPhone;
    }

    try {
      setLoading(true);
      const loadingToast = toast.loading("Creating your account...");
      
      await authApi.signUp(username.trim(), email.trim(), password, phoneNumber, countryCode);
      
      toast.success("Account created! Please check your email for verification.", {
        id: loadingToast,
        duration: 5000
      });
      
      setTimeout(() => {
        router.push(`/appraiser/auth/verify-email?email=${encodeURIComponent(email.trim())}`);
      }, 1500);
      
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Sign up failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[765px] mx-auto">
      <form onSubmit={handleSubmit} className="space-y-5">
        <AuthInput
          ref={usernameRef}
          type="text"
          placeholder="Type your username here"
          value={username}
          onChange={setUsername}
          icon="user"
        />

        <AuthInput
          ref={emailRef}
          type="email"
          placeholder="Type your email here"
          value={email}
          onChange={setEmail}
          icon="email"
        />

        {/* Enhanced password input with validation feedback */}
        <div className="space-y-1">
          <AuthInput
            ref={passwordRef}
            type="password"
            placeholder="Type your password here"
            value={password}
            onChange={handlePasswordChange}
            icon="password"
          />
          {/* Real-time password validation feedback */}
          {password && passwordStrength && (
            <p className="text-red-500 text-sm ml-4">{passwordStrength}</p>
          )}
          {password && !passwordStrength && password.length >= 8 && (
            <p className="text-green-600 text-sm ml-4">✓ Password looks good</p>
          )}
        </div>

        {/* Phone Input - matching lender side exactly */}
        <div className="relative">
          {/* <label className="block text-gray-700 mb-2 text-sm font-medium">
            Phone Number
          </label> */}
          <PhoneInput
            country={"us"}
            value={fullPhone}
            onChange={setFullPhone}
            placeholder="Type your phone number here"
            inputClass="!w-[765px] w-full !h-[52px] !text-base !pl-[58px] !pr-4 !rounded-full !border !border-black focus:!border-[#2A020D] focus:!shadow-md transition-all"
            containerClass="!w-full"
            buttonClass="!border-r !border-black !rounded-l-full"
            enableSearch
          />
        </div>

        {/* Terms checkbox - matching lender side layout */}
        <div className="w-[765px] mx-auto flex items-center justify-center gap-3">
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
                acceptTerms ? "bg-[#2A020D] border-[#2A020D]" : "bg-white border-gray-300"
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
              <Link href="/appraiser/terms" className="text-[#333333] hover:underline font-medium">
                Terms of Use
              </Link>
              <span></span>
              <Link href="/appraiser/privacy" className="text-[#333333] hover:underline font-medium">
                Privacy Policy
              </Link>
            </span>
          </label>
        </div>

        {/* Submit Button - matching lender side width */}
        <button
          type="submit"
          className="w-[765px] bg-[#2A020D] text-white py-4 rounded-full font-semibold hover:bg-[#2A020D] transition-colors text-base mb-2 shadow-sm disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Creating Account..." : "Sign Up"}
        </button>
      </form>

      {/* Footer Link - matching lender side alignment */}
      <div className="w-[765px] mx-auto text-center mt-4">
        <span className="text-gray-700 text-base">Already Have An Account? </span>
        <Link href="/appraiser/auth/signin" className="text-[#333333] font-medium hover:underline text-base">
          Sign In
        </Link>
      </div>
    </div>
  );
}
