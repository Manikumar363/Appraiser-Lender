"use client";
import type React from "react";

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left side */}
      <div className="hidden lg:flex lg:w-[40%] bg-[#2A020D] items-center justify-center p-8">
        <div className="flex items-center justify-center">
          <img
            src="/images/logolight.svg"
            alt="EMADI Appraisers"
            className="w-85 h-auto filter brightness-0 invert"
          />
        </div>
      </div>

      {/* Right side  */}
      <div className="flex-1 w-full overflow-y-auto flex flex-col">
        <div className="flex-1 min-h-screen flex justify-center items-center px-2 sm:px-2 lg:px-10 py-4">
          <div className="w-full flex flex-col">
  {children}
</div>

        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
