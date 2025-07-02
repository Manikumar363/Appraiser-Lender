"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import LenderDashboardLayout from "../../../../components/dashboard-layout"
import { User, MapPin, DollarSign, Target, Users, ChevronDown } from "lucide-react"

export default function NewJobRequestPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    applicantName: "",
    propertyAddress: "",
    propertyType: "",
    propertyCost: "",
    purposeOfAppraisal: "",
    intendedUse: "",
    requestedBy: "",
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission logic here
    console.log("Form submitted:", formData)
    // Redirect back to jobs page or dashboard
    router.push("/lender/dashboard")
  }

  const purposeOptions = [
    "Purchase",
    "Refinance",
    "Home Equity Line of Credit",
    "Property Tax Assessment",
    "Insurance Claim",
    "Estate Planning",
    "Divorce Settlement",
    "Other",
  ]

  const intendedUseOptions = [
    "Mortgage Lending",
    "Property Tax Assessment",
    "Insurance Coverage",
    "Investment Analysis",
    "Legal Proceedings",
    "Estate Settlement",
    "Other",
  ]

  const requestedByOptions = [
    "Lender",
    "Real Estate Agent",
    "Property Owner",
    "Attorney",
    "Insurance Company",
    "Government Agency",
    "Other",
  ]

  return (
    <LenderDashboardLayout>
      <div className="h-full overflow-hidden">
        <div className="bg-white h-full p-6">
          <form onSubmit={handleSubmit} className="h-full flex flex-col">
            <div className="grid grid-cols-1 gap-4 flex-1">
              {/* Applicant's Name */}
              <div>
                <label className="block text-base font-medium text-gray-900 mb-2">Applicant's Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={formData.applicantName}
                    onChange={(e) => handleInputChange("applicantName", e.target.value)}
                    placeholder="Enter Name"
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#1e5ba8] focus:border-transparent text-sm"
                    required
                  />
                </div>
              </div>

              {/* Property Address */}
              <div>
                <label className="block text-base font-medium text-gray-900 mb-2">Property Address</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={formData.propertyAddress}
                    onChange={(e) => handleInputChange("propertyAddress", e.target.value)}
                    placeholder="Enter Property Address"
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#1e5ba8] focus:border-transparent text-sm"
                    required
                  />
                </div>
              </div>

              {/* Property Type */}
              <div>
                <label className="block text-base font-medium text-gray-900 mb-2">Property Type</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={formData.propertyType}
                    onChange={(e) => handleInputChange("propertyType", e.target.value)}
                    placeholder="Enter Property Type"
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#1e5ba8] focus:border-transparent text-sm"
                    required
                  />
                </div>
              </div>

              {/* Cost Of The Property */}
              <div>
                <label className="block text-base font-medium text-gray-900 mb-2">Cost Of The Property</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={formData.propertyCost}
                    onChange={(e) => handleInputChange("propertyCost", e.target.value)}
                    placeholder="Enter Property Cost"
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#1e5ba8] focus:border-transparent text-sm"
                    required
                  />
                </div>
              </div>

              {/* Purpose Of Appraisal */}
              <div>
                <label className="block text-base font-medium text-gray-900 mb-2">Purpose Of Appraisal</label>
                <div className="relative">
                  <Target className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <select
                    value={formData.purposeOfAppraisal}
                    onChange={(e) => handleInputChange("purposeOfAppraisal", e.target.value)}
                    className="w-full pl-12 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#1e5ba8] focus:border-transparent appearance-none text-sm"
                    required
                  >
                    <option value="">Select Purpose</option>
                    {purposeOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                </div>
              </div>

              {/* Intended Use Of Appraisal */}
              <div>
                <label className="block text-base font-medium text-gray-900 mb-2">Intended Use Of Appraisal</label>
                <div className="relative">
                  <Users className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <select
                    value={formData.intendedUse}
                    onChange={(e) => handleInputChange("intendedUse", e.target.value)}
                    className="w-full pl-12 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#1e5ba8] focus:border-transparent appearance-none text-sm"
                    required
                  >
                    <option value="">Select Purpose</option>
                    {intendedUseOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                </div>
              </div>

              {/* Requested By */}
              <div>
                <label className="block text-base font-medium text-gray-900 mb-2">Requested By</label>
                <div className="relative">
                  <Users className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <select
                    value={formData.requestedBy}
                    onChange={(e) => handleInputChange("requestedBy", e.target.value)}
                    className="w-full pl-12 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#1e5ba8] focus:border-transparent appearance-none text-sm"
                    required
                  >
                    <option value="">Enter Input</option>
                    {requestedByOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-6">
              <button
                type="submit"
                className="w-full bg-[#1e5ba8] text-white py-4 px-6 rounded-full font-medium hover:bg-[#1a4f96] transition-colors text-lg"
              >
                Submit Job
              </button>
            </div>
          </form>
        </div>
      </div>
    </LenderDashboardLayout>
  )
}
