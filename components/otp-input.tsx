"use client";

import { useEffect, useRef } from "react";

interface OTPInputProps {
  length: number;
  onComplete: (otp: string) => void;
  value: string;
  onChange: (otp: string) => void;
}

export function OTPInput({ length, onComplete, value, onChange }: OTPInputProps) {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  // Autofocus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, digit: string) => {
    if (!/^\d*$/.test(digit)) return;

    const newOTP = value.split("");
    newOTP[index] = digit;
    const newValue = newOTP.join("");

    onChange(newValue);

    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newValue.length === length) {
      onComplete(newValue);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, length);
    if (/^\d+$/.test(pastedData)) {
      const cleanPasted = pastedData.padEnd(length, "");
      onChange(cleanPasted);
      if (cleanPasted.length === length) {
        onComplete(cleanPasted);
      }
    }
  };

  return (
    <div className="flex gap-4 justify-center mb-8">
      {Array.from({ length }, (_, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={value[index] || ""}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          className="w-16 h-16 text-center text-2xl font-semibold bg-white border-2 border-gray-300 rounded-full focus:outline-none focus:border-[#1e5ba8] text-gray-700 transition-all"
        />
      ))}
    </div>
  );
}
