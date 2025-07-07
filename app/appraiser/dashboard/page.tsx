"use client";

import DashboardLayout from "@/components/dashboard-layout";
import AvailabilityToggle from "./AvailabilityToggle";
import { CheckCircle, XCircle, Building2 } from "lucide-react";
import { useState } from "react";

export default function AppraiserDashboardPage() {
  const [isAvailable, setIsAvailable] = useState(true);

  const jobsData = [
    {
      id: 1,
      title: "Residential Appraisal",
      location: "Ontario, Canada",
      timeLeft: "15 Min Left",
    },
    {
      id: 2,
      title: "Residential Appraisal",
      location: "Toronto, Canada",
      timeLeft: "15 Min Left",
    },
    {
      id: 3,
      title: "Residential Appraisal",
      location: "Toronto, Canada",
      timeLeft: "15 Min Left",
    },
    {
      id: 4,
      title: "Residential Appraisal",
      location: "Brampton, Canada",
      timeLeft: "15 Min Left",
    },
  ];

  return (
    <DashboardLayout role="appraiser">
      <div className="space-y-6">
        {/* ✅ Availability Toggle */}
        <AvailabilityToggle
          isAvailable={isAvailable}
          onToggle={() => setIsAvailable(!isAvailable)}
        />

        {/* ✅ Job Cards with Building Icon */}
        <div className="space-y-4">
          {jobsData.map((job) => (
            <div
              key={job.id}
              className="flex items-center justify-between bg-[#e8fafa] p-4 rounded-xl shadow-sm"
            >
              <div>
                <div className="flex items-center gap-2">
                  <Building2 className="text-[#054c99]" size={20} />
                  <h3 className="text-lg font-semibold text-gray-800">
                    {job.title}
                  </h3>
                </div>
                <p className="text-sm text-gray-600">{job.location}</p>
                <span className="inline-flex items-center gap-1 text-xs text-white bg-orange-500 px-2 py-1 rounded-full mt-2">
                  ⏰ {job.timeLeft}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button className="w-10 h-10 flex items-center justify-center rounded-full bg-[#054c99] hover:bg-[#043a77] transition">
                  <CheckCircle className="text-white" size={20} />
                </button>
                <button className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-400 hover:bg-gray-100 transition">
                  <XCircle className="text-gray-600" size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
