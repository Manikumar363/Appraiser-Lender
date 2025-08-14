"use client";

import React, { Suspense } from "react";
import DashboardLayout from "../../../components/dashboard-layout";
import DashboardContent from "./DashboardContent";

export default function LenderDashboardPage(props: any) {
  // DashboardLayout will inject searchQuery as a prop
  return (
    <DashboardLayout role="lender">
      <Suspense fallback={<div>Loading...</div>}>
        <DashboardContent {...props} />
      </Suspense>
    </DashboardLayout>
  );
}