'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '../../../components/dashboard-layout';
import { contentApi } from '@/lib/api/contentApi';

export default function PrivacyPolicyPage() {
  const [contentHtml, setContentHtml] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await contentApi.getPrivacyPolicyLender();
        const policy = res.content.find(
          (item: any) => item.type === 'PRIVACY_POLICY_LENDER'
        );
        if (policy?.content?.trim().startsWith('<')) {
          setContentHtml(policy.content);
        } else {
          setContentHtml(
            `<p>${policy?.content || 'No privacy policy found.'}</p>`
          );
        }
      } catch {
        setContentHtml('<p>Failed to load privacy policy.</p>');
      }
    };
    fetchData();
  }, []);

  return (
    <DashboardLayout role="lender">
      <div
        className="
          w-full
          max-w-4xl
          mx-auto md:ml-8 md:mr-0
          px-4 sm:px-6
          py-6 sm:py-8 md:py-10
          text-gray-800
          space-y-6 sm:space-y-8
        "
      >
        <header>
          <h2 className="text-[11px] xs:text-xs sm:text-sm font-semibold uppercase tracking-widest text-yellow-400">
            01-SEPT-2023
          </h2>
          <h1 className="mt-1 text-2xl sm:text-3xl md:text-3xl font-bold text-[#2A020D] leading-tight">
            Privacy Policy
          </h1>
        </header>

        <section
          className="
            prose max-w-none
            prose-p:leading-relaxed
            prose-ul:pl-5
            prose-li:marker:text-[#2A020D]
            prose-a:text-[#2A020D] prose-a:underline hover:prose-a:no-underline
            prose-headings:scroll-mt-24
            prose-h2:text-xl sm:prose-h2:text-2xl
            prose-h3:text-lg sm:prose-h3:text-xl
            text-sm sm:text-base
          "
        >
          <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
        </section>
      </div>
    </DashboardLayout>
  );
}
