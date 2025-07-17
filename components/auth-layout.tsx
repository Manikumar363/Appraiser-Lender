'import client'
import type React from "react"


interface AuthLayoutProps {
  children: React.ReactNode
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen flex overflow-hidden">
      {/* Left side - Logo (40% width) */}
      <div className="hidden lg:flex lg:w-[40%] bg-[#014F9D] items-center justify-center p-8">
        <div className="flex items-center justify-center">
          <img src="/images/emadi-logo.png" alt="EMADI Appraisers" className="w-80 h-auto filter brightness-0 invert" />
        </div>
      </div>

      {/* Right side - Form (60% width) */}
      <div className="w-full lg:w-[60%] bg-[#FFFFFF] overflow-y-auto">
        <div className="min-h-screen flex justify-start items-start px-6 lg:px-12 py-12">
         <div className="w-full max-w-[713px] flex flex-col gap-6 px-6">
          {children}
         </div>
        </div>
      </div>
    </div>
  )
}

export default AuthLayout
