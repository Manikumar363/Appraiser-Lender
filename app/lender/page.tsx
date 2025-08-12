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
    <div className="min-h-screen flex items-center justify-center bg-[#2A020D]">
      <img
        src="/images/logolight.svg"
        alt="EMADI Appraisers"
        className="w-80 h-auto"
      />
    </div>
  )
}