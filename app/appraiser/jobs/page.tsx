'use client'

import { Toaster } from "sonner";
import DashboardLayout from "@/components/dashboard-layout";
import AppraiserJobsContent from "./AppraiserJobsContent";

interface JobsPageProps {
  searchQuery?: string;
}

export default function AppraiserJobsPage({ searchQuery = "" }: JobsPageProps) {
  return (
    <DashboardLayout role="appraiser">
      
      <AppraiserJobsContent searchQuery={searchQuery} />
    </DashboardLayout>
  );
}
