"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "../../../../components/dashboard-layout";
import { LockIcon } from "../../../../components/icons";
import { authApi } from "@/lib/api/auth";

export default function ResetPasswordForm() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("New password and retype password do not match!");
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.resetPassword(oldPassword, newPassword);
      if (res.data && res.data.success) {
        setSuccess("Password updated successfully!");
        alert("Password updated successfully!");
        router.push("/appraiser/settings");
      } else {
        setError(res.data?.message || "Something went wrong.");
      }
    } catch (err: any) {
      console.error("❌ Error:", err);
      setError(err.response?.data?.message || "Failed to update password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout role="appraiser">
      <form onSubmit={handleResetPassword} className="space-y-6 px-4 py-6 mx-auto">
        <div>
          <label className="block text-lg font-semibold text-gray-800 mb-2">
            Old Password
          </label>
          <div className="flex items-center bg-white rounded-full px-6 py-4 shadow-sm border border-gray-300">
            <LockIcon className="mr-4" />
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="flex-1 outline-none text-gray-800 placeholder-gray-400 bg-transparent"
              placeholder="Type your old password"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-lg font-semibold text-gray-800 mb-2">
            New Password
          </label>
          <div className="flex items-center bg-white rounded-full px-6 py-4 shadow-sm border border-gray-300">
            <LockIcon className="mr-4" />
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="flex-1 outline-none text-gray-800 placeholder-gray-400 bg-transparent"
              placeholder="Type your new password"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-lg font-semibold text-gray-800 mb-2">
            Retype Password
          </label>
          <div className="flex items-center bg-white rounded-full px-6 py-4 shadow-sm border border-gray-300">
            <LockIcon className="mr-4" />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="flex-1 outline-none text-gray-800 placeholder-gray-400 bg-transparent"
              placeholder="Retype your new password"
              required
            />
          </div>
        </div>

        {error && <p className="text-red-600">{error}</p>}
        {success && <p className="text-green-600">{success}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-full font-medium transition-colors"
        >
          {loading ? "Updating..." : "Update Password"}
        </button>
      </form>
    </DashboardLayout>
  );
}
