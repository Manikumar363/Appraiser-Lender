"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    setTimeout(() => {
    router.push("/appraiser/auth/signin")
    }, 2000)
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
