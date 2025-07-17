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
    <div className="min-h-screen flex items-center justify-center bg-[#014F9D]">
      <img
        src="/images/emadi-logo.png"
        alt="EMADI Appraisers"
        className="w-80 h-auto"
      />
    </div>
  )
}