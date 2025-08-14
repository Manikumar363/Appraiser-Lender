'use client';

import { useState, useRef, useEffect } from 'react';
import DashboardLayout from "../../../../components/dashboard-layout";
import { LockIcon } from "../../../../components/icons"
import { userAuth } from '../../../../lib/api/userAuth';
import { useRouter } from 'next/navigation';
import { Toaster, toast } from "react-hot-toast"; // CHANGED
import { Eye, EyeOff, Check, X } from "lucide-react"; // ADD

export default function ResetPasswordForm() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // ADD: visibility toggles
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const router = useRouter();
  const redirectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (redirectTimer.current) clearTimeout(redirectTimer.current);
    };
  }, []);

  // Strong password checks (same rules as set-new-password)
  const validations = {
    minLength: newPassword.length >= 8,
    hasUpper: /[A-Z]/.test(newPassword),
    hasLower: /[a-z]/.test(newPassword),
    hasNumber: /\d/.test(newPassword),
    hasSpecial: /[^\da-zA-Z]/.test(newPassword),
  };
  const isPasswordStrong = Object.values(validations).every(Boolean);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!oldPassword || !newPassword || !confirmPassword) {
      const msg = "Please fill all the fields.";
      setError(msg);
      toast.error(msg);
      return;
    }

    // NEW: strong password validation
    if (!isPasswordStrong) {
      const msg = "Password doesn't meet security requirements.";
      setError(msg);
      toast.error(msg);
      return;
    }

    // Validation: new password and confirm password must match
    if (newPassword !== confirmPassword) {
      const msg = 'New password and re-type password do not match!';
      setError(msg);
      toast.error(msg);
      setLoading(false);
      return;
    }

    // Validation: old password and new password should not match
    if (oldPassword === newPassword) {
      const msg = 'Old Password cannot be same as New Password';
      setError(msg);
      toast.error(msg);
      setLoading(false);
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
        setLoading(false);
        // Delay redirect so the user can see the toast
        redirectTimer.current = setTimeout(() => {
          router.push('/lender/settings');
        }, 3000); // 3 seconds
      } else {
        const msg = res.data?.message || 'Something went wrong.';
        setError(msg);
        toast.error(msg);
        setLoading(false);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to update password.';
      setError(msg);
      toast.error(msg);
      setLoading(false);
    }
  };

  return (
    <DashboardLayout role="lender">
      <Toaster position="top-right" />
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
                type={showOld ? "text" : "password"} // CHANGED
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="flex-1 outline-none text-gray-800 placeholder-gray-400 bg-transparent"
                placeholder="Type your password here"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowOld(v => !v)}
                aria-label={showOld ? "Hide password" : "Show password"}
                className="ml-3 text-gray-600 hover:text-gray-800"
              >
                {showOld ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
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
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="flex-1 outline-none text-gray-800 placeholder-gray-400 bg-transparent"
                placeholder="Type your password here"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowNew(v => !v)}
                aria-label={showNew ? "Hide password" : "Show password"}
                className="ml-3 text-gray-600 hover:text-gray-800"
              >
                {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* NEW: Live strength checklist */}
            {newPassword.length > 0 && (
              <ul className="mt-3 space-y-1 text-sm">
                <li className={`flex items-center gap-2 ${validations.minLength ? "text-green-600" : "text-gray-600"}`}>
                  {validations.minLength ? <Check size={14} /> : <X size={14} />} At least 8 characters
                </li>
                <li className={`flex items-center gap-2 ${validations.hasUpper ? "text-green-600" : "text-gray-600"}`}>
                  {validations.hasUpper ? <Check size={14} /> : <X size={14} />} One uppercase letter
                </li>
                <li className={`flex items-center gap-2 ${validations.hasLower ? "text-green-600" : "text-gray-600"}`}>
                  {validations.hasLower ? <Check size={14} /> : <X size={14} />} One lowercase letter
                </li>
                <li className={`flex items-center gap-2 ${validations.hasNumber ? "text-green-600" : "text-gray-600"}`}>
                  {validations.hasNumber ? <Check size={14} /> : <X size={14} />} One number
                </li>
                <li className={`flex items-center gap-2 ${validations.hasSpecial ? "text-green-600" : "text-gray-600"}`}>
                  {validations.hasSpecial ? <Check size={14} /> : <X size={14} />} One special character
                </li>
              </ul>
            )}

            {error === 'Old Password cannot be same as New Password' && (
              <p className="text-red-600 text-sm mt-2">{error}</p>
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
                type={showConfirm ? "text" : "password"} // CHANGED
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="flex-1 outline-none text-gray-800 placeholder-gray-400 bg-transparent"
                placeholder="Retype your new password here"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(v => !v)}
                aria-label={showConfirm ? "Hide password" : "Show password"}
                className="ml-3 text-gray-600 hover:text-gray-800"
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        </div>


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