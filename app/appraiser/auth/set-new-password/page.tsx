// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import AuthLayout from "@/components/auth-layout";
// import { authApi } from "@/lib/api/auth";
// import { profileApi } from "@/lib/api/profile";

// export default function AppraiserSetNewPasswordPage() {
//   const router = useRouter();

//   const [userId, setUserId] = useState("");
//   const [newPassword, setNewPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);

//   // ✅ Fetch userId from profile on mount
//   useEffect(() => {
//     const fetchUserId = async () => {
//       try {
//         const user = await profileApi.getProfile();
//         console.log("User ID:", user.user.id);
//         setUserId(user.user.id);
//       } catch (err) {
//         console.error("Failed to load user ID:", err);
//         setError("Failed to load your profile. Please log in again.");
//         return false;
//       }
//     };

//     fetchUserId();
//   }, []);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError("");

//     if (!newPassword || !confirmPassword) {
//       setError("Please fill in all fields.");
//       return;
//     }

//     if (newPassword !== confirmPassword) {
//       setError("Passwords do not match.");
//       return;
//     }

//     if (!userId) {
//       setError("Missing user ID.");
//       return;
//     }

//     try {
//       setLoading(true);
//       await authApi.setNewPassword(userId, newPassword, confirmPassword);
//       router.push("/appraiser/auth/signin");
//     } catch (err: any) {
//       console.error(err);
//       setError(err.response?.data?.message || "Failed to reset password.");
//       return false;
//     } 
//   };

//   return (
//     <AuthLayout>
//       <div className="flex items-center justify-center min-h-screen px-6">
//         <div className="w-full max-w-[713px]">
//           <h1 className="text-4xl font-bold text-gray-900 mb-5">Set New Password</h1>
//           <p className="text-gray-800 text-base mb-6">
//             Log in to manage your jobs and updates.
//           </p>

//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div className="relative">
//               <input
//                 type="password"
//                 placeholder="Type your password here"
//                 value={newPassword}
//                 onChange={(e) => setNewPassword(e.target.value)}
//                 className="w-full border border-gray-300 rounded-full px-6 py-4 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500"
//               />
//             </div>

//             <div className="relative">
//               <input
//                 type="password"
//                 placeholder="Retype your password here"
//                 value={confirmPassword}
//                 onChange={(e) => setConfirmPassword(e.target.value)}
//                 className="w-full border border-gray-300 rounded-full px-6 py-4 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500"
//               />
//             </div>

//             {error && <p className="text-red-600 text-sm">{error}</p>}

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

import React from 'react'

function page() {
  return (
    <div>page</div>
  )
}

export default page