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
import axios from "axios";
import { GoogleMap, Marker, useJsApiLoader, Autocomplete } from '@react-google-maps/api';
import toast, { Toaster } from "react-hot-toast";
import type { Libraries } from "@react-google-maps/api";

const mapContainerStyle = {
  width: '100%',
  height: '136px', // h-64
};

const GOOGLE_MAP_LIBRARIES: Libraries = ["places"];

export default function LenderProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    applicant: "",
    location: {
      type: "Point",
      coordinates: [0, 0], // [lng, lat]
    },
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

  // Add state for address, map center, and marker
  const [address, setAddress] = useState(formData.address || "");
  const [mapCenter, setMapCenter] = useState({ lat: 43.6532, lng: -79.3832 });
  const [marker, setMarker] = useState({ lat: 43.6532, lng: -79.3832 });
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries: GOOGLE_MAP_LIBRARIES,
  });

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
            location: res.user.location || { latitude: 0, longitude: 0 },
            phone: res.user.phone || "",
            image: res.user.image || "",
            country_code: res.user.country_code || "",
            address: res.user.address || "",
            province: res.user.province || "", 
            city: res.user.city || "",
            postal_code: res.user.postal_code || "",
          });
          setAddress(res.user.address || "");

          // Handle both formats for location
          let lat = 43.6532, lng = -79.3832;
          if (res.user.location) {
            if ("latitude" in res.user.location && "longitude" in res.user.location) {
              lat = res.user.location.latitude;
              lng = res.user.location.longitude;
            } else if ("coordinates" in res.user.location && Array.isArray(res.user.location.coordinates)) {
              lng = res.user.location.coordinates[0];
              lat = res.user.location.coordinates[1];
            }
          }
          setMapCenter({ lat, lng });
          setMarker({ lat, lng });
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
  }
  
 const handlePhoneChange = (value: string, data: any) => {
    setFormData((prev) => ({
    ...prev,
    phone: value.startsWith("+") ? value : `+${value}`,
    country_code: data.dialCode || "", // still save this in case needed separately
  }));
  };

  // Geocode function
  const geocodeAddress = async (addr: string) => {
    if (!addr) return;
    try {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json`,
        {
          params: {
            address: addr,
            key: apiKey,
          },
        }
      );
      const location = response.data.results[0]?.geometry.location;
      if (location) {
        setMapCenter({ lat: location.lat, lng: location.lng });
        setMarker({ lat: location.lat, lng: location.lng });
        setFormData((prev) => ({
          ...prev,
          address: addr,
          location: {
            type: "Point",
            coordinates: [location.lng, location.lat],
          },
        }));
      }
    } catch (error) {
      // Optionally show error
    }
  };

  // Address input change handler
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAddress(value);
    geocodeAddress(value);
  };

  const handlePlaceChanged = () => {
    if (autocomplete) {
      const place = autocomplete.getPlace();
      if (place.geometry?.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        setMapCenter({ lat, lng });
        setMarker({ lat, lng });
        setAddress(place.formatted_address || "");
        setFormData((prev) => ({
          ...prev,
          address: place.formatted_address || "",
          location: {
            type: "Point",
            coordinates: [lng, lat],
          },
        }));
      }
    }
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
          location: {
            latitude: marker.lat,
            longitude: marker.lng,
          },
          phone: formData.phone,
        },
        {
          headers: {
            Authorization: `${localStorage.getItem("authToken")}`,
          },
        }
      );
      console.log("✅ Profile updated:", res.data);

      setIsEditing(false);

      // Show toast notification
      toast.success("Profile updated successfully!");

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
      toast.error("Failed to update profile");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (profile) {
      setFormData({
        name: profile.name || "",
        email: profile.email || "",
        applicant: profile.applicant || "",
        location: profile.location || { type: "Point", coordinates: [0, 0] },
        phone: profile.phone || "",
        image: profile.image || "",
        country_code: profile.country_code || "",
        address: profile.address || "",
        province: profile.province || "",
        city: profile.city || "",
        postal_code: profile.postal_code || "",
      });
      setAddress(profile.address || "");
      if (profile.location && profile.location.coordinates) {
        setMapCenter({
          lat: profile.location.coordinates[1],
          lng: profile.location.coordinates[0],
        });
        setMarker({
          lat: profile.location.coordinates[1],
          lng: profile.location.coordinates[0],
        });
      }
    }
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
                onClick={handleCancelEdit}
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
           

           <div className="relative">

              <div className="flex items-center rounded-full px-4 py-3 border border-gray-600">
                <PhoneInput
                  country={"us"}
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  containerClass="flex-1"
                  inputClass="!w-full !bg-transparent !border-none !outline-none !text-sm !text-gray-900 !placeholder-gray-500 h-5"
                  buttonClass={`!bg-transparent !border-none ${!isEditing ? "cursor-not-allowed" : ""}`}
                  inputProps={{
                    readOnly: !isEditing,
                    disabled: !isEditing,
                    style: { height: "25px" }
                  }}
                  enableSearch
                />
              </div>
            </div>

            {/* Location Address Field */}
            <div className="relative">
              <div className="flex items-center rounded-full px-4 py-3 border border-gray-600">
                <LocationIcon />
                {isLoaded ? (
                  <Autocomplete
                    onLoad={setAutocomplete}
                    onPlaceChanged={handlePlaceChanged}
                  >
                    <input
                      type="text"
                      name="address"
                      value={address}
                      onChange={handleAddressChange}
                      placeholder="Enter Location Address"
                      readOnly={!isEditing}
                      className={`flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-500 outline-none ${
                        !isEditing ? "cursor-not-allowed" : ""
                      }`}
                    />
                  </Autocomplete>
                ) : (
                  <input
                    type="text"
                    name="address"
                    value={address}
                    onChange={handleAddressChange}
                    placeholder="Loading Google Maps..."
                    readOnly
                    className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-500 outline-none cursor-not-allowed"
                  />
                )}
              </div>
            </div>

            {/* Map */}
            <div className="w-full h-[136px] rounded-lg overflow-hidden border border-gray-600 mt-2">
              {isLoaded && (
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={mapCenter}
                  zoom={15}
                  onClick={isEditing ? (e) => {
                    const lat = e.latLng?.lat();
                    const lng = e.latLng?.lng();
                    if (lat && lng) {
                      setMarker({ lat, lng });
                      setMapCenter({ lat, lng });
                      setFormData((prev) => ({
                        ...prev,
                        location: {
                          type: "Point",
                          coordinates: [lng, lat],
                        },
                      }));
                    }
                  } : undefined}
                  options={{
                    disableDefaultUI: true,
                    clickableIcons: false,
                  }}
                >
                  <Marker position={marker} />
                </GoogleMap>
              )}
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