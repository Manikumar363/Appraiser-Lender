'use client';

import { useState } from 'react';
import DashboardLayout from "../../../../components/dashboard-layout";
import { LockIcon } from "../../../../components/icons"

export default function ResetPasswordForm() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  return (
    <DashboardLayout>
    <div className="space-y-6 px-4 py-6">
      <div>
        <label className="block text-lg font-semibold text-gray-800 mb-2">
           Old Password
        </label>
        <div className="flex items-center bg-white rounded-full px-6 py-4 shadow-sm border border-gray-300">
          <LockIcon className="mr-4"/>
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
        <div className="flex items-center bg-white rounded-full px-6 py-4 shadow-sm border border-gray-300">
          <LockIcon className='mr-4'/>
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
        <div className="flex items-center bg-white rounded-full px-6 py-4 shadow-sm border border-gray-300">
          <LockIcon className='mr-4'/>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="flex-1 outline-none text-gray-800 placeholder-gray-400 bg-transparent"
            placeholder="Type your password here"
          />
        </div>
      </div>
    </div>
    </DashboardLayout>
  );
}
