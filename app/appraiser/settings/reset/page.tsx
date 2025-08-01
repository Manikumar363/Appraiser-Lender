"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import DashboardLayout from "../../../../components/dashboard-layout";
import { LockIcon } from "../../../../components/icons";
import { authApi } from "@/lib/api/auth";

export default function ResetPasswordForm() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("New password and retype password do not match!");
      return;
    }

    if (loading) return; // Prevent double submission

    setLoading(true);
    const loadingToast = toast.loading("Updating your password...");

    try {
      const res = await authApi.resetPassword(oldPassword, newPassword);
      
      if (res.data && res.data.success) {
        toast.dismiss(loadingToast);
        toast.success("Password updated successfully!");
        
        // Small delay for better UX
        setTimeout(() => {
          router.push("/appraiser/settings");
        }, 1500);
      } else {
        toast.dismiss(loadingToast);
        const errorMsg = res.data?.message || "Something went wrong.";
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err: any) {
      console.error("❌ Error:", err);
      toast.dismiss(loadingToast);
      
      const errorMessage = err.response?.data?.message || "Failed to update password.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout role="appraiser">
  <form
    onSubmit={handleResetPassword}
    className="flex  flex-col min-h-[90vh] space-y-6 px-4 py-6 mx-auto"
  >
    {/* Fields */}
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
          disabled={loading}
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
          disabled={loading}
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
          disabled={loading}
        />
      </div>
    </div>

    {error && <p className="text-red-600">{error}</p>}

    {/* Spacer pushes the button to the bottom */}
    <div className="flex-grow" />

    {/* Button at the bottom */}
    <div className="mt-auto">
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#014F9D] hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-full font-medium transition-colors"
      >
        {loading ? "Updating..." : "Update Password"}
      </button>
    </div>
  </form>
</DashboardLayout>

  );
}