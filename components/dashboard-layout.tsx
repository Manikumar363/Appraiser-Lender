"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"

// ✅ Your icon imports here
import { Notification, ChatAlertIcon, AddIcon, SearchIcon } from "./icons"


import {
  HomeIcon,
  JobsIcon,
  ProfileIcon,
  SettingsIcon,
  PrivacyIcon,
  TermsIcon,
  HelpIcon,
  LogoutIcon,
} from "./icons" 

interface DashboardLayoutProps {
  children: React.ReactNode
  role: "lender" | "appraiser"
}

// ✅ Define role-based nav items
const lenderTopNav = [
  { icon: HomeIcon, label: "Home", href: "/lender/dashboard" },
  { icon: JobsIcon, label: "Jobs", href: "/lender/jobs" },
  { icon: ProfileIcon, label: "Profile", href: "/lender/profile" },
]

const appraiserTopNav = [
  { icon: HomeIcon, label: "Home", href: "/appraiser/dashboard" },
  { icon: JobsIcon, label: "Jobs", href: "/appraiser/jobs" },
  { icon: ProfileIcon, label: "Profile", href: "/appraiser/profile" },
]

const lenderBottomNav = [
  { icon: SettingsIcon, label: "Settings", href: "/lender/settings" },
  { icon: PrivacyIcon, label: "Privacy Policy", href: "/lender/privacy" },
  { icon: TermsIcon, label: "Terms & Condition", href: "/lender/terms" },
  { icon: HelpIcon, label: "Help & Support", href: "/lender/support" },
]

const appraiserBottomNav = [
  { icon: SettingsIcon, label: "Settings", href: "/appraiser/settings" },
  { icon: PrivacyIcon, label: "Privacy Policy", href: "/appraiser/privacy" },
  { icon: TermsIcon, label: "Terms & Condition", href: "/appraiser/terms" },
  { icon: HelpIcon, label: "Help & Support", href: "/appraiser/support" },
]

const DashboardLayout = ({ children, role }: DashboardLayoutProps) => {
  const [searchQuery, setSearchQuery] = useState("")
  const pathname = usePathname()
  const router = useRouter()

  const topNavigationItems = role === "lender" ? lenderTopNav : appraiserTopNav
  const bottomNavigationItems = role === "lender" ? lenderBottomNav : appraiserBottomNav

  const shouldShowButton =
    role === "lender" &&
    (pathname === `/${role}/dashboard` || pathname.startsWith(`/${role}/jobs`))

  const handleLogout = () => {
    console.log(`Logging out ${role}...`)
    router.push(`/${role}/auth/signin`)
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-[#1e5ba8] text-white flex flex-col">
        {/* Logo */}
        <div className="p-6 flex items-center justify-between">
          <img
            src="/images/emadi-logo-white.png"
            alt="EMADI Appraisers"
            className="h-14 w-auto brightness-110 contrast-125"
          />
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

        <div className="flex-1"></div>

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

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-[#1e5ba8] text-white px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Search */}
            <div className="flex-1 max-w-md relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 outline-none ring-0" />
              <input
                type="text"
                placeholder="Search anything..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
              />
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-3">
              <div>
                {shouldShowButton && (
                  <button className="hover:bg-white/10">
                    <AddIcon />
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                  </button>
                )}
              </div>
              <button className="hover:bg-white/10">
                <Notification />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
              <button
                className="hover:bg-white/10"
                onClick={() => router.push(`/${role}/chats`)}
              >
                <ChatAlertIcon />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
              <div className="w-10 h-10 rounded-lg overflow-hidden">
                <img
                  src="/images/profile-avatar.png"
                  alt="User Profile"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}

export default DashboardLayout
