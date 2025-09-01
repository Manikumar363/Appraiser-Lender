"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard-layout";
import { profileApi } from "@/lib/api/profile";
import { toast } from "sonner";
import ProfileForm from "./ProfileForm";

interface ProfileData {
  name: string;
  email: string;
  company_name: string;
  designation: string;
  phone: string;
  image: string;
}

export default function AppraiserProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<ProfileData>({
    name: "",
    email: "",
    company_name: "",
    designation: "",
    phone: "",
    image: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await profileApi.getProfile();
        if (res.success) {
          setProfile(res.user);
          setFormData({
            name: res.user.name || "",
            email: res.user.email || "",
            company_name: res.user.company_name || "",
            designation: res.user.designation || "",
            phone: res.user.phone || "",
            image: res.user.image || "",
          });
        }
      } catch (err: any) {
        if (err.response?.status === 401) {
          toast.error("Session expired. Please sign in again.");
        } else {
          toast.error("Failed to load profile");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // New handler to sync phone changes to formData
  const handlePhoneChange = (fullPhone: string) => {
  setFormData((prev) => ({ ...prev, phone: fullPhone }));
};

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      toast.error("Name is required");
      return false;
    }
    if (!formData.email.trim()) {
      toast.error("Email is required");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return false;
    }
    return true;
  };

  const hasChanges = (): boolean => {
    if (!profile) return false;
    return (
      formData.name !== (profile.name || "") ||
      formData.email !== (profile.email || "") ||
      formData.company_name !== (profile.company_name || "") ||
      formData.designation !== (profile.designation || "") ||
      formData.phone !== (profile.phone || "")
    );
  };

  const handleCancel = () => {
    setFormData({
      name: profile.name || "",
      email: profile.email || "",
      company_name: profile.company_name || "",
      designation: profile.designation || "",
      phone: profile.phone || "",
      image: profile.image || "",
    });
    setIsEditing(false);
  };

  if (loading) {
    return (
      <DashboardLayout role="appraiser">
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2A020D]"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!profile) {
    return (
      <DashboardLayout role="appraiser">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <p className="text-red-600 mb-4">Profile failed to load.</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-[#2A020D] text-white px-4 py-2 rounded-full hover:bg-[#4e1b29]"
            >
              Retry
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="appraiser">
      <div className="h-full overflow-hidden bg-white">
        <div className="p-8 h-full flex flex-col">
          <ProfileForm
            profile={profile}
            formData={formData}
            isEditing={isEditing}
            hasChanges={hasChanges()}
            onInputChange={handleInputChange}
            onPhoneChange={handlePhoneChange}  // Added this to pass the handler
            onEdit={() => setIsEditing(true)}
            onCancel={handleCancel}
            onUpdate={(updatedProfile) => {
              setProfile(updatedProfile);
              setIsEditing(false);
            }}
            validateForm={validateForm}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
