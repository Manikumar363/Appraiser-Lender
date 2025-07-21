// "use client"

// import { useState } from "react"
// import { useRouter } from "next/navigation"
// import Link from "next/link"
// import AuthLayout from "../../../../components/auth-layout"
// import { AuthInput } from "../../../../components/auth-input"
// import { authApi } from "../../../../lib/api/auth" 

// export default function LenderForgotPasswordPage() {
//   const [email, setEmail] = useState("")
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState("")
//   const router = useRouter()

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setLoading(true)
//     setError("")

//     try {
//       // ✅ Call your forgot password API
//       await authApi.forgotPassword(email)

//       console.log("✅ Forgot password email sent:", email)

//       // ✅ Redirect to your reusable verify-email page with type=reset
//       router.push(`/appraiser/auth/verify-email?email=${encodeURIComponent(email)}&type=reset`)
//     } catch (err: any) {
//       console.error(err)
//       setError(err.response?.data?.message || "Something went wrong. Please try again.")
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <AuthLayout>
//       <div className="flex items-center justify-center min-h-screen px-6">
//         <div className="w-full max-w-[713px]">
//           <div className="mb-4">
//             <h1 className="text-4xl font-bold text-gray-900 mb-5">Forgot Password</h1>
//             <p className="text-gray-800 text-base">
//               Don&apos;t worry! It occurs. Please enter the email address linked with your account.
//             </p>
//           </div>

//           <form onSubmit={handleSubmit} className="space-y-4">
//             <AuthInput
//               type="email"
//               placeholder="Type your email here"
//               value={email}
//               onChange={setEmail}
//               icon="email"
//             />

//             {error && (
//               <p className="text-sm text-red-600">{error}</p>
//             )}

//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full bg-[#1e5ba8] text-white py-4 rounded-full font-medium hover:bg-[#1a4f96] transition-colors"
//             >
//               {loading ? "Sending..." : "Send Code"}
//             </button>
//           </form>

//           <div className="mt-4 text-center">
//             <Link href="/lender/auth/signin" className="text-[#1e5ba8] hover:underline text-sm">
//               Back to Sign In
//             </Link>
//           </div>
//         </div>
//       </div>
//     </AuthLayout>
//   )
// }
