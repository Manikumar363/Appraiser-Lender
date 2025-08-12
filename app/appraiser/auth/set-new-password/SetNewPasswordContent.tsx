"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthLayout from "@/components/auth-layout";
import { authApi } from "@/lib/api/auth";
import { LockIcon } from "@/components/icons";
import { toast } from "react-hot-toast";

export function SetNewPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [touched, setTouched] = useState({ password: false, confirm: false });

  // Password strength validation
  const validations = {
    minLength: newPassword.length >= 8,
    hasUpper: /[A-Z]/.test(newPassword),
    hasLower: /[a-z]/.test(newPassword),
    hasNumber: /\d/.test(newPassword),
    hasSpecial: /[^\da-zA-Z]/.test(newPassword),
  };

  const isPasswordStrong = Object.values(validations).every(Boolean);
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;
  const isFormValid = isPasswordStrong && passwordsMatch && userId;

  // Check if user navigated here without userId
  useEffect(() => {
    if (!userId) {
      setError("Session expired. Please restart the password reset process.");
      toast.error("Invalid access. Please restart the password reset process.");
      setTimeout(() => {
        router.push("/appraiser/auth/forgot-password");
      }, 2000);
    }
  }, [userId, router]);

  // Clear error when user starts typing
  useEffect(() => {
    if (error && (newPassword || confirmPassword)) {
      setError("");
    }
  }, [newPassword, confirmPassword, error]);

  const handlePasswordChange = (value: string) => {
    setNewPassword(value);
    if (!touched.password) setTouched(prev => ({ ...prev, password: true }));
  };

  const handleConfirmChange = (value: string) => {
    setConfirmPassword(value);
    if (!touched.confirm) setTouched(prev => ({ ...prev, confirm: true }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Mark all fields as touched for validation display
    setTouched({ password: true, confirm: true });

    // Enhanced validation with specific error messages
    if (!newPassword || !confirmPassword) {
      const errorMsg = "Please fill in all password fields.";
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    if (!isPasswordStrong) {
      const errorMsg = "Password doesn't meet security requirements.";
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    if (!passwordsMatch) {
      const errorMsg = "Passwords do not match.";
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    if (!userId) {
      const errorMsg = "Session expired. Please restart the process.";
      setError(errorMsg);
      toast.error(errorMsg);
      setTimeout(() => router.push("/appraiser/auth/forgot-password"), 2000);
      return;
    }

    setLoading(true);
    try {
      await authApi.setNewPassword(userId, newPassword, confirmPassword);
      
      // Success feedback
      toast.success("Password updated successfully!");
      
      // Additional success message
      setTimeout(() => {
        toast.success("Redirecting to sign in...");
      }, 800);

      // Redirect after success
      setTimeout(() => {
        router.push("/appraiser/auth/signin");
      }, 2000);
      
    } catch (err: any) {
      console.error("Set password error:", err);
      
      // Handle different error scenarios
      const errorMessage = err?.response?.data?.message;
      let displayError = "";
      
      if (errorMessage?.includes("weak") || errorMessage?.includes("password")) {
        displayError = "Password is too weak. Please choose a stronger password.";
      } else if (errorMessage?.includes("user") || errorMessage?.includes("found")) {
        displayError = "Session expired. Please restart the password reset process.";
        setTimeout(() => router.push("/appraiser/auth/forgot-password"), 2000);
      } else if (errorMessage?.includes("match")) {
        displayError = "Password confirmation doesn't match.";
      } else {
        displayError = errorMessage || "Failed to update password. Please try again.";
      }
      
      setError(displayError);
      toast.error(displayError);
    } finally {
      setLoading(false);
    }
  };

  // Validation indicator component
  const ValidationItem = ({ isValid, text }: { isValid: boolean; text: string }) => (
    <div className={`flex items-center space-x-2 text-sm ${isValid ? 'text-green-600' : 'text-gray-500'}`}>
      <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${
        isValid ? 'bg-green-100 text-green-600' : 'bg-gray-100'
      }`}>
        {isValid ? '✓' : '○'}
      </span>
      <span>{text}</span>
    </div>
  );

  return (
    <AuthLayout>
      <div className="flex items-center justify-center min-h-screen px-6">
        <div className="w-full max-w-[765px]">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-5">Set New Password</h1>
            <p className="text-gray-800 text-base mb-6">
              Create a strong password to secure your account and manage your jobs and updates.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* New Password Field */}
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 z-10">
                <LockIcon />
              </span>
              <input
                type={showNewPassword ? "text" : "password"}
                placeholder="Type your new password here"
                value={newPassword}
                onChange={(e) => handlePasswordChange(e.target.value)}
                className="w-full border border-gray-300 rounded-full px-16 py-4 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 pr-20"
                autoComplete="new-password"
              />
              <button
                type="button"
                className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 text-sm font-medium"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? "Hide" : "Show"}
              </button>
            </div>

            {/* Password Requirements */}
            {touched.password && newPassword.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <p className="text-sm font-medium text-gray-700 mb-3">Password Requirements:</p>
                <ValidationItem isValid={validations.minLength} text="At least 8 characters" />
                <ValidationItem isValid={validations.hasUpper} text="One uppercase letter" />
                <ValidationItem isValid={validations.hasLower} text="One lowercase letter" />
                <ValidationItem isValid={validations.hasNumber} text="One number" />
                <ValidationItem isValid={validations.hasSpecial} text="One special character" />
              </div>
            )}

            {/* Confirm Password Field */}
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 z-10">
                <LockIcon />
              </span>
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Retype your password here"
                value={confirmPassword}
                onChange={(e) => handleConfirmChange(e.target.value)}
                className="w-full border border-gray-300 rounded-full px-16 py-4 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 pr-20"
                autoComplete="new-password"
              />
              <button
                type="button"
                className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 text-sm font-medium"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>

            {/* Password Match Indicator */}
            {touched.confirm && confirmPassword.length > 0 && (
              <div className={`text-sm flex items-center space-x-2 ${passwordsMatch ? 'text-green-600' : 'text-red-500'}`}>
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${
                  passwordsMatch ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'
                }`}>
                  {passwordsMatch ? '✓' : '✗'}
                </span>
                <span>{passwordsMatch ? 'Passwords match' : 'Passwords do not match'}</span>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!isFormValid || loading}
              className={`w-full bg-[#2A020D] text-white py-4 rounded-full font-medium transition-all duration-200 ${
                isFormValid && !loading
                  ? "hover:bg-[#1a4f96] transform hover:scale-[1.02]"
                  : "opacity-50 cursor-not-allowed"
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Updating Password...
                </span>
              ) : (
                "Confirm"
              )}
            </button>
          </form>

          {/* Help Text */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Remember your password? {" "}
              <button
                onClick={() => router.push("/appraiser/auth/signin")}
                className="text-[#2A020D] hover:underline font-medium"
              >
                Sign In
              </button>
            </p>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
