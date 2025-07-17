'use client';

import Link from 'next/link';
import { DeleteIcon, ResetIcon,ArrowIcon } from "../../../components/icons";
import DashboardLayout from "../../../components/dashboard-layout";
import { userAuth } from '../../../lib/api/userAuth';
import { useRouter } from 'next/navigation';


export default function LenderSettingsPage() {
  const router = useRouter();

  const handleDeleteAccount = async () => {
    if(confirm("Are you sure you want to delete your account? This action cannot be undone!.")) {
      try{
        const res = await userAuth.deleteAccount();
        if(res.data?.success) {
          alert("Account deleted successfully.");
          console.log("Account deleted successfully.", res.data);
         // Optionally redirect to home or login page
         localStorage.removeItem("authToken");
          router.push('/lender/auth/signin');
        }else{
          alert(res.data?.message || "Failed to delete account.");
        }

      }catch (err){
        console.error("Failed to delete account:", err);
        alert("Failed to delete account. Please try again later.");
      }
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
          onClick={handleDeleteAccount}
          className="flex items-center justify-between gap-4 py-5 font-medium hover:bg-gray-100 w-full rounded-lg px-2 mt-4"
        >
          <span className="flex items-center gap-4">
           <DeleteIcon className='w-10 h-10' />
             Delete Account
          </span>
          <ArrowIcon />
        </button>
      </div>
    </DashboardLayout>
  );
}
