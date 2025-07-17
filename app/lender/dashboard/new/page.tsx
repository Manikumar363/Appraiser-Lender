"use client"

import type React from "react"
import { useState} from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "../../../../components/dashboard-layout"
import { MapPin, ChevronDown, Phone } from "lucide-react"
import { UserIcon, TargettIcon, DollerIcon, SecondaryProfileIcon, CalendarIcon, DateIcon, UploadIcon } from "../../../../components/icons"
import { postJob } from "@/lib/api/jobs1"
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { CountryData } from "react-phone-input-2";


export default function NewJobRequestPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    intended_user: "",
    intended_username: "",
    phone: "",
    country_code: "",
    purpose: "",
    use: "",
    preferred_date: "", 
    address: "",
    property_type: "",
    price: "",
    description: "",
    lender_doc: "", //for file upload (PDF URL)
    property_occupied: "",
    resident_country_code: "",
    resident_phone: "",
    resident_address: "",
    purchase_price: "",
  })
  const [loading, setLoading] = useState(false)
  const [uploadedDocName, setUploadedDocName] = useState("");


  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    console.log("Payload going to API:", formData);
    try {
      // Add any additional static/default fields required by API here
      const payload = {
        ...formData,
       // add input if needed
         // add input if needed
 // add input if needed
        is_rush_req: false, // add input if needed
        resident_country_code: "",
        resident_phone: "",
        resident_address: "",
      }
      await postJob(payload)
      router.push("/lender/dashboard")
    } catch (err) {
      alert("Failed to submit job.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout role="lender">
      <div className="h-full overflow-hidden">
        <div className="bg-transparent h-full p-0">
          <form onSubmit={handleSubmit} className="h-full flex flex-col">
            <div className="grid grid-cols-1 gap-4 flex-1">
              {/* Intended User */}
              <div>
                <div className="relative w-[90%] mx-auto">
                  <label className="block text-base font-medium text-gray-900 mb-2">Intended User</label>
                  <UserIcon className="absolute left-4 top-[55%] -translate-y-[4%] text-gray-700" />
                  <input
                    type="text"
                    value={formData.intended_user}
                    onChange={(e) => handleInputChange("intended_user", e.target.value)}
                    placeholder="Enter Name"
                    className="w-full pl-12 pr-4 py-3 border border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-[#1e5ba8] focus:border-transparent text-sm"
                    required
                  />
                </div>
              </div>
              {/* Applicant's Name */}
              <div>
                <div className="relative w-[90%] mx-auto">
                  <label className="block text-base font-medium text-gray-900 mb-2">Applicant's Name</label>
                  <UserIcon className="absolute left-4 top-[55%] -translate-y-[4%] text-gray-700" />
                  <input
                    type="text"
                    value={formData.intended_username}
                    onChange={(e) => handleInputChange("intended_username", e.target.value)}
                    placeholder="Enter Name"
                    className="w-full pl-12 pr-4 py-3 border border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-[#1e5ba8] focus:border-transparent text-sm"
                    required
                  />
                </div>
              </div>
              {/*phone number */}
              <div>
                <div className="w-[90%] mx-auto mb-4">
                 <label className="block text-base font-medium text-gray-900 mb-2">
                  Intended user Phone Number
                 </label>
                 <PhoneInput
                   country={'us'}
                   value={formData.phone}
                   onChange={(value, data:any) => {
                     console.log("Phone:", value);
                     console.log("Country Code:", data?.dialCode);
                     handleInputChange('phone', value)
                     handleInputChange('country_code', data?.dialCode || '')
                    }}
                    inputStyle={{
                      height: '48px',              // Equivalent to py-3
                      paddingLeft: '3rem',         // pl-12
                      paddingRight: '1rem',        // pr-4
                      border: '1px solid #4B5563', // border-gray-600
                      borderRadius: '9999px',      // rounded-full
                      fontSize: '0.875rem',        // text-sm
                      width: '100%',
                    }}
                    containerStyle={{
                      width: '100%',
                    }}
                    buttonStyle={{
                      border: 'none',
                      backgroundColor: 'transparent',
                    }}
                   inputProps={{
                     name: 'phone',
                     required: true,
                   }}
                 />
               </div>
              </div>
              {/* Purpose */}
              <div>
                <div className="relative w-[90%] mx-auto">
                  <label className="block text-base font-medium text-gray-900 mb-2">Purpose</label>
                  <SecondaryProfileIcon className="absolute left-4 top-[55%] -translate-y-[4%] text-gray-700" />
                  <input
                    type="text"
                    value={formData.purpose}
                    onChange={(e) => handleInputChange("purpose", e.target.value)}
                    placeholder="Enter Purpose"
                    className="w-full pl-12 pr-4 py-3 border border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-[#1e5ba8] focus:border-transparent text-sm"
                    required
                  />
                </div>
              </div>
              
              {/* Intended Use */}
              <div>
                <div className="relative w-[90%] mx-auto">
                  <label className="block text-base font-medium text-gray-900 mb-2">Intended Use</label>
                  <SecondaryProfileIcon className="absolute left-4 top-[55%] -translate-y-[4%] text-gray-700" />
                  <select
                    value={formData.use}
                    onChange={(e) => handleInputChange("use", e.target.value)}
                    className="w-full pl-12 pr-12 py-3 border border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-[#1e5ba8] focus:border-transparent appearance-none text-sm"
                    required
                  >
                    <option value="">Enter Input</option>
                    {intendedUseOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="absolute right-[5%] top-[56%] -translate-y-[4%] text-gray-800"
                    size={20}
                  />
                </div>
              </div>
              
              <div>
                {/*preferred date */ }
                <div className="relative w-[90%] mx-auto">
                  <label className="block text-base font-medium text-gray-900 mb-2">Preferred Date</label>
                  <input
                    type="date"
                    value={formData.preferred_date}
                    onChange={(e) => handleInputChange("preferred_date", e.target.value)}
                    className="hide-date-icon w-full pl-12 pr-4 py-3 border border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-[#1e5ba8] focus:border-transparent text-sm"
                    required
                  />
                  <DateIcon className="absolute left-4 top-[50%] mt-4 -translate-y-1/2 w-5 h-5 text-gray-700 pointer-events-none" />
                </div>
              </div>

              {/* Property Address */}
              <div>
                <div className="relative w-[90%] mx-auto">
                  <label className="block text-base font-medium text-gray-900 mb-2">Property Address</label>
                  <MapPin className="absolute left-4 top-[55%] -translate-y-[4%] text-gray-700" />
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    placeholder="Enter Property Address"
                    className="w-full pl-12 pr-4 py-3 border border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-[#1e5ba8] focus:border-transparent text-sm"
                    required
                  />
                </div>
              </div>
               {/*Property Type */}
              <div>
                <div className="relative w-[90%] mx-auto">
                  <label className="block text-base font-medium text-gray-900 mb-2">Property Type</label>
                  <SecondaryProfileIcon className="absolute left-4 top-[55%] -translate-y-[4%] text-gray-700" />
                  <select
                    value={formData.property_type}
                    onChange={(e) => handleInputChange("property_type", e.target.value)}
                    className="w-full pl-12 pr-12 py-3 border border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-[#1e5ba8] focus:border-transparent appearance-none text-sm"
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
                    className="absolute right-[5%] top-[56%] -translate-y-[4%] text-gray-700"
                    size={20}
                  />
                </div>
              </div>
            </div>

              {/* Cost Of The Property */}
              <div>
                <div className="relative w-[90%] mx-auto">
                  <label className="block text-base font-medium text-gray-900 mb-2">Cost Of The Property</label>
                  <DollerIcon className="absolute left-4 top-[55%] -translate-y-[4%] text-gray-700" />
                  <input
                    type="text"
                    value={formData.price}
                    onChange={(e) => handleInputChange("price", e.target.value)}
                    placeholder="Enter Property Cost"
                    className="w-full pl-12 pr-4 py-3 border border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-[#1e5ba8] focus:border-transparent text-sm"
                    required
                  />
                </div>
              </div>

              {/* Property Type */}
              <div>
                <div className="relative w-[90%] mx-auto">
                  <label className="block text-base font-medium text-gray-900 mb-2">Description</label>
                  <MapPin className="absolute left-4 top-[55%] -translate-y-[4%] text-gray-700" size={20} />
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Enter Description"
                    className="w-full pl-12 pr-4 py-3 border border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-[#1e5ba8] focus:border-transparent text-sm"
                    required
                  />
                </div>
              </div>
              {/* Property Occupied */}
              <div>
                <div className="relative w-[90%] mx-auto">
                  <label className="block text-base font-medium text-gray-900 mb-2">Property Occupied</label>
                  <SecondaryProfileIcon className="absolute left-4 top-[55%] -translate-y-[4%] text-gray-600" />
                  <select
                    value={formData.property_occupied}
                    onChange={(e) => handleInputChange("property_occupied", e.target.value)}
                    className="w-full pl-12 pr-12 py-3 border border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-[#1e5ba8] focus:border-transparent appearance-none text-sm"
                    required
                  >
                    <option value="">Enter Input</option>
                    {purposeOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="absolute right-[5%] top-[56%] -translate-y-[4%] text-gray-700"
                    size={20}
                  />
                </div>
              </div>
              <div className="w-[90%] mx-auto">
                <label className="block text-base font-medium text-gray-900 mb-2">
                  Upload Document
                </label>
  
                <label
                  htmlFor="pdf-upload"
                  className="flex flex-col items-center justify-center h-40 border border-gray-600 rounded-2xl cursor-pointer  transition-all"
                >
                  <UploadIcon className="w-6 h-6 text-gray-500 mb-2" />
                  <p className="text-sm text-gray-700 text-center">
                    {uploadedDocName
                      ? `Uploaded: ${uploadedDocName}`
                      : <>Upload any additional PDF <br /> related to this job</>
                    }
                  </p>
                  <input
                    id="pdf-upload"
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const fileUrl = URL.createObjectURL(file); // for preview
                        console.log("PDF File:", file.name);
                        setUploadedDocName(file.name); 
                        // You can replace this with actual upload logic and get URL back
                        handleInputChange("lender_doc", fileUrl);
                      }
                    }}
                    className="hidden"
                  />
                </label>              
              </div>
              
            {/* Submit Button */}
            <div className="mt-6 w-[90%] max-w-xxl mx-auto">
              <button
                type="submit"
                className="w-full bg-[#1e5ba8] text-white py-3 px-5 rounded-full font-medium hover:bg-[#1a4f96] transition-colors text-lg"
                disabled={loading}
              >
                {loading ? "Submitting..." : "Submit Job"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  )
}