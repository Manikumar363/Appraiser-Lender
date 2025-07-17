'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { postJob } from "../../../../lib/api/jobs"

export default function NewJobPage() {
  const [title, setTitle] = useState("")
  const [location, setLocation] = useState("")
  const [city, setCity] = useState("")
  const [country, setCountry] = useState("")
  const [date, setDate] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      await postJob({ title, location, city, country, date })
      router.push("/jobs")
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Job creation failed")
    }
  }

  return (
    <DashboardLayout role="lender">
      <div className="p-6 max-w-xl mx-auto">
        <h1 className="text-2xl font-semibold mb-6">New Job Request</h1>
        {error && <div className="mb-4 text-red-500">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" className="w-full px-4 py-3 border rounded" />
          <input value={location} onChange={e => setLocation(e.target.value)} placeholder="Location" className="w-full px-4 py-3 border rounded" />
          <input value={city} onChange={e => setCity(e.target.value)} placeholder="City" className="w-full px-4 py-3 border rounded" />
          <input value={country} onChange={e => setCountry(e.target.value)} placeholder="Country" className="w-full px-4 py-3 border rounded" />
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full px-4 py-3 border rounded" />
          <Button type="submit" className="w-full bg-blue-800 text-white py-3 rounded-lg">Submit</Button>
        </form>
      </div>
    </DashboardLayout>
  )
}
