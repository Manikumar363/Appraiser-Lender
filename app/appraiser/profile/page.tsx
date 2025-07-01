"use client"

import { useRouter } from "next/navigation"
import LenderDashboardLayout from "../../../components/lender-dashboard-layout"
import { ProfileIcon, EmailIcon, CompanyIcon, DesignationIcon, CheckmarkIcon } from "../../../components/icons"
import Image from "next/image"

export default function LenderProfilePage() {
  const router = useRouter()

  const handleEditProfile = () => {
    router.push("/lender/profile/edit")
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
            <button
              onClick={handleEditProfile}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-full font-medium transition-colors"
            >
              Edit Profile
            </button>
          </div>

          {/* Profile Form Fields (Read-only display) */}
          <div className="flex-1 space-y-4 max-w-4xl mx-auto w-full">
            <div className="relative">
              <div className="flex items-center bg-gray-50 rounded-full px-4 py-3 border">
                <div className="mr-3">
                  <ProfileIcon />
                </div>
                <span className="text-gray-500 text-sm">Type your username here</span>
              </div>
            </div>

            <div className="relative">
              <div className="flex items-center bg-gray-50 rounded-full px-4 py-3 border">
                <div className="mr-3">
                  <EmailIcon />
                </div>
                <span className="text-gray-500 text-sm">Type your email here</span>
              </div>
            </div>

            <div className="relative">
              <div className="flex items-center bg-gray-50 rounded-full px-4 py-3 border">
                <div className="mr-3">
                  <CompanyIcon />
                </div>
                <span className="text-gray-500 text-sm">Enter Your Company Name</span>
              </div>
            </div>

            <div className="relative">
              <div className="flex items-center bg-gray-50 rounded-full px-4 py-3 border">
                <div className="mr-3">
                  <DesignationIcon />
                </div>
                <span className="text-gray-500 text-sm">Enter Your Designation</span>
              </div>
            </div>

            <div className="relative">
              <div className="flex items-center bg-gray-50 rounded-full px-4 py-3 border">
                <div className="flex items-center mr-3">
                  <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">🇦🇺</span>
                </div>
                <span className="text-gray-500 text-sm">+ 00 0000 0000</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </LenderDashboardLayout>
  )
}
