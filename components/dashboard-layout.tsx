"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

import {
  Notification,
  ChatAlertIcon,
  AddIcon,
  SearchIcon,
  HomeIcon,
  JobsIcon,
  ProfileIcon,
  SettingsIcon,
  PrivacyIcon,
  TermsIcon,
  LogoutIcon,
  TransctionIcon,
} from "./icons";
import { Label } from "recharts";

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: "lender" | "appraiser";
}

// ✅ Define role-based nav items
const lenderTopNav = [
  { icon: HomeIcon, label: "Home", href: "/lender/dashboard" },
  { icon: JobsIcon, label: "Jobs", href: "/lender/jobs" },
  { icon: TransctionIcon, label: "Transaction", href: "/lender/transaction" },
  { icon: ProfileIcon, label: "Profile", href: "/lender/profile" },
];

const appraiserTopNav = [
  { icon: HomeIcon, label: "Home", href: "/appraiser/dashboard" },
  { icon: JobsIcon, label: "Jobs", href: "/appraiser/jobs" },
  { icon: ProfileIcon, label: "Profile", href: "/appraiser/profile" },
];

const lenderBottomNav = [
  { icon: SettingsIcon, label: "Settings", href: "/lender/settings" },
  { icon: PrivacyIcon, label: "Privacy Policy", href: "/lender/privacy" },
  { icon: TermsIcon, label: "Terms & Condition", href: "/lender/terms" },
];

const appraiserBottomNav = [
  { icon: SettingsIcon, label: "Settings", href: "/appraiser/settings" },
  { icon: PrivacyIcon, label: "Privacy Policy", href: "/appraiser/privacy" },
  { icon: TermsIcon, label: "Terms & Condition", href: "/appraiser/terms" },
];

const DashboardLayout = ({ children, role }: DashboardLayoutProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // New state for mobile sidebar toggle
  const pathname = usePathname();
  const router = useRouter();

  const topNavigationItems = role === "lender" ? lenderTopNav : appraiserTopNav;
  const bottomNavigationItems = role === "lender" ? lenderBottomNav : appraiserBottomNav;

  const shouldShowButton =
    role === "lender" &&
    (pathname === `/${role}/dashboard` || pathname.startsWith(`/${role}/jobs`));

  const handleLogout = () => {
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem("authToken");
        localStorage.removeItem("userData");
        localStorage.removeItem("userRole");
        sessionStorage.clear();
      }
      console.log(`Logging out ${role}...`);
      router.push(`/${role}/auth/signin`);
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // Prevent body scrolling when sidebar is open on mobile
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isSidebarOpen]);

  const searchEnabledRoutes = [
    "/lender/dashboard",
    "/lender/jobs",
    "/lender/transaction",
    "/appraiser/dashboard",
    "/appraiser/jobs",
    "/appraiser/settings/property",
  ];

  return (
    <div className="min-h-screen flex bg-[#FFFFFF]">
      {/* Sidebar - Fixed on all screens, hidden off-screen on mobile */}
      <div
        className={`w-64 bg-[#2A020D] text-white flex flex-col fixed top-0 left-0 h-screen z-20 transition-transform duration-300 ease-in-out overflow-y-auto ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Logo */}
        <div className="p-0 flex items-start justify-start">
          <Link href={role === "lender" ? "/lender/dashboard" : "/appraiser/dashboard"}>
            <img
              src="/images/logolight.svg"
              alt="EMADI Appraisers"
              className="w-32 h-auto p-0 m-0 ml-10 brightness-140 contrast-125"
            />
          </Link>
        </div>

        {/* Top Navigation */}
        <nav className="px-4">
          <ul className="space-y-2">
            {topNavigationItems.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    pathname === item.href
                      ? "bg-white/10 text-white"
                      : "text-white/80 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <item.icon />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Spacer - Full flex-1 on desktop, removed on mobile for compactness */}
        <div className="flex-1 hidden md:block"></div>

        {/* Bottom Navigation */}
        <nav className="px-4 pb-4">
          <ul className="space-y-2">
            {bottomNavigationItems.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-white/80 hover:bg-white/5 hover:text-white"
                >
                  <item.icon />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-white/80 hover:bg-white/5 hover:text-white rounded-lg transition-colors mt-2"
          >
            <LogoutIcon />
            <span className="font-medium">Logout</span>
          </button>
        </nav>
      </div>

      {/* Mobile overlay when sidebar is open */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-10 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Main - Offset for fixed sidebar on desktop */}
      <div className="flex-1 flex flex-col min-h-screen ml-0 md:ml-64">
        {/* Header - Add hamburger for mobile */}
        <header className="bg-[#2A020D] text-white px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          {/* Hamburger button (mobile only) */}
          <button
            className="md:hidden mr-4 text-white"
            onClick={toggleSidebar}
            aria-label="Toggle menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Search */}
          <div className="flex-1 max-w-md relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/80" />
            <input
              type="text"
              placeholder="Search anything..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-transparent rounded-full text-white placeholder-white/80 focus:outline-none focus:ring-0 border-none shadow-none"
              style={{
                border: "none",
                background: "transparent",
                boxShadow: "none",
              }}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {shouldShowButton && (
              <button
                className="p-0 hover:bg-white/10 rounded"
                onClick={() => router.push(`/${role}/dashboard/new`)}
              >
                <AddIcon />
              </button>
            )}
            <button
              className="p-0 hover:bg-white/10 rounded"
              onClick={() => router.push(`/${role}/chats`)}
            >
              <ChatAlertIcon />
            </button>
            <button
              className="w-10 h-10 rounded-lg overflow-hidden hover:ring-2 hover:ring-white/30"
              onClick={() => router.push(`/${role}/profile`)}
            >
              <img
                src="/images/profile-avatar.png"
                alt="User Profile"
                className="w-full h-full object-cover"
              />
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            {React.isValidElement(children) && searchEnabledRoutes.includes(pathname)
              ? React.cloneElement(children as React.ReactElement<any>, { key: searchQuery, searchQuery })
              : children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
