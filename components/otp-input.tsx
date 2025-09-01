"use client";

import { useEffect, useRef } from "react";

interface OTPInputProps {
  length: number;
  onComplete: (otp: string) => void;
  value: string;
  onChange: (otp: string) => void;
  autoFocus?: boolean;
}

export function OTPInput({ length, onComplete, value, onChange, autoFocus = true }: OTPInputProps) {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (autoFocus) inputRefs.current[0]?.focus();
  }, [autoFocus]);

  const handleChange = (index: number, digit: string) => {
    if (!/^\d*$/.test(digit)) return;
    const newOTP = value.split("");
    newOTP[index] = digit;
    const newValue = newOTP.join("");
    onChange(newValue);
    if (digit && index < length - 1) inputRefs.current[index + 1]?.focus();
    if (newValue.length === length) onComplete(newValue);
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !value[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!pasted) return;
    const padded = pasted.padEnd(length, "");
    onChange(padded);
    if (padded.length === length) onComplete(padded);
    // focus next empty
    const firstEmpty = padded.split("").findIndex(c => !c);
    if (firstEmpty >= 0) inputRefs.current[firstEmpty]?.focus();
  };

  return (
    <div
      className="
        flex justify-center
        gap-2 xs:gap-3 sm:gap-4
        flex-wrap
        mb-8
        max-w-full
      "
      aria-label="OTP input"
    >
      {Array.from({ length }, (_, index) => (
        <input
          key={index}
          ref={el => { inputRefs.current[index] = el; }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={value[index] || ""}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          className="
            w-12 h-12
            xs:w-14 xs:h-14
            sm:w-16 sm:h-16
            md:w-18 md:h-18
            text-lg xs:text-xl sm:text-2xl
            font-semibold text-center
            bg-white border-2 border-gray-300
            rounded-full
            focus:outline-none focus:border-[#2A020D]
            text-gray-700 transition-all
          "
        />
      ))}
    </div>
  );
}
