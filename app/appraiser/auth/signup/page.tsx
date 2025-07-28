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

      <div className="mt-10 mb-6 space-y-4">
        <h1 className="text-3xl font-semibold text-gray-800">Sign Up as</h1>
        <RoleSelector selectedRole={selectedRole} onRoleChange={handleRoleChange} />
      </div>

      <h2
        className="mb-3 w-full max-w-[713px] mx-auto"
        style={{
          fontFamily: 'Urbanist',
          fontWeight: 600,
          fontStyle: 'normal',
          fontSize: '42px',
          lineHeight: '100%',
          letterSpacing: '0',
        }}
      >
        Create Your Appraiser Account
      </h2>

      <SignUpForm />
    </AuthLayout>
  );
}
