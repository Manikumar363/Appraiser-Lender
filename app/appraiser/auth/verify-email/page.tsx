"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "your-email@example.com";

  const [otp, setOtp] = useState(["", "", "", ""]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return; // only digits
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < otp.length - 1) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Entered OTP:", otp.join(""));
    // Replace with your verify OTP logic
    router.push("/appraiser/auth/signin");
  };

  return (
    <div className="flex flex-col justify-center max-w-md w-full mx-auto py-10">
      <h1 className="text-2xl font-bold mb-2">Email Verification</h1>
      <p className="text-gray-600 mb-6">
        Enter the verification code we just sent on your email address{" "}
        <span className="text-red-600">{email}</span>.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col items-center space-y-6">
        {/* OTP Inputs */}
        <div className="flex gap-4">
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              className="w-12 h-12 border-2 border-blue-900 rounded-full text-center text-lg focus:outline-none"
            />
          ))}
        </div>

        {/* Timer and Resend */}
        <div className="flex items-center gap-4">
          <span className="px-4 py-1 border rounded-full text-blue-900 border-blue-900">01:00</span>
          <button
            type="button"
            className="px-4 py-1 bg-[#F1523F] text-white rounded-full hover:bg-[#d84332] transition"
          >
            Resend OTP
          </button>
        </div>

        {/* Verify Button */}
        <button
          type="submit"
          className="w-full bg-blue-900 text-white py-4 rounded-full font-semibold hover:bg-blue-800"
        >
          Verify
        </button>
      </form>
    </div>
  );
}
