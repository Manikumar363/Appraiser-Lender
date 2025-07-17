'use client';

import { useState } from 'react';
import DashboardLayout from "../../../../components/dashboard-layout";
import { LockIcon } from "../../../../components/icons"
import { userAuth } from '../../../../lib/api/userAuth';
import { useRouter } from 'next/navigation';

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

    if(newPassword !== confirmPassword) { 
      setError('New password and re-type password do not match!');
      return;
    }

    setLoading(true);
    try{
      const res = await userAuth.resetPassword(oldPassword, newPassword);
      if(res.data && res.data.success) {
        setSuccess('Password updated successfully!');
        alert("Password updated successfully!");
        router.push('/lender/settings');
      }else{
        setError(res.data?.message || 'Something went wrong.');

      }
    }catch (err: any){
      console.error("Error updating password:", err);
      setError(err.response?.data?.message || 'Failed to update password.');
    }finally{
      setLoading
    }
  };

  return (
    <DashboardLayout role="lender">
   <form  onSubmit={handleResetPassword} className=" flex flex-col h-full">
    {/* Form content */}
    <div  className="space-y-6 px-4 py-6 flex-grow">
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
    {error && <p className='text-red-600'>{error}</p>}
    {success && <p className='text-green-600'>{success}</p>}

    {/* Button at bottom */}
    <div className="px-4 pb-6">
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#1e5ba8] text-white py-4 px-6 rounded-full font-medium hover:bg-[#1a4f96] transition-colors text-lg"
      >
        {loading ? "Updating...": "Update Password"}
      </button>
    </div>
  </form>
</DashboardLayout>
  );
}