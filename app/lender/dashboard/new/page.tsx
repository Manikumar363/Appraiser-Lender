"use client"

import type React from "react"
import { useState} from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "../../../../components/dashboard-layout"
import { MapPin, ChevronDown, Phone, LocateIcon, FileText, StickyNote } from "lucide-react"
import { UserIcon, TargettIcon, DollerIcon, SecondaryProfileIcon, CalendarIcon, DateIcon, UploadIcon, LocationIcon } from "../../../../components/icons"
import { postJob } from "@/lib/api/jobs1"
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { CountryData } from "react-phone-input-2";
import { GoogleMap, Marker, useJsApiLoader, Autocomplete } from "@react-google-maps/api";
import { useCallback } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import type { Libraries } from "@react-google-maps/api";
import { Description } from "@radix-ui/react-toast"
import Select, { components } from "react-select";

// Import Library type from @react-google-maps/api and use Library[] type for libraries

const GOOGLE_MAP_LIBRARIES: Libraries = ["places"]; // <-- define outside component

// Add this function at the top of your component or in a utils file
const allowOnlyAlphabets = (value: string) => value.replace(/[^a-zA-Z\s]/g, "");

const allowOnlyDigits = (value: string) => value.replace(/[^0-9]/g, "");

const options = [
  { value: "testing", label: "Testing" },
  { value: "new10", label: "new 10" },
  { value: "new8", label: "new 8" },
  { value: "new7", label: "new 7" },
  { value: "new6", label: "new 6" },
  { value: "new5", label: "new 5" },
  { value: "new4", label: "new 4" },
  { value: "new3", label: "new 3" },
  { value: "new2", label: "new 2" },
  { value: "new_intended_use", label: "new intended use" },
];

const customStyles = {
  option: (provided: any, state: any) => ({
    ...provided,
    backgroundColor: state.isFocused || state.isSelected ? "#2A020D" : "#fff",
    color: state.isFocused || state.isSelected ? "#fff" : "#22223B",
    fontSize: "0.875rem",
    borderRadius: "8px",
    paddingLeft: "2.5rem",
    paddingRight: "1rem",
    outline: "none",
    boxShadow: "none",
  }),
  control: (provided: any, state: any) => ({
    ...provided,
    borderRadius: "9999px",
    borderColor: "#4B5563", // border-gray-700
    minHeight: "48px",
    boxShadow: "none",
    fontSize: "0.875rem",
    paddingLeft: "3rem",
    paddingRight: "1rem",
    
    outline: "none",
    "&:hover": {
      borderColor: "#2A020D",
    },
    "&:focus": {
      borderColor: "#2A020D",
      boxShadow: "none", // no glow on focus
      outline: "none",
    },
  }),
  indicatorSeparator: () => ({
    display: "none", // removes the vertical line
  }),
  dropdownIndicator: (provided: any) => ({
    ...provided,
    color: "#4B5563", // border-gray-700
    paddingRight: "1rem",
  }),
  placeholder: (provided: any) => ({
    ...provided,
    color: "#6B7280", // text-gray-600
    fontSize: "0.975rem",
    paddingLeft: "0rem",
  }),
  singleValue: (provided: any) => ({
    ...provided,
    color: "#22223B",
    fontSize: "0.875rem",
    paddingLeft: "0.5rem",
  }),
  menu: (provided: any) => ({
    ...provided,
    borderRadius: "16px",
     boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
    zIndex: 20,
  }),
};

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
  const [propertyLocation, setPropertyLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);


  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: GOOGLE_MAP_LIBRARIES, // <-- use the constant here
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Only geocode if address is long enough (e.g., > 10 chars)
    if (field === "address" && value.trim().length > 10) {
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
          background: "#2A020D",
          color: "#fff",
          fontWeight: "bold",
          fontSize: "1.1rem",
          borderRadius: "8px",
          boxShadow: "0 2px 12px rgba(1,79,157,0.15)",
        },
        iconTheme: {
          primary: "#fff",
          secondary: "#2A020D",
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
    if (!address || address.trim().length <= 10) return; // Don't geocode short/incomplete addresses
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
      const location = response.data.results[0]?.geometry.location;
      if (location) {
        setMapCenter({ lat: location.lat, lng: location.lng });
        setMarker({ lat: location.lat, lng: location.lng });
      } else {
        toast.error("Unable to find location. Please enter a valid address.");
      }
    } catch (error) {
      toast.error("Geocoding failed. Please try again.");
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

  const handleMultipleFileUpload = async (files: FileList) => {
    const fileArr = Array.from(files);
    setUploadedFiles(prev => [...prev, ...fileArr]);
    // Optionally, upload to server here as well
    // ...existing upload logic...
  };

  const handlePlaceChanged = () => {
    if (autocomplete) {
      const place = autocomplete.getPlace();
      if (place.geometry?.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        setMapCenter({ lat, lng });
        setMarker({ lat, lng });
        setFormData((prev) => ({
          ...prev,
          address: place.formatted_address || "",
        }));
      }
    }
  };

  const handleRemoveUploadedFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    // Optionally, remove from server or update formData.lender_doc as needed
  };

  const CustomInputIcon = () => (
    <span className="absolute left-4 top-[55%] -translate-y-[4%] text-gray-700 z-10 pointer-events-none">
      <SecondaryProfileIcon />
    </span>
  );

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
                    onChange={e => handleInputChange("intended_user", allowOnlyAlphabets(e.target.value))}
                    placeholder="Enter Name"
                    className="w-full pl-12 pr-4 py-3 border border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-[#2A020D] focus:border-transparent text-sm"
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
                    onChange={e => handleInputChange("intended_username", allowOnlyAlphabets(e.target.value))}
                    placeholder="Enter Name"
                    className="w-full pl-12 pr-4 py-3 border border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-[#2A020D] focus:border-transparent text-sm"
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
                    onChange={e => handleInputChange("purpose", allowOnlyAlphabets(e.target.value))}
                    placeholder="Enter Purpose"
                    className="w-full pl-12 pr-4 py-3 border border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-[#2A020D] focus:border-transparent text-sm"
                    required
                  />
                </div>
              </div>
              {/* Intended Use */}
              <div>
                <div className="relative w-[90%] mx-auto">
                  <label className="block text-base font-medium text-gray-900 mb-2">Intended Use</label>
                  <CustomInputIcon />
                  <Select
                    options={options}
                    styles={customStyles}
                    placeholder="Enter Input"
                    onChange={(selectedOption) => handleInputChange("use", selectedOption?.value || "")}
                    classNamePrefix="react-select"
                    className="w-full"
                    isSearchable={false}
                    noOptionsMessage={() => "No options found"}
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
                    className="hide-date-icon w-full pl-12 pr-4 py-3 border border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-[#2A020D] focus:border-transparent text-sm"
                    required
                    min= "1900-01-01" // Minimum date to prevent invalid dates
                    max= "2099-12-31"
                  />
                  <DateIcon className="absolute left-4 top-[50%] mt-4 -translate-y-1/2 w-5 h-5 text-gray-700 pointer-events-none" />
                </div>
              </div>
              {/* Property Address */}
              <div>
                {isLoaded ? (
                  <div className="relative w-[90%] mx-auto">
                    <label className="block text-base font-medium text-gray-900 mb-2">Property Address</label>
                    <LocationIcon className="absolute left-4 top-[55%] -translate-y-[4%] text-gray-700" />
                    <Autocomplete
                      
                      onLoad={setAutocomplete}
                      onPlaceChanged={handlePlaceChanged}
                    >
                      
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => handleInputChange("address", e.target.value)}
                        placeholder="Enter Property Address"
                        className="w-full pl-12 pr-4 py-3 border border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-[#2A020D] focus:border-transparent text-sm"
                        required
                      />
                    </Autocomplete>
                  </div>
                ) : (
                  <div className="relative w-[90%] mx-auto">
                    <label className="block text-base font-medium text-gray-900 mb-2">Property Address</label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      placeholder="Loading Google Maps..."
                      className="w-full pl-12 pr-4 py-3 border border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-[#2A020D] focus:border-transparent text-sm"
                      disabled
                    />
                  </div>
                )}
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
                  <span className="absolute left-4 top-[55%] -translate-y-[4%] text-gray-700 z-10 pointer-events-none">
                    <SecondaryProfileIcon />
                  </span>
                  <Select
                    options={requestedByOptions.map(option => ({ value: option, label: option }))}
                    styles={customStyles}
                    placeholder="Enter Input"
                    onChange={(selectedOption) => handleInputChange("property_type", selectedOption?.value || "")}
                    classNamePrefix="react-select"
                    className="w-full"
                    isSearchable={false}
                    noOptionsMessage={() => "No options found"}
                    value={requestedByOptions
                      .map(option => ({ value: option, label: option }))
                      .find(opt => opt.value === formData.property_type) || null}
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
                    onChange={(e) => handleInputChange("price", allowOnlyDigits(e.target.value))}
                    placeholder="Enter Property Cost"
                    className="w-full pl-12 pr-4 py-3 border border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-[#2A020D] focus:border-transparent text-sm"
                    required
                  />
                </div>
              </div>
              {/* Description */}
              <div>
                <div className="relative w-[90%] mx-auto">
                  <label className="block text-base font-medium text-gray-900 mb-2">Description</label>
                  <FileText className="absolute left-4 top-[55%] -translate-y-[4%] text-gray-700" />
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Enter Description"
                    className="w-full pl-12 pr-4 py-3 border border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-[#2A020D] focus:border-transparent text-sm"
                    required
                  />
                </div>
              </div>
              {/* Property Occupied */}
              <div>
                <div className="relative w-[90%] mx-auto">
                  <label className="block text-base font-medium text-gray-900 mb-2">Property Occupied</label>
                  <span className="absolute left-4 top-[55%] -translate-y-[4%] text-gray-700 z-10 pointer-events-none">
                    <SecondaryProfileIcon />
                  </span>
                  <Select
                    options={purposeOptions.map(option => ({ value: option, label: option }))}
                    styles={customStyles}
                    placeholder="Enter Input"
                    onChange={(selectedOption) => handleInputChange("property_occupied", selectedOption?.value || "")}
                    classNamePrefix="react-select"
                    className="w-full"
                    isSearchable={false}
                    noOptionsMessage={() => "No options found"}
                    value={purposeOptions
                      .map(option => ({ value: option, label: option }))
                      .find(opt => opt.value === formData.property_occupied) || null}
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
                    className="flex flex-col items-center justify-center h-40 border border-gray-600 rounded-2xl cursor-pointer transition-all relative"
                  >
                    <UploadIcon className="w-6 h-6 text-gray-500 mb-2" />
                    <p className={`text-sm text-center ${uploadedFiles.length > 0 ? "text-green-600 font-semibold" : "text-gray-700"}`}>
                      {uploadedFiles.length > 0
                        ? `${uploadedFiles.length} file(s) selected`
                        : <>Upload any additional PDF<br />or images related to this job</>
                      }
                    </p>
                    <input
                      id="pdf-upload"
                      type="file"
                      accept="application/pdf,image/jpeg,image/png"
                      multiple
                      onChange={e => {
                        const files = e.target.files;
                        if (files && files.length > 0) {
                          handleMultipleFileUpload(files);
                        }
                      }}
                      className="hidden"
                    />
                    {/* Remove button for uploadedDocName is not needed here, as individual file remove buttons are rendered below */}
                  </label>
                  {uploadedFiles.length > 0 && (
  <div className="flex flex-col items-center gap-2 mt-3">
    {uploadedFiles.map((file, idx) => (
      <div
        key={file.name + idx}
        className="flex items-center px-4 py-2 rounded-lg shadow border border-gray-200 bg-white max-w-[350px] w-full justify-between"
      >
        <span className="truncate flex-1">
          <span className="font-bold text-[#2A020D] mr-2">
            {file.type.startsWith("image/") ? "IMG" : file.type.startsWith("application/pdf") ? "PDF" : "FILE"}
          </span>
          {file.name}
        </span>
        <span className="ml-2 text-gray-500 text-xs">{(file.size / 1024).toFixed(1)} KB</span>
        <button
          type="button"
          onClick={() => handleRemoveUploadedFile(idx)}
          className="ml-3 text-red-500 hover:text-red-700 text-lg font-bold"
          aria-label="Remove file"
        >
          &times;
        </button>
      </div>
    ))}
  </div>
)}
                </div>
              </div>
            </div>
            {/* Submit Button */}
            <div className="mt-8 w-[90%] max-w-xxl mx-auto">
              <button
                type="submit"
                className="w-full bg-[#2A020D] rounded-lg text-white py-4 px-6 font-medium hover:bg-[#4e1b29] transition-colors text-lg"
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