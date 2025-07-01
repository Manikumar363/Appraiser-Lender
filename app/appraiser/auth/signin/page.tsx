"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthIcons } from "../../components/AuthIcons";

export default function AppraiserSignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    console.log("Sign in:", { email, password });

    // ➜ Simulate redirect to dashboard
    router.push("/appraiser/dashboard");
  };

  return (
    <div className="flex flex-col justify-center max-w-md w-full mx-auto py-10">
      <h2 className="text-xl font-semibold mb-2 text-gray-800">Sign In as</h2>

      <div className="flex mb-6 border border-gray-300 rounded-full w-max overflow-hidden">
        <button className="px-6 py-2 bg-blue-900 text-white rounded-full">Appraiser</button>
        <button className="px-6 py-2 text-gray-600" onClick={() => router.push("/lender/auth/signin")}>
          Lender
        </button>
      </div>

      <h1 className="text-3xl font-bold mb-6 text-gray-900">Welcome Back Appraiser</h1>
      <p className="text-sm text-gray-600 mb-6">Log in to manage your jobs and updates.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
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

        <div className="text-right">
          <Link href="/appraiser/auth/forgot-password" className="text-sm text-blue-700">
            Forgot Password?
          </Link>
        </div>

        <button type="submit" className="w-full bg-blue-900 text-white py-3 rounded-full font-semibold">
          Sign In
        </button>
      </form>

      <p className="text-black text-center text-sm mt-6">
        Don’t Have An Account?{" "}
        <Link href="/appraiser/auth/signup" className="text-blue-700 font-medium">Create One</Link>
      </p>
    </div>
  );
}
