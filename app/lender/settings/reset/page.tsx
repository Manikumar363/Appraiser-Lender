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
      {/* Constrain width so mobile does not auto “zoom out” to fit a too‑wide inner layout */}
      <form
        onSubmit={handleResetPassword}
        className="w-full flex flex-col min-h-[85vh] px-3 sm:px-6"
      >
        <div className="w-full max-w-md mx-auto flex-grow py-6 space-y-6">
          {/* Old Password */}
          <div>
            <label className="block text-base sm:text-lg font-semibold text-gray-800 mb-2">
              Old Password
            </label>
            <div
              className="
                flex items-center rounded-full
                px-4 py-3 sm:px-6 sm:py-4
                shadow-sm border border-gray-400 bg-white
                focus-within:ring-2 focus-within:ring-[#2A020D]/40
              "
            >
              <LockIcon className="mr-3 sm:mr-4 w-5 h-5 sm:w-6 sm:h-6" />
              <input
                type={showOld ? 'text' : 'password'}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="flex-1 min-w-0 outline-none text-sm sm:text-base text-gray-800 placeholder-gray-400 bg-transparent"
                placeholder="Current password"
                autoComplete="current-password"
                inputMode="text"
              />
              <button
                type="button"
                onClick={() => setShowOld(v => !v)}
                aria-label={showOld ? 'Hide password' : 'Show password'}
                className="ml-2 sm:ml-3 text-gray-600 hover:text-gray-800"
              >
                {showOld ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-base sm:text-lg font-semibold text-gray-800 mb-2">
              New Password
            </label>
            <div
              className="
                flex items-center rounded-full
                px-4 py-3 sm:px-6 sm:py-4
                shadow-sm border border-gray-400 bg-white
                focus-within:ring-2 focus-within:ring-[#2A020D]/40
              "
            >
              <LockIcon className="mr-3 sm:mr-4 w-5 h-5 sm:w-6 sm:h-6" />
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="flex-1 min-w-0 outline-none text-sm sm:text-base text-gray-800 placeholder-gray-400 bg-transparent"
                placeholder="New password"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowNew(v => !v)}
                aria-label={showNew ? 'Hide password' : 'Show password'}
                className="ml-2 sm:ml-3 text-gray-600 hover:text-gray-800"
              >
                {showNew ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>

            {newPassword.length > 0 && (
              <ul className="mt-3 space-y-1 text-xs sm:text-sm">
                <li className={`flex items-center gap-1.5 ${validations.minLength ? 'text-green-600' : 'text-gray-600'}`}>
                  {validations.minLength ? <Check size={14} /> : <X size={14} />} 8+ characters
                </li>
                <li className={`flex items-center gap-1.5 ${validations.hasUpper ? 'text-green-600' : 'text-gray-600'}`}>
                  {validations.hasUpper ? <Check size={14} /> : <X size={14} />} Uppercase
                </li>
                <li className={`flex items-center gap-1.5 ${validations.hasLower ? 'text-green-600' : 'text-gray-600'}`}>
                  {validations.hasLower ? <Check size={14} /> : <X size={14} />} Lowercase
                </li>
                <li className={`flex items-center gap-1.5 ${validations.hasNumber ? 'text-green-600' : 'text-gray-600'}`}>
                  {validations.hasNumber ? <Check size={14} /> : <X size={14} />} Number
                </li>
                <li className={`flex items-center gap-1.5 ${validations.hasSpecial ? 'text-green-600' : 'text-gray-600'}`}>
                  {validations.hasSpecial ? <Check size={14} /> : <X size={14} />} Special char
                </li>
              </ul>
            )}

            {error === 'Old Password cannot be same as New Password' && (
              <p className="text-red-600 text-sm mt-2">{error}</p>
            )}
          </div>

          {/* Retype Password */}
          <div>
            <label className="block text-base sm:text-lg font-semibold text-gray-800 mb-2">
              Retype Password
            </label>
            <div
              className="
                flex items-center rounded-full
                px-4 py-3 sm:px-6 sm:py-4
                shadow-sm border border-gray-400 bg-white
                focus-within:ring-2 focus-within:ring-[#2A020D]/40
              "
            >
              <LockIcon className="mr-3 sm:mr-4 w-5 h-5 sm:w-6 sm:h-6" />
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="flex-1 min-w-0 outline-none text-sm sm:text-base text-gray-800 placeholder-gray-400 bg-transparent"
                placeholder="Repeat new password"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(v => !v)}
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
                className="ml-2 sm:ml-3 text-gray-600 hover:text-gray-800"
              >
                {showConfirm ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="w-full max-w-md mx-auto px-1 pb-8">
          <button
            type="submit"
            disabled={loading}
            className="
              w-full bg-[#2A020D] text-white
              py-3 sm:py-4 px-6
              rounded-full font-medium
              text-base sm:text-lg
              hover:bg-[#4e1b29] disabled:opacity-60 transition
            "
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </form>
    </DashboardLayout>
  );
}