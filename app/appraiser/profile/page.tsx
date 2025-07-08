"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard-layout";
import { profileApi } from "@/lib/api/profile";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function AppraiserProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await profileApi.getProfile();
        console.log("✅ Profile data:", res);
        if (res.success) {
          setProfile(res.user);
        } else {
          console.error("❌ Failed to load profile");
        }
      } catch (error) {
        console.error("❌ Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (!profile) return <div className="p-10 text-center text-red-600">Profile failed to load.</div>;

  return (
    <DashboardLayout role="appraiser">
      <div className="p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 rounded-full overflow-hidden mb-4">
            <Image
              src={profile.image || "/images/profile-avatar.png"}
              alt="Profile Avatar"
              width={96}
              height={96}
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="text-2xl font-bold mb-2">{profile.name}</h1>
          <p className="text-gray-600 mb-1">{profile.email}</p>
          <p className="text-gray-600 mb-4">
            {profile.country_code} {profile.phone}
          </p>
          <button
            onClick={() => router.push("/appraiser/profile/edit")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-medium transition"
          >
            Edit Profile
          </button>
        </div>

        {/* Additional Details if needed */}
        <div className="max-w-xl mx-auto space-y-3">
          <div>
            <strong>Company:</strong> {profile.company_name || "-"}
          </div>
          <div>
            <strong>Designation:</strong> {profile.designation || "-"}
          </div>
          <div>
            <strong>Verified:</strong> {profile.is_verified ? "Yes" : "No"}
          </div>
          <div>
            <strong>Role:</strong> {profile.role}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
