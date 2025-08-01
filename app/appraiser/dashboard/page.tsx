'use client'

import DashboardLayout from "@/components/dashboard-layout";
import DashboardContent from "./Dashboard";

interface AppraiserDashboardPageProps {
  searchQuery?: string;
}

export default function AppraiserDashboardPage({ searchQuery = "" }: AppraiserDashboardPageProps) {
  return (
    <DashboardLayout role="appraiser">
      <DashboardContent searchQuery={searchQuery} />
    </DashboardLayout>
  );
}
