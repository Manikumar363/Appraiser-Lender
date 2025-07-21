"use client";
import { Suspense } from "react";
import { AppraiserVerifyEmailContent } from "./VerifyEmailContent";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AppraiserVerifyEmailContent />
    </Suspense>
  );
}
