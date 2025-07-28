"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { DeleteIcon, ResetIcon, ArrowIcon } from "../../../components/icons";
import DashboardLayout from "../../../components/dashboard-layout";
import { authApi } from "@/lib/api/auth";
import { useRouter } from "next/navigation";

export default function AppraiserSettingsPage() {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    toast("Are you sure you want to delete your account?", {
      description: "This action cannot be undone!",
      action: {
        label: "Delete Account",
        onClick: async () => {
          await performDeleteAccount();
        },
      },
      cancel: {
        label: "Cancel",
        onClick: () => {
          toast.dismiss();
        },
      },
      duration: Infinity,
    });
  };

  const performDeleteAccount = async () => {
    if (isDeleting) return;

    setIsDeleting(true);
    const loadingToast = toast.loading("Deleting your account...");

    try {
      const res = await authApi.deleteAccount();
      
      if (res.data?.success) {
        toast.dismiss(loadingToast);
        toast.success("Account deleted successfully.");
        
        localStorage.removeItem("authToken");
        router.push("/appraiser/auth/signin");
      } else {
        toast.dismiss(loadingToast);
        toast.error(res.data?.message || "Failed to delete account.");
      }
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error("Error deleting account.");
    } finally {
      setIsDeleting(false);
    }
  };

  const topNavigationItems = [
    { icon: ResetIcon, label: "Reset Password", href: "/appraiser/settings/reset" },
  ];

  return (
    <DashboardLayout role="appraiser">
      <div className="px-4">
        {topNavigationItems.map((item, index) => (
          <Link
            key={index}
            href={item.href}
            className="flex items-center justify-between py-5 hover:bg-gray-100 transition px-2"
          >
            <div className="flex items-center gap-4">
              <item.icon className="w-10 h-10" />
              <span className="text-gray-800 font-medium">{item.label}</span>
            </div>
            <ArrowIcon />
          </Link>
        ))}

        {/* Straight divider line */}
        <div className="border-t border-gray-300"></div>

        {/* Delete account button */}
        <button
          onClick={handleDeleteAccount}
          disabled={isDeleting}
          className="flex items-center justify-between py-5 text-gray-800 font-medium hover:bg-gray-100 w-full px-2 disabled:opacity-50"
        >
          <div className="flex items-center gap-4">
            <DeleteIcon className="w-10 h-10" />
            <span>Delete Account</span>
          </div>
          <ArrowIcon />
        </button>
      </div>
    </DashboardLayout>
  );
}