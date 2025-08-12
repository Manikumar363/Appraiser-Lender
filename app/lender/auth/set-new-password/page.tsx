"use client";
import { Suspense } from "react";
import LenderSetNewPasswordContent  from "./SetNewPasswordContent";

export default function Page() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2A020D] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <LenderSetNewPasswordContent />
    </Suspense>
  );
}
