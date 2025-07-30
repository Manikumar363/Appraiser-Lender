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
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { useCallback } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";


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
  const [mapCenter, setMapCenter] = useState({ lat: 43.715, lng: -79.399 }); // Default center
  const [marker, setMarker] = useState<{ lat: number; lng: number } | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (field === "address" && value.trim().length > 5) {
      geocodeAddress(value);
    }
  }

  const Intendeduser = [
    "Self",
    "Other",
  ]

  const purposeOptions = [
    "Testing",
    "Owner",
    "Unknown",
    "Vacant",
  ]

  const intendedUseOptions = [
    "Testing",
    "new 10",
    "new 8",
    "new 7",
    "new 6",
    "new 5",
    "new 4",
    "new 3",
    "new 2",
    "new intended use",
  ]

  const requestedByOptions = [
    "new set type",
    "new 45 trt",
    "new service ty",
    "Property Two Test",
    "Testing New Property 1",
    "new pro",
    "new 2",
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setLoading(true);
    try {
      const payload = {
        ...formData,
        is_rush_req: false,
        resident_country_code: "",
        resident_phone: "",
        resident_address: "",
      };
      await postJob(payload);
      toast.success("Job submitted successfully!", {
        duration: 5000,
        style: {
          background: "#014F9D",
          color: "#fff",
          fontWeight: "bold",
          fontSize: "1.1rem",
          borderRadius: "8px",
          boxShadow: "0 2px 12px rgba(1,79,157,0.15)",
        },
        iconTheme: {
          primary: "#fff",
          secondary: "#014F9D",
        },
      });
      setTimeout(() => {
        router.push("/lender/dashboard");
      }, 1200);
    } catch (err) {
      toast.error("Failed to submit job."); // <-- Toast for error
    } finally {
      setLoading(false);
    }
  }

  // Geocode address to lat/lng
  const geocodeAddress = async (address: string) => {
    if (!address) return;
    try {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json`,
        {
          params: {
            address,
            key: apiKey,
          },
        }
      );
      console.log("Geocode response:", response.data);
      const location = response.data.results[0]?.geometry.location;
      if (location) {
        setMapCenter({ lat: location.lat, lng: location.lng });
        setMarker({ lat: location.lat, lng: location.lng });
      } else {
        toast.error("Please enter a more specific property address.");
        console.error("No location found for address:", address);
      }
    } catch (error) {
      toast.error("Geocoding failed. Please check the address.");
      console.error("Geocoding failed:", error);
    }
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.intended_user.trim()) newErrors.intended_user = "Intended user is required";
    if (!formData.intended_username.trim()) newErrors.intended_username = "Applicant's name is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.purpose.trim()) newErrors.purpose = "Purpose is required";
    if (!formData.use.trim()) newErrors.use = "Intended use is required";
    if (!formData.preferred_date.trim()) newErrors.preferred_date = "Preferred date is required";
    if (!formData.address.trim()) newErrors.address = "Property address is required";
    if (!formData.property_type.trim()) newErrors.property_type = "Property type is required";
    if (!formData.price.trim()) newErrors.price = "Cost of the property is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.property_occupied.trim()) newErrors.property_occupied = "Property occupied is required";
    // Add more as needed
    return newErrors;
  };

  const handleFileUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_BASE_URL;
      const res = await axios.post(`${apiBaseUrl}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      // Use 'image' or 'url' depending on your backend response
      const fileUrl = res.data.image || res.data.url;
      if (fileUrl) {
        handleInputChange("lender_doc", fileUrl); // Save public URL, not blob
        setUploadedDocName(file.name);
        toast.success("File uploaded successfully!");
      } else {
        toast.error("Upload failed: No file URL returned.");
      }
    } catch (err) {
      toast.error("Failed to upload document.");
    }
  };

  return (
    <DashboardLayout role="lender">
      <Toaster position="top-right" />
      <div className="h-full overflow-hidden">
        <div className="bg-white h-full p-0">
          <form onSubmit={handleSubmit} className="h-full flex flex-col">
            <div className="flex-1 flex flex-col gap-y-4">
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
              {/* Phone number */}
              <div>
                <div className="relative w-[90%] mx-auto">
                  <label className="block text-base font-medium text-gray-900 mb-2">
                    Intended user Phone Number
                  </label>
                  <PhoneInput
                    country={'us'}
                    value={formData.phone}
                    onChange={(value, data:any) => {
                      handleInputChange('phone', value)
                      handleInputChange('country_code', data?.dialCode || '')
                    }}
                    inputStyle={{
                      height: '48px',
                      paddingLeft: '3rem',
                      paddingRight: '1rem',
                      border: '1px solid #4B5563',
                      borderRadius: '9999px',
                      fontSize: '0.875rem',
                      width: '100%',
                    }}
                    containerStyle={{
                      width: '100%',
                    }}
                    buttonStyle={{
                      border: 'none',
                      backgroundColor: 'transparent',
                      marginLeft: '0.5rem',
                      marginRight: '0.5rem',
                      height: '48px',
                      display: 'flex',
                      alignItems: 'center',
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
              {/* Preferred Date */}
              <div>
                <div className="relative w-[90%] mx-auto">
                  <label className="block text-base font-medium text-gray-900 mb-2">Preferred Date</label>
                  <input
                    type="date"
                    value={formData.preferred_date}
                    onChange={(e) => handleInputChange("preferred_date", e.target.value)}
                    className="hide-date-icon w-full pl-12 pr-4 py-3 border border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-[#1e5ba8] focus:border-transparent text-sm"
                    required
                    min= "1900-01-01" // Minimum date to prevent invalid dates
                    max= "2099-12-31"
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
                {/* Map below the address input */}
                <div
                  className="relative w-[90%] mx-auto mt-4 rounded-2xl border border-gray-500 overflow-hidden"
                  style={{ height: 130 }} // Adjust height as needed (e.g., 90px)
                >
                  {isLoaded && (
                    <GoogleMap
                      mapContainerStyle={{ width: "100%", height: "100%" }}
                      center={marker || mapCenter}
                      zoom={15}
                      onClick={(e) => {
                        setMarker({ lat: e.latLng!.lat(), lng: e.latLng!.lng() });
                      }}
                      options={{
                        disableDefaultUI: true, // Optional: hides controls for a cleaner look
                      }}
                    >
                      {marker && <Marker position={marker} />}
                    </GoogleMap>
                  )}
                </div>
              </div>
              {/* Property Type */}
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
              {/* Description */}
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
              {/* Upload Document */}
              <div>
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
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          await handleFileUpload(file);
                          setUploadedDocName(file.name);
                        }
                      }}
                      className="hidden"
                    />
                  </label>              
                </div>
              </div>
            </div>
            {/* Submit Button */}
            <div className="mt-8 w-[90%] max-w-xxl mx-auto">
              <button
                type="submit"
                className="w-full bg-[#1e5ba8] rounded-lg text-white py-4 px-6 font-medium hover:bg-[#1a4f96] transition-colors text-lg"
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