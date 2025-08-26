"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard-layout";
import { profileApi } from "@/lib/api/profile";
import api from "@/lib/api/axios";
import Image from "next/image";
import {
  EmailIcon,
  DesignationIcon,
  ThirdPrimaryIcon,
  CheckmarkIcon,
} from "@/components/icons";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import type { CountryData } from "react-phone-input-2";
import toast, { Toaster } from "react-hot-toast";
import { isValidPhoneNumber } from "libphonenumber-js";
import NextDynamic from "next/dynamic";

// Force dynamic rendering (optional — keep only if you really need it)
export const dynamic = "force-dynamic";
const MapSection = NextDynamic(() => import("./MapSection"), { ssr: false });

interface GeoPoint {
  type: "Point";
  coordinates: [number, number]; // [lng, lat]
}

interface RawLocationLL {
  latitude: number;
  longitude: number;
}

interface RawLocationGeo {
  type: "Point";
  coordinates: [number, number];
}

interface LenderProfile {
  name?: string;
  email?: string;
  applicant?: string;
  phone?: string;
  image?: string;
  country_code?: string;
  address?: string;
  province?: string;
  city?: string;
  postal_code?: string;
  location?: RawLocationLL | RawLocationGeo;
  [k: string]: any;
}

interface FormDataState {
  name: string;
  email: string;
  applicant: string;
  location: GeoPoint;
  phone: string;
  image: string;
  country_code: string;
  address: string;
  province: string;
  city: string;
  postal_code: string;
}

export default function LenderProfilePage() {
  const [profile, setProfile] = useState<LenderProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<FormDataState>({
    name: "",
    email: "",
    applicant: "",
    location: { type: "Point", coordinates: [0, 0] },
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
  const [address, setAddress] = useState("");
  const [marker, setMarker] = useState({ lat: 43.6532, lng: -79.3832 });
  const [lastPhoneCountryData, setLastPhoneCountryData] = useState<CountryData | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await profileApi.getLenderProfile();
        if (!res.success || cancelled) return;
        const u: LenderProfile = res.user;

        let lat = 43.6532;
        let lng = -79.3832;
        if (u.location) {
            // Two possible shapes
          if ("latitude" in u.location && "longitude" in u.location) {
            lat = u.location.latitude;
            lng = u.location.longitude;
          } else if ("coordinates" in u.location && Array.isArray(u.location.coordinates)) {
            lng = u.location.coordinates[0];
            lat = u.location.coordinates[1];
          }
        }

        setMarker({ lat, lng });
        setAddress(u.address || "");
        setFormData({
          name: u.name || "",
          email: u.email || "",
          applicant: u.applicant || "",
          location: { type: "Point", coordinates: [lng, lat] },
            // Normalize phone: ensure one +
          phone: u.phone ? (u.phone.startsWith("+") ? u.phone : `+${u.phone}`) : "",
          image: u.image || "",
          country_code: u.country_code || "",
          address: u.address || "",
          province: u.province || "",
          city: u.city || "",
          postal_code: u.postal_code || "",
        });
        setProfile(u);
      } catch (e) {
        console.error("Error fetching profile", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const clearFieldError = (field: string) =>
    setFieldErrors((prev) => {
      if (!(field in prev)) return prev;
      const { [field]: _, ...rest } = prev;
      return rest;
    });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    clearFieldError(name);
  };

  const handlePhoneChange = (value: string, data: CountryData) => {
    const normalized = value.startsWith("+") ? value : `+${value}`;
    setFormData((p) => ({
      ...p,
      phone: normalized,
      country_code: data.dialCode || p.country_code,
    }));
    setLastPhoneCountryData(data);
  };

  const handleAddressChange = (val: string) => {
    setAddress(val);
    setFormData((p) => ({ ...p, address: val }));
  };

  const handleMarkerChange = (lat: number, lng: number) => {
    setMarker({ lat, lng });
    setFormData((p) => ({
      ...p,
      location: { type: "Point", coordinates: [lng, lat] },
    }));
  };

  function validateFields() {
    const errors: Record<string, string> = {};
    if (!formData.name.trim() || !/^[A-Za-z\s]+$/.test(formData.name.trim())) {
      errors.name = "Name should contain only letters and spaces";
    }
    if (!formData.applicant.trim() || !/^[A-Za-z\s]+$/.test(formData.applicant.trim())) {
      errors.applicant = "Applicant should contain only letters and spaces";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = "Enter a valid email";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitLoading) return;
    setSubmitLoading(true);
    setError("");
    setSuccess("");

    if (!validateFields()) {
      setSubmitLoading(false);
      return;
    }

    const iso2 = (lastPhoneCountryData?.countryCode || formData.country_code || "US").toUpperCase();
    if (formData.phone && !isValidPhoneNumber(formData.phone, iso2 as any)) {
      toast.error("Invalid phone number");
      setSubmitLoading(false);
      return;
    }

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

      await api.patch(
        "/lender/profile",
        {
          name: formData.name.trim(),
          email: formData.email.trim(),
          applicant: formData.applicant.trim(),
          // If backend expects lat/long pair:
          location: {
            latitude: marker.lat,
            longitude: marker.lng,
            // If backend expects GeoJSON instead remove latitude/longitude above and send:
            // type: "Point",
            // coordinates: [marker.lng, marker.lat],
          },
          phone: formData.phone,
          address: formData.address,
        },
        token
          ? {
              headers: {
                Authorization: token.startsWith("Bearer ") ? token : `Bearer ${token}`,
              },
            }
          : undefined
      );

      setIsEditing(false);
      toast.success("Profile updated");

      const refreshed = await profileApi.getLenderProfile();
      if (refreshed.success) setProfile(refreshed.user);
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Failed to update profile";
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (!profile) return;
    let lat = marker.lat;
    let lng = marker.lng;
    if (profile.location) {
      if ("latitude" in profile.location && "longitude" in profile.location) {
        lat = profile.location.latitude;
        lng = profile.location.longitude;
      } else if ("coordinates" in profile.location && Array.isArray(profile.location.coordinates)) {
        lng = profile.location.coordinates[0];
        lat = profile.location.coordinates[1];
      }
    }
    setFormData({
      name: profile.name || "",
      email: profile.email || "",
      applicant: profile.applicant || "",
      location: { type: "Point", coordinates: [lng, lat] },
      phone: profile.phone ? (profile.phone.startsWith("+") ? profile.phone : `+${profile.phone}`) : "",
      image: profile.image || "",
      country_code: profile.country_code || "",
      address: profile.address || "",
      province: profile.province || "",
      city: profile.city || "",
      postal_code: profile.postal_code || "",
    });
    setAddress(profile.address || "");
    setMarker({ lat, lng });
    setFieldErrors({});
    setError("");
    setSuccess("");
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (!profile) return <div className="p-10 text-center text-red-600">Profile failed to load.</div>;

  return (
    <DashboardLayout role="lender">
      <Toaster position="top-right" />
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
              <span className="text-gray-600">{formData.email || "Your Email"}</span>
              <CheckmarkIcon />
            </div>
            <div className="flex items-center gap-2 mb-6">
              <span className="text-gray-600">{formData.phone || "Your Phone"}</span>
              <CheckmarkIcon />
            </div>

            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="bg-[#2A020D] hover:bg-[#4e1b29] text-white px-6 py-2 rounded-full font-medium transition"
              >
                Edit Profile
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-full font-medium transition"
              >
                Cancel
              </button>
            )}
          </div>

          <form onSubmit={handleUpdateProfile} className="flex-1 space-y-4 max-w-4xl mx-auto w-full">
            {/* Name */}
            <div>
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
              {fieldErrors.name && <p className="text-red-600 text-xs mt-1">{fieldErrors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <div className="flex items-center rounded-full px-4 py-3 border border-gray-600">
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
              {fieldErrors.email && <p className="text-red-600 text-xs mt-1">{fieldErrors.email}</p>}
            </div>

            {/* Applicant */}
            <div>
              <div className="flex items-center rounded-full px-4 py-3 border border-gray-600">
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
              {fieldErrors.applicant && (
                <p className="text-red-600 text-xs mt-1">{fieldErrors.applicant}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <div
                className={`flex items-center rounded-full px-4 py-3 border border-gray-600 ${
                  !isEditing ? "opacity-70" : ""
                }`}
              >
                <PhoneInput
                  country="us"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  containerClass="flex-1"
                  inputClass="!w-full !bg-transparent !border-none !outline-none !text-sm !text-gray-900 !placeholder-gray-500 h-5"
                  buttonClass={`!bg-transparent !border-none ${!isEditing ? "cursor-not-allowed" : ""}`}
                  inputProps={{
                    readOnly: !isEditing,
                    disabled: !isEditing,
                    style: { height: "25px" },
                  }}
                  enableSearch
                  disabled={!isEditing}
                />
              </div>
            </div>

            {/* Map + Address */}
            <MapSection
              isEditing={isEditing}
              address={address}
              onAddressChange={handleAddressChange}
              marker={marker}
              onMarkerChange={handleMarkerChange}
            />

            {error && <p className="text-red-600 text-sm">{error}</p>}
            {success && <p className="text-green-600 text-sm">{success}</p>}

            {isEditing && (
              <div>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="w-full bg-[#2A020D] hover:bg-[#4e1b29] text-white py-3 rounded-full font-medium disabled:opacity-60"
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