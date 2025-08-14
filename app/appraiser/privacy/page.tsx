"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "../../../components/dashboard-layout";
import { contentApi } from "@/lib/api/contentApi";

interface Section {
  title: string;
  content: string;
  list?: string[];
}

export default function PrivacyPolicyPage() {
  const [contentHtml, setContentHtml] = useState<string>("");

  useEffect(() => {
    // Simulate API call (replace with actual fetch in real usage)
    const fetchData = async () => {
      try {
        const res = await contentApi.getPrivacyPolicyLender();
        const policy = res.content.find(
          (item: any) => item.type === "PRIVACY_POLICY_LENDER"
        );
        // Wrap plain text in <p> if not HTML
        if (policy?.content?.trim().startsWith("<")) {
          setContentHtml(policy.content);
        } else {
          setContentHtml(
            `<p>${policy?.content || "No privacy policy found."}</p>`
          );
        }
      } catch (err) {
        setContentHtml("<p>Failed to load privacy policy.</p>");
      }
    };

    fetchData();
  }, []);

  return (
    <DashboardLayout role="appraiser">
      <div className="px-2 py-4 text-gray-800 max-w-4xl ml-8 space-y-4">
        {/* Header */}
        <div>
          <h2 className="text-yellow-400 text-sm font-semibold uppercase tracking-widest">
            01-SEPT-2023
          </h2>
          <h1 className="text-3xl font-bold text-[#2A020D] mt-1">
            Privacy Policy
          </h1>
        </div>

        {/* Sections */}

        <section className="prose max-w-none">
          <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
        </section>
      </div>
    </DashboardLayout>
  );
}
