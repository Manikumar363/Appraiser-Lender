"use client";

import { useState } from "react";
import Link from "next/link";
import axios from "@/lib/api/axios"; 

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post("http://localhost:8000/api/v1/user/resend-otp", {
        email: formData.email,
        password: formData.password,
      });

      console.log("Signin success:", response.data);

      // ✅ TODO: Save token to localStorage or cookie
      // ✅ TODO: Redirect user to dashboard or home

    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Logo Panel */}
      <div>
        <img src="/images/logo.png" alt="Logo" />
      </div>

      {/* Right Side - Login Form */}
      <div className="w-1/2 flex items-center justify-center">
        <div className="w-full max-w-md px-6">
          <h2 className="text-xl font-medium mb-4">Sign In as</h2>
          <div className="flex mb-6">
            <button className="bg-[#01469D] text-white px-6 py-2 rounded-full mr-4">
              Appraiser
            </button>
            <button className="border border-[#01469D] text-[#01469D] px-6 py-2 rounded-full">
              Lender
            </button>
          </div>

          <h1 className="text-3xl font-semibold mb-2">Welcome Back Appraiser</h1>
          <p className="text-sm text-gray-600 mb-6">
            Log in to manage your jobs and updates.
          </p>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <input
                type="email"
                name="email"
                placeholder="Type your email here"
                className="w-full border border-gray-300 px-4 py-3 rounded-full text-sm"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <input
                type="password"
                name="password"
                placeholder="Type your password here"
                className="w-full border border-gray-300 px-4 py-3 rounded-full text-sm"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="text-right">
              <Link href="#" className="text-sm text-[#01469D]">
                Forgot Password?
              </Link>
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            <button
              type="submit"
              className="w-full bg-[#01469D] text-white py-3 rounded-full hover:bg-[#013a80] transition"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm">
            Don’t Have An Account?{" "}
            <Link href="/appraiser/auth/signup" className="font-semibold text-[#01469D]">
              Create One
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
