"use client";

import Link from "next/link";
import { DeleteIcon, ResetIcon, ArrowIcon } from "../../../components/icons";
import DashboardLayout from "../../../components/dashboard-layout";
import { authApi } from "@/lib/api/auth";
import { useRouter } from "next/navigation";

export default function AppraiserSettingsPage() {
  const router = useRouter();

  const handleDeleteAccount = async () => {
    if (confirm("Are you sure you want to delete your account? This action cannot be undone!")) {
      try {
        const res = await authApi.deleteAccount();
        if (res.data?.success) {
          alert("Account deleted successfully.");
          console.log("Account deleted successfully:", res.data);
          // Clear local storage and redirect to sign-in page
          localStorage.removeItem("authToken");
          router.push("/appraiser/auth/signin");
        } else {
          alert(res.data?.message || "Failed to delete account.");
        }
      } catch (err) {
        console.error("❌ Failed:", err);
        alert("Error deleting account.");
      }
    }
  };

  const topNavigationItems = [
    { icon: ResetIcon, label: "Reset Password", href: "/appraiser/settings/reset" },
  ];

  return (
    <DashboardLayout role="appraiser">
      <div className="divide-y divide-gray-300 px-4">
        {topNavigationItems.map((item, index) => (
          <Link
            key={index}
            href={item.href}
            className="flex items-center justify-between py-5 hover:bg-gray-100 transition rounded-lg px-2"
          >
            <div className="flex items-center gap-4">
              <item.icon className="w-10 h-10" />
              <span className="text-gray-800 font-medium">{item.label}</span>
            </div>
            <ArrowIcon />
          </Link>
        ))}

        {/* Delete account button */}
        <button
          onClick={handleDeleteAccount}
          className="flex items-center gap-4 py-5 text-red-600 font-medium hover:bg-gray-100 w-full rounded-lg px-2 mt-4"
        >
          <DeleteIcon className="w-10 h-10" />
          Delete Account
        </button>
      </div>
    </DashboardLayout>
  );
}
