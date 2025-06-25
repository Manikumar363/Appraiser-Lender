import type React from "react"

interface AuthLayoutProps {
  children: React.ReactNode
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Logo (40% width) */}
      <div className="hidden lg:flex lg:w-[40%] bg-[#1e5ba8] items-center justify-center p-8">
        <div className="flex items-center justify-center">
          <img src="/images/emadi-logo.png" alt="EMADI Appraisers" className="w-80 h-auto filter brightness-0 invert" />
        </div>
      </div>

      {/* Right side - Form (60% width) */}
      <div className="w-full lg:w-[60%] flex items-center justify-center p-12 bg-gray-50">
        <div className="w-full max-w-lg">{children}</div>
      </div>
    </div>
  )
}

export default AuthLayout
