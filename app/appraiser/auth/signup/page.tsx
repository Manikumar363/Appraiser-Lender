"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthIcons } from "../../components/AuthIcons";

export default function AppraiserSignupPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!acceptTerms) {
      alert("Please accept Terms & Privacy Policy");
      return;
    }

    console.log("Sign up:", { username, email, password, companyName });

    // ➜ Simulate redirect to email verification
    router.push(`/appraiser/auth/verify-email?email=${encodeURIComponent(email)}`);
  };

  return (
    <div className="flex flex-col justify-center max-w-md w-full mx-auto py-10">
      <h2 className="text-xl font-semibold mb-2 text-gray-800">Sign Up as</h2>

      <div className="flex mb-6 border border-gray-300 rounded-full w-max overflow-hidden">
        <button className="px-6 py-2 bg-blue-900 text-white rounded-full">Appraiser</button>
        <button className="px-6 py-2 text-gray-600" onClick={() => router.push("/lender/auth/signup")}>
          Lender
        </button>
      </div>

      <h1 className="text-3xl font-bold mb-6 text-gray-900">Create Your Appraiser Account</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <AuthIcons.User className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Type your username here"
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-full text-sm"
          />
        </div>

        <div className="relative">
          <AuthIcons.Mail className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Type your email here"
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-full text-sm"
          />
        </div>

        <div className="relative">
          <AuthIcons.Lock className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Type your password here"
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-full text-sm"
          />
        </div>

        <div className="relative">
          <AuthIcons.User className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Enter Your Company Name"
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-full text-sm"
          />
        </div>

        <div className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
            className="h-4 w-4"
          />
          <label htmlFor="terms" className="text-black">Terms of Use</label>
          <span className="text-gray-400">|</span>
          <Link href="#" className="text-blue-600 hover:underline">Privacy Policy</Link>
        </div>

        <button type="submit" className="w-full bg-blue-900 text-white py-3 rounded-full font-semibold">
          Sign Up
        </button>
      </form>

      <p className="text-black text-center text-sm mt-6">
        Already Have An Account?{" "}
        <Link href="/appraiser/auth/signin" className="text-blue-700 font-medium">Sign In</Link>
      </p>
    </div>
  );
}
