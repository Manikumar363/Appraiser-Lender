"use client";

import React from "react";
import { Mail, Lock, User, Phone, Building } from "lucide-react";

export interface AuthInputProps {
  type: "email" | "password" | "text" | "tel" | "company";
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  icon?: "email" | "password" | "user" | "phone" | "company";
  name?: string;            // Optional: Add props as needed (like name, autoComplete)
  autoFocus?: boolean;
  autoComplete?: string;
}

export const AuthInput = React.forwardRef<HTMLInputElement, AuthInputProps>(
  (
    {
      type,
      placeholder,
      value,
      onChange,
      icon,
      name,
      autoFocus,
      autoComplete,
    },
    ref
  ) => {
    const IconComponent = {
      email: Mail,
      password: Lock,
      user: User,
      phone: Phone,
      company: Building,
    }[icon || "email"];

    return (
      <div className="relative mb-6">
        <div className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-800">
          <IconComponent size={20} />
        </div>
        <input
          ref={ref}
          type={type}
          name={name}
          autoFocus={autoFocus}
          autoComplete={autoComplete}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-14 pr-6 h-14 py-4 bg-white border border-neutral-600 rounded-full text-gray-700 placeholder-gray-700 focus:outline-none focus:border-[#1e5ba8] focus:ring-0 transition-all text-base shadow-sm"
        />
      </div>
    );
  }
);

// For display name in DevTools
AuthInput.displayName = "AuthInput";
