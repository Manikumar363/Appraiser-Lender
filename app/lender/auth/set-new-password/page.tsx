"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/auth-layout";
import { userAuth } from "@/lib/api/userAuth" 
import { profileApi } from "../../../../lib/api/profile";
import { LockIcon } from "@/components/icons";
import { AuthInput } from "@/components/auth-input";

export default function AppraiserSetNewPasswordPage() {
  const router = useRouter();

  const [userId, setUserId] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Fetch userId from profile on mount
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const user = await profileApi.getLenderProfile();
        console.log("User ID:", user.user.id);
        setUserId(user.user.id);
      } catch (err) {
        console.error("Failed to load user ID:", err);
        setError("Failed to load your profile. Please log in again.");
        return false;
      }
    };

    fetchUserId();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!newPassword || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!userId) {
      setError("Missing user ID.");
      return;
    }

    try {
      setLoading(true);
      await userAuth.setNewPassword(userId, newPassword, confirmPassword);
      router.push("/lender/auth/signin");
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to reset password.");
      return false;
    } 
  };

  return (
    <AuthLayout>
      <div className="flex items-center justify-center min-h-screen px-6">
        <div className="w-full max-w-[765px]">
          <h1 className="text-4xl font-bold text-gray-900 mb-5">Set New Password</h1>
          <p className="text-gray-800 text-base mb-6">
            Log in to manage your jobs and updates.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"> <LockIcon /> </span>
              
              <AuthInput
                type="password"
                placeholder="Type your password here"
                value={newPassword}
                onChange={setNewPassword}
                icon="password"
              />
            </div>

            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
                <LockIcon />
              </span>
              <AuthInput
                type="password"
                placeholder="Type your password here"
                value={confirmPassword}
                onChange={setConfirmPassword}
                icon="password"
              />
            </div>

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-[765px] bg-[#1e5ba8] text-white py-4 rounded-full font-medium hover:bg-[#1a4f96] transition-colors"
            >
              {loading ? "Submitting..." : "Confirm"}
            </button>
          </form>
        </div>
      </div>
    </AuthLayout>
  );
}