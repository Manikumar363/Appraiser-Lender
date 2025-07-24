'use client';

import Link from 'next/link';
import { DeleteIcon, ResetIcon,ArrowIcon } from "../../../components/icons";
import DashboardLayout from "../../../components/dashboard-layout";
import { userAuth } from '../../../lib/api/userAuth';
import { useRouter } from 'next/navigation';
import { useState } from 'react';


export default function LenderSettingsPage() {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDeleteAccount = async () => {
    try {
      const res = await userAuth.deleteAccount();
      if(res.data?.success) {
        alert("Account deleted successfully.");
        localStorage.removeItem("authToken");
        router.push('/lender/auth/signin');
      } else {
        alert(res.data?.message || "Failed to delete account.");
      }
    } catch (err) {
      console.error("Failed to delete account:", err);
      alert("Failed to delete account. Please try again later.");
    }
  }



const topNavigationItems = [
  { icon: ResetIcon, label: "Reset Password", href: "/lender/settings/reset", active:true },
];


  return (
    <DashboardLayout role='lender'>
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
            <ArrowIcon/>
          </Link>
        ))}
        <button
          onClick={() => setShowConfirm(true)}
          className="flex items-center justify-between gap-4 py-5 font-medium hover:bg-gray-100 w-full rounded-lg px-2 mt-4"
        >
          <span className="flex items-center gap-4 text-red-500">
           <DeleteIcon className='w-10 h-10' />
             Delete Account
          </span>
          <ArrowIcon />
        </button>
      </div>

      {showConfirm && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
    <div className="bg-white rounded-xl p-8 shadow-lg max-w-sm w-full">
      <h2 className="text-lg font-bold mb-4 text-gray-900">Delete Account</h2>
      <p className="mb-6 text-gray-700">Are you sure you want to delete your account? This action cannot be undone!</p>
      <div className="flex justify-end gap-3">
        <button
          className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
          onClick={() => setShowConfirm(false)}
        >
          Cancel
        </button>
        <button
          className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
          onClick={async () => {
            setShowConfirm(false);
            await handleDeleteAccount();
          }}
        >
          Delete
        </button>
      </div>
    </div>
  </div>
)}
    </DashboardLayout>
  );
}
