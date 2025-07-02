'use client';

import Link from 'next/link';
import { DeleteIcon, ResetIcon,ArrowIcon } from "../../../components/icons";
import DashboardLayout from "../../../components/dashboard-layout";

const topNavigationItems = [
  { icon: ResetIcon, label: "Reset Password", href: "/lender/settings/reset", active:true },
  { icon: DeleteIcon, label: "Delete Account", href: "/lender/settings" }
];

export default function LenderSettingsPage() {
  return (
    <DashboardLayout>
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
      </div>
    </DashboardLayout>
  );
}
