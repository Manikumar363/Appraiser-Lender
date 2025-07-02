"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import LenderDashboardLayout from "../../../../components/dashboard-layout"
import { ProfileIcon, EmailIcon, CompanyIcon, DesignationIcon, CheckmarkIcon } from "../../../../components/icons"
import Image from "next/image"

export default function EditProfilePage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    username: "Type your username here",
    email: "Type your email here",
    company: "Enter Your Company Name",
    designation: "Enter Your Designation",
    phone: "+ 00 0000 0000",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Profile updated:", formData)
    // Here you would typically make an API call to update the profile
    router.push("/lender/profile")
  }

  return (
    <LenderDashboardLayout>
      <div className="h-full overflow-hidden bg-white">
        <div className="p-8 h-full flex flex-col">
          {/* Profile Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-24 h-24 rounded-full overflow-hidden mb-4">
              <Image
                src="/images/profile-avatar.png"
                alt="Profile Avatar"
                width={96}
                height={96}
                className="w-full h-full object-cover"
              />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Joe Done</h1>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-gray-600">abc@gmail.com</span>
              <CheckmarkIcon />
            </div>
            <div className="flex items-center gap-2 mb-6">
              <span className="text-gray-600">000-000-000</span>
              <CheckmarkIcon />
            </div>
          </div>

          {/* Edit Profile Form */}
          <form onSubmit={handleUpdateProfile} className="flex-1 space-y-4 max-w-4xl mx-auto w-full">
            <div className="relative">
              <div className="flex items-center bg-gray-50 rounded-full px-4 py-3 border focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
                <div className="mr-3">
                  <ProfileIcon />
                </div>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Type your username here"
                  className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-500 outline-none"
                />
              </div>
            </div>

            <div className="relative">
              <div className="flex items-center bg-gray-50 rounded-full px-4 py-3 border focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
                <div className="mr-3">
                  <EmailIcon />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Type your email here"
                  className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-500 outline-none"
                />
              </div>
            </div>

            <div className="relative">
              <div className="flex items-center bg-gray-50 rounded-full px-4 py-3 border focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
                <div className="mr-3">
                  <CompanyIcon />
                </div>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  placeholder="Enter Your Company Name"
                  className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-500 outline-none"
                />
              </div>
            </div>

            <div className="relative">
              <div className="flex items-center bg-gray-50 rounded-full px-4 py-3 border focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
                <div className="mr-3">
                  <DesignationIcon />
                </div>
                <input
                  type="text"
                  name="designation"
                  value={formData.designation}
                  onChange={handleInputChange}
                  placeholder="Enter Your Designation"
                  className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-500 outline-none"
                />
              </div>
            </div>

            <div className="relative">
              <div className="flex items-center bg-gray-50 rounded-full px-4 py-3 border focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
                <div className="flex items-center mr-3">
                  <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">🇦🇺</span>
                  <svg className="w-3 h-3 text-gray-400 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+ 00 0000 0000"
                  className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-500 outline-none"
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-full font-medium text-lg transition-colors"
              >
                Update Profile
              </button>
            </div>
          </form>
        </div>
      </div>
    </LenderDashboardLayout>
  )
}
