"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { toast } from "sonner"; 
import api from "@/lib/api/axios";
import { profileApi } from "@/lib/api/profile";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import {
  Tick,
  ProfileIcon2,
  EmailIcon,
  CompanyIcon,
  DesignationIcon,
} from "@/components/icons";

interface ProfileFormProps {
  profile: any;
  formData: any;
  isEditing: boolean;
  hasChanges: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPhoneChange: (phoneNumber: string) => void;
  onEdit: () => void;
  onCancel: () => void;
  onUpdate: (profile: any) => void;
  validateForm: () => boolean;
}

export default function ProfileForm({
  profile,
  formData,
  isEditing,
  hasChanges,
  onInputChange,
  onPhoneChange,
  onEdit,
  onCancel,
  onUpdate,
  validateForm,
}: ProfileFormProps) {
  const [submitLoading, setSubmitLoading] = useState(false);
  const [fullPhone, setFullPhone] = useState(formData.phone || "");

  // Initialize fullPhone with "+" for PhoneInput compatibility
  useEffect(() => {
    let initialPhone = formData.phone || "";
    if (initialPhone && !initialPhone.startsWith("+")) {
      initialPhone = `+${initialPhone}`;
    }
    setFullPhone(initialPhone);
  }, [formData.phone]);

  // Parse phone number for API (same logic as signup)
  const parsePhoneNumber = (phone: string) => {
    if (!phone) return { countryCode: "", phoneNumber: "" };
    
    if (phone.startsWith("+")) {
      const match = phone.match(/^\+\d+/);
      if (match) {
        const countryCode = match[0];
        const phoneNumber = phone.slice(countryCode.length).replace(/\D/g, "");
        return { countryCode, phoneNumber };
      }
    }
    return { countryCode: "+1", phoneNumber: phone.replace(/\D/g, "") };
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !hasChanges) return;

    // Reverted to your original validation
    if (fullPhone && fullPhone.replace(/\D/g, "").length < 10) {
      toast.error("Please enter a valid phone number.");
      return;
    }

    setSubmitLoading(true);
    
    try {
      const { countryCode, phoneNumber } = parsePhoneNumber(fullPhone);
      
      await api.patch(
        "/user/profile",
        {
          name: formData.name.trim(),
          email: formData.email.trim(),
          company_name: formData.company_name.trim(),
          designation: formData.designation.trim(),
          phone: phoneNumber,
          countryCode: countryCode,
        },
        {
          headers: {
            Authorization: `${localStorage.getItem("authToken")}`,
          },
        }
      );

      toast.success("Profile updated successfully!");

      // Refresh profile data
      const updatedProfile = await profileApi.getProfile();
      if (updatedProfile.success) {
        onUpdate(updatedProfile.user);
      }
      
    } catch (err: any) {
      const errorMessage = err.response?.data?.message;
      
      if (err.response?.status === 401) {
        toast.error("Session expired. Please sign in again.");
      } else if (errorMessage?.includes("email")) {
        toast.error("Email address is already in use.");
      } else {
        toast.error("Failed to update profile. Please try again.");
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  const regularFields = [
    { name: 'name', placeholder: 'Your Name', type: 'text', icon: <ProfileIcon2 /> },
    { name: 'email', placeholder: 'Your Email', type: 'email', icon: <EmailIcon /> },
    { name: 'company_name', placeholder: 'Company Name', type: 'text', icon: <CompanyIcon /> },
    { name: 'designation', placeholder: 'Your Designation', type: 'text', icon: <DesignationIcon /> },
  ];

  return (
    <>
      {/* Profile Header */}
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
          {formData.name}
        </h1>
        
        <div className="flex flex-col items-center gap-2 mb-4">
          
          <div className="flex items-center gap-1 text-gray-600">
            
            <span>{formData.email }</span>
            <Tick />
          </div>
          <div className="flex items-center gap-1 text-gray-700">
            <span>{fullPhone}</span>
            <Tick />
          </div>
        </div>

        {!isEditing ? (
          <button
            onClick={onEdit}
            className="bg-[#2A020D] hover:bg-[#2A020Df5] text-white px-6 py-2 rounded-full font-medium transition"
          >
            Edit Profile
          </button>
        ) : (
          <button
            onClick={onCancel}
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-full font-medium transition"
          >
            Cancel
          </button>
        )}
      </div>

      {/* Profile Form */}
      <form
        onSubmit={handleUpdateProfile}
        className="flex-1 space-y-4 max-w-6xl mx-auto w-full"
      >
        {/* Regular Text Fields */}
        {regularFields.map((field) => (
          <div key={field.name} className="relative">
            <div className="flex items-center bg-gray-50 rounded-full px-4 py-3 border">
              <div className="mr-3">{field.icon}</div>
              <input
                type={field.type}
                name={field.name}
                value={formData[field.name]}
                onChange={onInputChange}
                placeholder={field.placeholder}
                readOnly={!isEditing}
                className={`flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-500 outline-none ${
                  !isEditing ? "cursor-not-allowed" : ""
                }`}
              />
            </div>
          </div>
        ))}

        {/* Phone Number Field - With syncing for button enabling */}
        <div className="relative">
          <PhoneInput
            country={"us"}
            value={fullPhone}
            onChange={(value) => {
              setFullPhone(value);
              const { phoneNumber } = parsePhoneNumber(value);
              onPhoneChange(phoneNumber);  // Sync to enable button
            }}
            placeholder="Type your phone number here"
            disabled={!isEditing}
            inputClass={`!w-full !h-[52px] !text-base !pl-[58px] !pr-4 !rounded-full !border !border-gray-300 focus:!border-[#2A020D] focus:!shadow-md transition-all ${
              !isEditing ? "!bg-gray-50 !cursor-not-allowed" : "!bg-white"
            }`}
            containerClass="!w-full"
            buttonClass="!border-r !border-gray-300 !rounded-l-full"
            enableSearch={isEditing}
            dropdownClass="!max-h-60 !overflow-y-auto !z-50 !w-full !min-w-[250px] !absolute !left-0 !bottom-full !mb-1 !bg-white !shadow-lg !rounded-lg"
          />
        </div>

        {isEditing && (
          <div className="pt-4">
            <button
              type="submit"
              disabled={submitLoading || !hasChanges}
              className={`w-full py-3 rounded-full font-medium transition ${
                submitLoading || !hasChanges
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-[#2A020D] hover:bg-[#2A020Df5] text-white"
              }`}
            >
              {submitLoading ? "Updating..." : "Update Profile"}
            </button>
          </div>
        )}
      </form>
    </>
  );
}
