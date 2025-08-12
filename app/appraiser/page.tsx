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
    <div className="min-h-screen flex items-center justify-center bg-[#2A020D]">
      <img
        src="/images/logolight.svg"
        alt="EMADI Appraisers "
        className="w-80 h-auto"
      />
    </div>
  )
}
