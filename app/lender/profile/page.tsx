"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard-layout";
import { profileApi } from "@/lib/api/profile";
import api from "@/lib/api/axios";
import Image from "next/image";
import {
  EmailIcon,
  CompanyIcon,
  DesignationIcon,
  ThirdPrimaryIcon,
  CheckmarkIcon,
  LocationIcon,
} from "@/components/icons";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import type { CountryData } from 'react-phone-input-2';

export default function AppraiserProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    applicant: "",
    location: "",
    phone: "",
    image: "",
    country_code: "",
    address: "",
    province: "",
    city: "",
    postal_code: "",
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await profileApi.getLenderProfile();
        if (res.success) {
          setProfile(res.user);
          setFormData({
            name: res.user.name || "",
            email: res.user.email || "",
            applicant: res.user.applicant || "",
            location: res.user.location || "",
            phone: res.user.phone || "",
            image: res.user.image || "",
            country_code: res.user.country_code || "",
            address: res.user.address || "",
            province: res.user.province || "", 
            city: res.user.city || "",
            postal_code: res.user.postal_code || "",
          });
        } else {
          console.error("❌ Failed to load profile");
        }
      } catch (err) {
        console.error("❌ Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
 const handlePhoneChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      phone: value,
    }));
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await api.patch(
        "/lender/profile",
        {
          name: formData.name,
          email: formData.email,
          applicant: formData.applicant,
          location: formData.location,
          phone: formData.phone,
        },
        {
          headers: {
            Authorization: `${localStorage.getItem("authToken")}`,
          },
        }
      );
      console.log("✅ Profile updated:", res.data);

      setSuccess("Profile updated successfully!");
      setIsEditing(false);

      setTimeout(() => {
      setSuccess("");
      }, 3000);

      // Optionally refresh profile
      const updatedProfile = await profileApi.getLenderProfile();
      if (updatedProfile.success) {
        setProfile(updatedProfile.user);
    }
  } catch (err: any) {
    console.error("❌ Failed to update profile:", err);
    setError(err.response?.data?.message || "Failed to update profile");
  } finally {
    setSubmitLoading(false);
  }
};

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (!profile) return <div className="p-10 text-center text-red-600">Profile failed to load.</div>;

  return (
    <DashboardLayout role="lender">
      <div className="h-full overflow-hidden">
        <div className="p-8 h-full flex flex-col">
          <div className="flex flex-col items-center mb-8">
            <div className="w-24 h-24 rounded-full overflow-hidden mb-4">
              <Image
                src={formData.image || "/images/profile-avatar.png"}
                alt="Profile Avatar"
                width={96}
                height={96}
                className="w-full h-full object-cover"
              />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {formData.name || "Your Name"}
            </h1>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-gray-600">
                {formData.email || "Your Email"}
              </span>
              <CheckmarkIcon />
            </div>
            <div className="flex items-center gap-2 mb-6">
              <span className="text-gray-600">{formData.phone || "Your Phone"}</span>
              <CheckmarkIcon />
            </div>

            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-blue-800 hover:bg-blue-800 text-white px-6 py-2 rounded-full font-medium transition"
              >
                Edit Profile
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-full font-medium transition"
              >
                Cancel
              </button>
            )}
          </div>

          <form
            onSubmit={handleUpdateProfile}
            className="flex-1 space-y-4 max-w-4xl mx-auto w-full"
          >
            {/* Name */}
            <div className="relative">
              <div className="flex items-center rounded-full px-4 py-3 border border-gray-600">
                <div className="mr-3">
                  <ThirdPrimaryIcon />
                </div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Your Name"
                  readOnly={!isEditing}
                  className={`flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-500 outline-none ${
                    !isEditing ? "cursor-not-allowed" : ""
                  }`}
                />
              </div>
            </div>

            {/* Email */}
            <div className="relative">
              <div className="flex items-center  rounded-full px-4 py-3 border border-gray-600">
                <div className="mr-3">
                  <EmailIcon />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Your Email"
                  readOnly={!isEditing}
                  className={`flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-500 outline-none ${
                    !isEditing ? "cursor-not-allowed" : ""
                  }`}
                />
              </div>
            </div>

            {/* Designation */}
            <div className="relative">
              <div className="flex items-center  rounded-full px-4 py-3 border border-gray-600">
                <div className="mr-3">
                  <DesignationIcon />
                </div>
                <input
                  type="text"
                  name="applicant"
                  value={formData.applicant}
                  onChange={handleInputChange}
                  placeholder="Applicant"
                  readOnly={!isEditing}
                  className={`flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-500 outline-none ${
                    !isEditing ? "cursor-not-allowed" : ""
                  }`}
                />
              </div>
            </div>
            {/*location*/}
             <div className="relative">
              <div className="flex items-center  rounded-full px-4 py-3 border border-gray-600">
                <div className="mr-3">
                  <LocationIcon />
                </div>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Location"
                  readOnly={!isEditing}
                  className={`flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-500 outline-none ${
                    !isEditing ? "cursor-not-allowed" : ""
                  }`}
                />
              </div>
            </div>

            {/* Phone Input */}

           <div className="relative">
           <label className="block text-gray-700 mb-2 text-sm font-medium">Phone Number</label>
           <PhoneInput
             country={"us"}
             value={formData.phone}
             onChange={(value: string, data: CountryData | {} | undefined) =>{
               const country = data as CountryData;
               const dialCode = country?.dialCode || '';
               setFormData((prev) => ({
                ...prev,
                phone: value,
                country_code: dialCode,
              }));
             }}
             placeholder="Type your phone number here" // ✅ add this!
             inputClass={`flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-500 outline-none ${
                    !isEditing ? "cursor-not-allowed" : ""
             }`}
             inputProps={{
               readOnly: !isEditing,
                disabled: !isEditing, // Optional: disables dropdown and input
             }}
             enableSearch
            />

           </div> 

            {error && <p className="text-red-600">{error}</p>}
            {success && <p className="text-green-600">{success}</p>}

            {isEditing && (
              <div>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="w-full bg-blue-800 hover:bg-blue-800 text-white py-3 rounded-full font-medium"
                >
                  {submitLoading ? "Updating..." : "Update Profile"}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}