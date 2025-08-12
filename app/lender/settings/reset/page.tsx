'use client';

import { useState } from 'react';
import DashboardLayout from "../../../../components/dashboard-layout";
import { LockIcon } from "../../../../components/icons"
import { userAuth } from '../../../../lib/api/userAuth';
import { useRouter } from 'next/navigation';
import { toast } from "react-hot-toast";

export default function ResetPasswordForm() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation: new password and confirm password must match
    if (newPassword !== confirmPassword) {
      setError('New password and re-type password do not match!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setLoading(false); // <-- Reset loading state
      return;
    }

    // Validation: old password and new password should not match
    if (oldPassword === newPassword) {
      setError('Old Password cannot be same as New Password');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setLoading(false); // <-- Reset loading state
      return;
    }

    setLoading(true);
    try {
      const res = await userAuth.resetPassword(oldPassword, newPassword);
      if (res.data && res.data.success) {
        setSuccess('Password updated successfully!');
        toast.success("Password updated successfully!");
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setLoading(false); // <-- Reset loading state
        router.push('/lender/settings');
      } else {
        setError(res.data?.message || 'Something went wrong.');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setLoading(false); // <-- Reset loading state
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update password.');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setLoading(false); // <-- Reset loading state
    }
  };

  return (
    <DashboardLayout role="lender">
   <form onSubmit={handleResetPassword} className="flex flex-col min-h-[85vh]">
    <div className="space-y-6 px-4 py-6 flex-grow">
      {/* Old Password */}
      <div>
        <label className="block text-lg font-semibold text-gray-800 mb-2">
          Old Password
        </label>
        <div className="flex items-center rounded-full px-6 py-4 shadow-sm border border-gray-600">
          <LockIcon className="mr-4" />
          <input
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            className="flex-1 outline-none text-gray-800 placeholder-gray-400 bg-transparent"
            placeholder="Type your password here"
          />
        </div>
      </div>

      {/* New Password */}
      <div>
        <label className="block text-lg font-semibold text-gray-800 mb-2">
          New Password
        </label>
        <div className="flex items-center rounded-full px-6 py-4 shadow-sm border border-gray-600">
          <LockIcon className="mr-4" />
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="flex-1 outline-none text-gray-800 placeholder-gray-400 bg-transparent"
            placeholder="Type your password here"
          />
        </div>
        {/* Validation message for old/new password match */}
        {error === 'Old Password cannot be same as New Password' && (
          <p className="text-red-600 text-sm mt-2">
            {error}
          </p>
        )}
      </div>

      {/* Retype Password */}
      <div>
        <label className="block text-lg font-semibold text-gray-800 mb-2">
          Retype Password
        </label>
        <div className="flex items-center rounded-full px-6 py-4 shadow-sm border border-gray-600">
          <LockIcon className="mr-4" />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="flex-1 outline-none text-gray-800 placeholder-gray-400 bg-transparent"
            placeholder="Retype your new password here"
          />
        </div>
      </div>
    </div>

    {/* Error and Success Messages */}
    {success && <p className='text-green-600 px-4'>{success}</p>}

    {/* Button always at bottom */}
    <div className="px-4 pb-6 mt-auto">
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#2A020D] text-white py-4 px-6 rounded-full font-medium hover:bg-[#4e1b29] transition-colors text-lg"
      >
        {loading ? "Updating..." : "Update Password"}
      </button>
    </div>
  </form>
</DashboardLayout>
  );
}