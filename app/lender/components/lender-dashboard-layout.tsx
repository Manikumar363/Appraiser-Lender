"use client"

import type React from "react"

import { useState } from "react"
import { Search} from "lucide-react"
import Link from "next/link"
import { useRouter,usePathname } from "next/navigation"
import { Notification, ChatAlertIcon, AddIcon, SearchIcon } from "./icons"

interface LenderDashboardLayoutProps {
  children: React.ReactNode
}

// Custom SVG Icons
const HomeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip0_27_5768)">
      <path
        d="M8 16L10 10L16 8L14 14L8 16Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3 12C3 13.1819 3.23279 14.3522 3.68508 15.4442C4.13738 16.5361 4.80031 17.5282 5.63604 18.364C6.47177 19.1997 7.46392 19.8626 8.55585 20.3149C9.64778 20.7672 10.8181 21 12 21C13.1819 21 14.3522 20.7672 15.4442 20.3149C16.5361 19.8626 17.5282 19.1997 18.364 18.364C19.1997 17.5282 19.8626 16.5361 20.3149 15.4442C20.7672 14.3522 21 13.1819 21 12C21 10.8181 20.7672 9.64778 20.3149 8.55585C19.8626 7.46392 19.1997 6.47177 18.364 5.63604C17.5282 4.80031 16.5361 4.13738 15.4442 3.68508C14.3522 3.23279 13.1819 3 12 3C10.8181 3 9.64778 3.23279 8.55585 3.68508C7.46392 4.13738 6.47177 4.80031 5.63604 5.63604C4.80031 6.47177 4.13738 7.46392 3.68508 8.55585C3.23279 9.64778 3 10.8181 3 12Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
    <defs>
      <clipPath id="clip0_27_5768">
        <rect width="24" height="24" fill="white" />
      </clipPath>
    </defs>
  </svg>
)

const JobsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M10 2C9.20435 2 8.44129 2.31607 7.87868 2.87868C7.31607 3.44129 7 4.20435 7 5V6H5C4.20435 6 3.44129 6.31607 2.87868 6.87868C2.31607 7.44129 2 8.20435 2 9V11.382L3.447 12.105L3.452 12.108L3.479 12.121L3.599 12.177C3.70767 12.2283 3.86967 12.299 4.085 12.389C4.514 12.566 5.141 12.805 5.919 13.044C7.481 13.524 9.63 14 12 14C14.372 14 16.52 13.525 18.08 13.044C18.86 12.804 19.486 12.566 19.915 12.389C20.1191 12.3045 20.3211 12.2151 20.521 12.121L20.548 12.108L20.553 12.106L22 11.381V9C22 8.20435 21.6839 7.44129 21.1213 6.87868C20.5587 6.31607 19.7956 6 19 6H17V5C17 4.20435 16.6839 3.44129 16.1213 2.87868C15.5587 2.31607 14.7956 2 14 2H10ZM15 6V5C15 4.73478 14.8946 4.48043 14.7071 4.29289C14.5196 4.10536 14.2652 4 14 4H10C9.73478 4 9.48043 4.10536 9.29289 4.29289C9.10536 4.48043 9 4.73478 9 5V6H15ZM21.447 13.894L22 13.618V19C22 19.7956 21.6839 20.5587 21.1213 21.1213C20.5587 21.6839 19.7956 22 19 22H5C4.20435 22 3.44129 21.6839 2.87868 21.1213C2.31607 20.5587 2 19.7956 2 19V13.618L2.553 13.894L2.555 13.896L2.559 13.898L2.572 13.904L2.613 13.924L2.764 13.994C2.894 14.054 3.082 14.138 3.321 14.236C3.799 14.434 4.484 14.696 5.331 14.956C7.019 15.476 9.37 16 12 16C14.628 16 16.98 15.475 18.67 14.956C19.3508 14.7472 20.0215 14.507 20.68 14.236C20.9181 14.1377 21.1539 14.0337 21.387 13.924L21.428 13.904L21.441 13.898L21.445 13.896L21.447 13.894ZM12 10C11.7348 10 11.4804 10.1054 11.2929 10.2929C11.1054 10.4804 11 10.7348 11 11C11 11.2652 11.1054 11.5196 11.2929 11.7071C11.4804 11.8946 11.7348 12 12 12H12.01C12.2752 12 12.5296 11.8946 12.7171 11.7071C12.9046 11.5196 13.01 11.2652 13.01 11C13.01 10.7348 12.9046 10.4804 12.7171 10.2929C12.5296 10.1054 12.2752 10 12.01 10H12Z"
      fill="currentColor"
    />
  </svg>
)

const ProfileIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 12C10.9 12 9.95833 11.6083 9.175 10.825C8.39167 10.0417 8 9.1 8 8C8 6.9 8.39167 5.95833 9.175 5.175C9.95833 4.39167 10.9 4 12 4C13.1 4 14.0417 4.39167 14.825 5.175C15.6083 5.95833 16 6.9 16 8C16 9.1 15.6083 10.0417 14.825 10.825C14.0417 11.6083 13.1 12 12 12ZM4 20V17.2C4 16.6333 4.14583 16.1125 4.4375 15.6375C4.72917 15.1625 5.11667 14.8 5.6 14.55C6.63333 14.0333 7.68333 13.6458 8.75 13.3875C9.81667 13.1292 10.9 13 12 13C13.1 13 14.1833 13.1292 15.25 13.3875C16.3167 13.6458 17.3667 14.0333 18.4 14.55C18.8833 14.8 19.2708 15.1625 19.5625 15.6375C19.8542 16.1125 20 16.6333 20 17.2V20H4ZM6 18H18V17.2C18 17.0167 17.9542 16.85 17.8625 16.7C17.7708 16.55 17.65 16.4333 17.5 16.35C16.6 15.9 15.6917 15.5625 14.775 15.3375C13.8583 15.1125 12.9333 15 12 15C11.0667 15 10.1417 15.1125 9.225 15.3375C8.30833 15.5625 7.4 15.9 6.5 16.35C6.35 16.4333 6.22917 16.55 6.1375 16.7C6.04583 16.85 6 17.0167 6 17.2V18ZM12 10C12.55 10 13.0208 9.80417 13.4125 9.4125C13.8042 9.02083 14 8.55 14 8C14 7.45 13.8042 6.97917 13.4125 6.5875C13.0208 6.19583 12.55 6 12 6C11.45 6 10.9792 6.19583 10.5875 6.5875C10.1958 6.97917 10 7.45 10 8C10 8.55 10.1958 9.02083 10.5875 9.4125C10.9792 9.80417 11.45 10 12 10Z"
      fill="currentColor"
    />
  </svg>
)

const SettingsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 22" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M10 0L19.5 5.5V16.5L10 22L0.5 16.5V5.5L10 0ZM10 14C10.7956 14 11.5587 13.6839 12.1213 13.1213C12.6839 12.5587 13 11.7956 13 11C13 10.2044 12.6839 9.44129 12.1213 8.87868C11.5587 8.31607 10.7956 8 10 8C9.20435 8 8.44129 8.31607 7.87868 8.87868C7.31607 9.44129 7 10.2044 7 11C7 11.7956 7.31607 12.5587 7.87868 13.1213C8.44129 13.6839 9.20435 14 10 14Z"
      fill="currentColor"
    />
  </svg>
)

const PrivacyIcon = () => (
  <svg width="20" height="20" viewBox="0 0 21 23" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M17 11V4.749C17.0001 4.67006 16.9845 4.59189 16.9543 4.51896C16.9241 4.44603 16.8798 4.37978 16.824 4.324L13.676 1.176C13.5636 1.06345 13.4111 1.00014 13.252 1H1.6C1.44087 1 1.28826 1.06321 1.17574 1.17574C1.06321 1.28826 1 1.44087 1 1.6V20.4C1 20.5591 1.06321 20.7117 1.17574 20.8243C1.28826 20.9368 1.44087 21 1.6 21H10M5 9H13M5 5H9M5 13H8"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M13 1V4.4C13 4.55913 13.0632 4.71174 13.1757 4.82426C13.2883 4.93679 13.4409 5 13.6 5H17M16.992 14.125L19.548 14.774C19.814 14.842 20.001 15.084 19.993 15.358C19.821 21.116 16.5 22 16.5 22C16.5 22 13.179 21.116 13.007 15.358C13.0043 15.2247 13.0468 15.0944 13.1276 14.9883C13.2084 14.8823 13.3227 14.8067 13.452 14.774L16.008 14.125C16.331 14.043 16.669 14.043 16.992 14.125Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const TermsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M13.987 11.6252C14.024 11.6253 14.0601 11.6144 14.0909 11.594C14.1216 11.5735 14.1457 11.5445 14.16 11.5104C14.1743 11.4764 14.1783 11.4389 14.1714 11.4026C14.1644 11.3663 14.147 11.3329 14.1211 11.3065L10.4461 7.56961C10.42 7.54309 10.3866 7.52494 10.3501 7.51748C10.3136 7.51002 10.2758 7.51358 10.2413 7.5277C10.2069 7.54183 10.1775 7.56588 10.1567 7.5968C10.136 7.62772 10.125 7.66411 10.125 7.70133V11.0627C10.125 11.2119 10.1843 11.355 10.2898 11.4605C10.3952 11.566 10.5383 11.6252 10.6875 11.6252H13.987Z"
      fill="currentColor"
    />
    <path
      d="M9.23438 12.5159C9.04184 12.3259 8.88886 12.0997 8.78427 11.8503C8.67967 11.6009 8.62554 11.3332 8.625 11.0627V6.75023H5.25C4.45507 6.75258 3.69338 7.06941 3.13128 7.63151C2.56917 8.19361 2.25235 8.95531 2.25 9.75023V20.2502C2.25 21.0459 2.56607 21.8089 3.12868 22.3716C3.69129 22.9342 4.45435 23.2502 5.25 23.2502H12C12.7956 23.2502 13.5587 22.9342 14.1213 22.3716C14.6839 21.8089 15 21.0459 15 20.2502V13.1252H10.6875C10.417 13.1249 10.1493 13.0708 9.89985 12.9662C9.65041 12.8616 9.42421 12.7085 9.23438 12.5159ZM17.4375 5.62523H20.737C20.774 5.62526 20.8101 5.61439 20.8409 5.59396C20.8716 5.57353 20.8957 5.54447 20.91 5.51043C20.9243 5.47638 20.9283 5.43886 20.9214 5.40257C20.9144 5.36629 20.8969 5.33286 20.8711 5.30648L17.1961 1.56961C17.17 1.54309 17.1366 1.52494 17.1001 1.51748C17.0636 1.51002 17.0258 1.51357 16.9913 1.5277C16.9569 1.54183 16.9275 1.56588 16.9067 1.5968C16.886 1.62772 16.875 1.66411 16.875 1.70133V5.06273C16.875 5.21192 16.9343 5.35499 17.0398 5.46048C17.1452 5.56597 17.2883 5.62523 17.4375 5.62523Z"
      fill="currentColor"
    />
    <path
      d="M17.4375 7.125C16.8918 7.12083 16.3696 6.90219 15.9837 6.5163C15.5978 6.13041 15.3792 5.60822 15.375 5.0625V0.75H10.3125C9.56685 0.750868 8.85198 1.04746 8.32472 1.57472C7.79746 2.10198 7.50087 2.81685 7.5 3.5625V5.25H9.47437C9.72639 5.25098 9.97572 5.30176 10.208 5.39942C10.4404 5.49708 10.6511 5.63969 10.8281 5.81906L15.945 11.0222C16.302 11.3844 16.5014 11.873 16.4995 12.3816V18.75H18.9862C20.5102 18.75 21.7495 17.4881 21.7495 15.9375V7.125H17.4375Z"
      fill="currentColor"
    />
  </svg>
)

const HelpIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M19.23 15.2598L16.69 14.9698C16.3914 14.9347 16.0886 14.9678 15.8046 15.0665C15.5206 15.1652 15.2626 15.327 15.05 15.5398L13.21 17.3798C10.3714 15.9357 8.0641 13.6284 6.62004 10.7898L8.47004 8.93977C8.90004 8.50977 9.11004 7.90977 9.04004 7.29977L8.75004 4.77977C8.69356 4.29186 8.45951 3.84179 8.0925 3.51536C7.7255 3.18893 7.25121 3.00897 6.76004 3.00977H5.03004C3.90004 3.00977 2.96004 3.94977 3.03004 5.07977C3.56004 13.6198 10.39 20.4398 18.92 20.9698C20.05 21.0398 20.99 20.0998 20.99 18.9698V17.2398C21 16.2298 20.24 15.3798 19.23 15.2598Z"
      fill="currentColor"
    />
  </svg>
)

const LogoutIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M9 12L22 12M22 12L18.5 15M22 12L18.5 9"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M14.998 17C14.986 19.175 14.889 20.353 14.121 21.121C13.242 22 11.828 22 9.00005 22L8.00005 22C5.17105 22 3.75705 22 2.87805 21.121C2.00005 20.243 2.00005 18.828 2.00005 16L2.00005 8C2.00005 5.172 2.00005 3.757 2.87805 2.879C3.64705 2.11 4.82505 2.014 7.00005 2.002M14.998 7C14.986 4.825 14.889 3.647 14.121 2.879C13.48 2.237 12.553 2.064 11 2.017"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
)

const topNavigationItems = [
  { icon: HomeIcon, label: "Home", href: "/lender/dashboard", active: true },
  { icon: JobsIcon, label: "Jobs", href: "/lender/jobs" },
  { icon: ProfileIcon, label: "Profile", href: "/lender/profile" },
]

const bottomNavigationItems = [
  { icon: SettingsIcon, label: "Settings", href: "/lender/settings" },
  { icon: PrivacyIcon, label: "Privacy Policy", href: "/lender/privacy" },
  { icon: TermsIcon, label: "Terms & Condition", href: "/lender/terms" },
  { icon: HelpIcon, label: "Help & Support", href: "/lender/support" },
]

const LenderDashboardLayout = ({ children }: LenderDashboardLayoutProps) => {
  
  const [searchQuery, setSearchQuery] = useState("")
  const pathname = usePathname()
  const router= useRouter()
  
  const shouldShowButton =
    pathname === '/lender/dashboard' || pathname.startsWith('/lender/jobs');

  const handleLogout = () => {
    // Handle logout logic - clear tokens, etc.
    console.log("Logging out lender...")
    router.push("/lender/auth/signin")
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
                    item.active ? "bg-white/10 text-white" : "text-white/80 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <item.icon />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Spacer to push bottom items down */}
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
                 <button className=" hover:bg-white/10" >
                   <AddIcon/>
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                 </button>
                )}
              </div>
              <button className=" hover:bg-white/10">
                <Notification />

                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
              <button className=" hover:bg-white/10"
              onClick={()=>router.push("/lender/chats")}>
                <ChatAlertIcon />

                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
              <div className="w-10 h-10 rounded-lg overflow-hidden">
                <img src="/images/profile-avatar.png" alt="User Profile" className="w-full h-full object-cover" />
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

export default LenderDashboardLayout
