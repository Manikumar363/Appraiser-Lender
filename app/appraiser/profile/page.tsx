"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard-layout";
import { profileApi } from "@/lib/api/profile";
import api from "@/lib/api/axios";
import Image from "next/image";
import {
  ProfileIcon,
  EmailIcon,
  CompanyIcon,
  DesignationIcon,
} from "@/components/icons";

export default function AppraiserProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company_name: "",
    designation: "",
    phone: "",
    image: "",
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    setError("");
    setSuccess("");

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
      );
      console.log("✅ Profile updated:", res.data);

      setSuccess("Profile updated successfully!");
      setIsEditing(false);

      // Optionally refresh profile
      const updatedProfile = await profileApi.getProfile();
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
    <DashboardLayout role="appraiser">
      <div className="h-full overflow-hidden bg-white">
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
            </div>

            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-medium transition"
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
              <div className="flex items-center bg-gray-50 rounded-full px-4 py-3 border">
                <div className="mr-3">
                  <ProfileIcon />
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
              <div className="flex items-center bg-gray-50 rounded-full px-4 py-3 border">
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

            {/* Company */}
            <div className="relative">
              <div className="flex items-center bg-gray-50 rounded-full px-4 py-3 border">
                <div className="mr-3">
                  <CompanyIcon />
                </div>
                <input
                  type="text"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleInputChange}
                  placeholder="Company Name"
                  readOnly={!isEditing}
                  className={`flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-500 outline-none ${
                    !isEditing ? "cursor-not-allowed" : ""
                  }`}
                />
              </div>
            </div>

            {/* Designation */}
            <div className="relative">
              <div className="flex items-center bg-gray-50 rounded-full px-4 py-3 border">
                <div className="mr-3">
                  <DesignationIcon />
                </div>
                <input
                  type="text"
                  name="designation"
                  value={formData.designation}
                  onChange={handleInputChange}
                  placeholder="Your Designation"
                  readOnly={!isEditing}
                  className={`flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-500 outline-none ${
                    !isEditing ? "cursor-not-allowed" : ""
                  }`}
                />
              </div>
            </div>

            {/* Phone */}
            <div className="relative">
              <div className="flex items-center bg-gray-50 rounded-full px-4 py-3 border">
                <div className="mr-3">📞</div>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Phone Number"
                  readOnly={!isEditing}
                  className={`flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-500 outline-none ${
                    !isEditing ? "cursor-not-allowed" : ""
                  }`}
                />
              </div>
            </div>

            {error && <p className="text-red-600">{error}</p>}
            {success && <p className="text-green-600">{success}</p>}

            {isEditing && (
              <div>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-full font-medium"
                >
                  {submitLoading ? "Updating..." : "Save Changes"}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
