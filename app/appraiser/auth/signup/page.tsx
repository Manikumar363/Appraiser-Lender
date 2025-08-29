"use client";

import React, { useState } from "react";
import AuthLayout from "@/components/auth-layout";
import { RoleSelector } from "@/components/role-selector";
import { useRouter } from "next/navigation";
import { Toaster } from 'react-hot-toast';
import SignUpForm from './signup-form';
import toast from 'react-hot-toast';

export default function AppraiserSignUpPage() {
  const [selectedRole, setSelectedRole] = useState<"appraiser" | "lender">("appraiser");
  const router = useRouter();

  const handleRoleChange = (role: "appraiser" | "lender") => {
    setSelectedRole(role);
    if (role === "lender") {
      toast.loading("Switching to Lender signup...");
      router.push("/lender/auth/signup");
    }
  };

  return (
    <AuthLayout>
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#ffffff',
            color: '#374151',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            fontSize: '14px',
            maxWidth: '450px',
            padding: '12px 16px',
          },
          success: {
            iconTheme: { primary: '#10b981', secondary: '#ffffff' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#ffffff' },
          },
        }}
      />

      <div className="flex flex-col justify-center min-h-screen w-full items-center px-4 sm:px-6">
        <div className="w-full">
          <div className="mb-4 mt-0">
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800">Sign Up as</h1>
          </div>

          <div className="mb-6">
            <RoleSelector selectedRole={selectedRole} onRoleChange={handleRoleChange} />
          </div>

          <div className="mb-5">
            <h2
              className="text-3xl sm:text-[42px] font-semibold text-gray-800 leading-[100%] mb-1"
              style={{
                fontFamily: 'Urbanist',
                fontWeight: 600,
                fontStyle: 'normal',
                letterSpacing: '0',
              }}
            >
              Create Your Appraiser Account
            </h2>
          </div>

          <SignUpForm />
        </div>
      </div>
    </AuthLayout>
  );
}
