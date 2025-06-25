"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function LenderHomePage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to lender signin
    router.push("/lender/auth/signin")
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1e5ba8] mx-auto mb-4"></div>
        <p className="text-gray-600">Loading lender portal...</p>
      </div>
    </div>
  )
}
