"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect directly to lender signin - users can switch roles there
    router.push("/lender/auth/signin")
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#014F9D]">
      <img
        src="/images/emadi-logo.png"
        alt="EMADI Appraisers "
        className="w-80 h-auto"
      />
    </div>
  )
}
