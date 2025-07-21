// "use client";

// import { useState } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import AuthLayout from "@/components/auth-layout";
// import { authApi } from "@/lib/api/auth";
// import { toast } from "react-hot-toast";

// export default function AppraiserSetNewPasswordPage() {
//   const router = useRouter();
//   const searchParams = useSearchParams();

//   // Get email (or a reset token if available) from URL
//   const email = searchParams.get("email") || "";

//   const [newPassword, setNewPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [showNew, setShowNew] = useState(false);
//   const [showConfirm, setShowConfirm] = useState(false);

//   // Password strength regex (8+, upper, lower, number, special)
//   const strongPw = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$/;

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     // Validate fields
//     if (!newPassword || !confirmPassword) {
//       toast.error("Please fill in all fields.");
//       return;
//     }
//     if (!strongPw.test(newPassword)) {
//       toast.error("Password must be at least 8 characters and include uppercase, lowercase, number, and special character.");
//       return;
//     }
//     if (newPassword !== confirmPassword) {
//       toast.error("Passwords do not match.");
//       return;
//     }
//     if (!email) {
//       toast.error("Missing email. Please restart the flow.");
//       return;
//     }

//     setLoading(true);
//     try {
//       // Adapt API to accept email (not userId), adjust as per backend!
//       await authApi.setNewPassword(email, newPassword, confirmPassword);
//       toast.success("Password reset successfully! Please sign in.");
//       setTimeout(() => {
//         router.push("/appraiser/auth/signin");
//       }, 1200);
//     } catch (err: any) {
//       toast.error(err.response?.data?.message || "Failed to reset password.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <AuthLayout>
//       <div className="flex items-center justify-center min-h-screen px-6">
//         <div className="w-full max-w-[400px]">
//           <h1 className="text-4xl font-bold text-gray-900 mb-5">Set New Password</h1>
//           <p className="text-gray-800 text-base mb-6">
//             Choose a strong new password to protect your account.
//           </p>
//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div className="relative">
//               <input
//                 type={showNew ? "text" : "password"}
//                 placeholder="Type your new password"
//                 autoComplete="new-password"
//                 value={newPassword}
//                 onChange={(e) => setNewPassword(e.target.value)}
//                 className="w-full border border-gray-300 rounded-full px-6 py-4 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500"
//                 minLength={8}
//               />
//               <button
//                 type="button"
//                 tabIndex={-1}
//                 className="absolute inset-y-0 right-4 flex items-center text-gray-500"
//                 onClick={() => setShowNew((v) => !v)}
//                 aria-label={showNew ? "Hide password" : "Show password"}
//               >
//                 {showNew ? "Hide" : "Show"}
//               </button>
//             </div>
//             <div className="relative">
//               <input
//                 type={showConfirm ? "text" : "password"}
//                 placeholder="Retype your new password"
//                 autoComplete="new-password"
//                 value={confirmPassword}
//                 onChange={(e) => setConfirmPassword(e.target.value)}
//                 className="w-full border border-gray-300 rounded-full px-6 py-4 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500"
//                 minLength={8}
//               />
//               <button
//                 type="button"
//                 tabIndex={-1}
//                 className="absolute inset-y-0 right-4 flex items-center text-gray-500"
//                 onClick={() => setShowConfirm((v) => !v)}
//                 aria-label={showConfirm ? "Hide password" : "Show password"}
//               >
//                 {showConfirm ? "Hide" : "Show"}
//               </button>
//             </div>
//             <p className="text-xs text-gray-500">
//               Password must be at least 8 characters, with uppercase, lowercase, number, and symbol.
//             </p>
//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full bg-[#1e5ba8] text-white py-4 rounded-full font-medium hover:bg-[#1a4f96] transition-colors"
//             >
//               {loading ? "Submitting..." : "Confirm"}
//             </button>
//           </form>
//         </div>
//       </div>
//     </AuthLayout>
//   );
// }
