"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "../../../../components/dashboard-layout"
import api from "../../../../lib/api/axios"
import {
  ProfileIcon,
  EmailIcon,
  CompanyIcon,
  DesignationIcon
} from "../../../../components/icons"
import Image from "next/image"

export default function EditProfilePage() {
  const router = useRouter()

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company_name: "",
    designation: "",
    phone: "",
    image: "",
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // ✅ Fetch profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/user/profile", {
          headers: {
            Authorization: `${localStorage.getItem("authToken")}`,
          },
        })
        const user = res.data.user
        console.log("Profile loaded:", user)

        setFormData({
          name: user.name || "",
          email: user.email || "",
          company_name: user.company_name || "",
          designation: user.designation || "",
          phone: user.phone || "",
          image: user.image || "",
        })
      } catch (err) {
        console.error("Failed to load profile:", err)
      }
    }

    fetchProfile()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")
    try {
      const res = await api.patch(
        "/user/profile",
        {
          name: formData.name,
          email: formData.email,
          company_name: formData.company_name,
          designation: formData.designation,
          phone: formData.phone,
        },
        {
          headers: {
            Authorization: `${localStorage.getItem("authToken")}`,
          },
        }
      )
      console.log("Profile updated:", res.data)
      setSuccess("Profile updated successfully!")
      router.push("/appraiser/profile")
    } catch (err: any) {
      console.error("Failed to update profile:", err)
      setError(err.response?.data?.message || "Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout role="appraiser">
      <div className="h-full overflow-hidden bg-white">
        <div className="p-8 h-full flex flex-col">

          {/* ✅ Profile header with image */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-24 h-24 rounded-full overflow-hidden mb-4">
              {formData.image ? (
                <Image
                  src={formData.image}
                  alt="Profile Avatar"
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200" />
              )}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {formData.name || "Your Name"}
            </h1>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-gray-600">{formData.email || "Your Email"}</span>
            </div>
          </div>

          {/* ✅ Edit Profile Form */}
          <form
            onSubmit={handleUpdateProfile}
            className="flex-1 space-y-4 max-w-4xl mx-auto w-full"
          >
            {/* Name */}
            <div className="relative">
              <div className="flex items-center bg-gray-50 rounded-full px-4 py-3 border focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
                <div className="mr-3"><ProfileIcon /></div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Your Name"
                  className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-500 outline-none"
                />
              </div>
            </div>

            {/* Email */}
            <div className="relative">
              <div className="flex items-center bg-gray-50 rounded-full px-4 py-3 border focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
                <div className="mr-3"><EmailIcon /></div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Your Email"
                  className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-500 outline-none"
                />
              </div>
            </div>

            {/* Company Name */}
            <div className="relative">
              <div className="flex items-center bg-gray-50 rounded-full px-4 py-3 border focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
                <div className="mr-3"><CompanyIcon /></div>
                <input
                  type="text"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleInputChange}
                  placeholder="Company Name"
                  className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-500 outline-none"
                />
              </div>
            </div>

            {/* Designation */}
            <div className="relative">
              <div className="flex items-center bg-gray-50 rounded-full px-4 py-3 border focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
                <div className="mr-3"><DesignationIcon /></div>
                <input
                  type="text"
                  name="designation"
                  value={formData.designation}
                  onChange={handleInputChange}
                  placeholder="Your Designation"
                  className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-500 outline-none"
                />
              </div>
            </div>

            {/* Phone */}
            <div className="relative">
              <div className="flex items-center bg-gray-50 rounded-full px-4 py-3 border focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
                <div className="mr-3">📞</div>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Phone Number"
                  className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-500 outline-none"
                />
              </div>
            </div>

            {/* Status */}
            {error && <p className="text-red-600">{error}</p>}
            {success && <p className="text-green-600">{success}</p>}

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-full font-medium text-lg transition-colors"
              >
                {loading ? "Updating..." : "Update Profile"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  )
}
