'use client';

import { useEffect, useState } from 'react';
import LenderDashboardLayout from '../../../components/lender-dashboard-layout';


interface Section {
  title: string;
  content: string;
  list?: string[];
}

export default function PrivacyPolicyPage() {
  const [sections, setSections] = useState<Section[]>([]);

  useEffect(() => {
    // Simulate API call (replace with actual fetch in real usage)
    const fetchData = async () => {
      const dataFromApi: Section[] = [
        {
          title: '1. Introduction',
          content:
            'Welcome to the emadi appraisers. We are committed to protecting your privacy and ensuring the security of your personal information.',
        },
        {
          title: '2. Information We Collect',
          content:
            'We may collect the following types of information about you:',
          list: [
            'Account Information: name, contact details, etc.',
          ],
        },
        {
          title: '3. How We Use Information',
          content: 'We use your data for purposes including:',
          list: [
            'To provide and maintain the Truck Log app.',
          
          ],
        },
        {
          title: '4. Data Sharing And Disclosure',
          content:
            'We do not share your personal information with third parties except in the following cases:',
          list: [
            'With your consent.',
          ],
        },
        {
          title: '5. Security',
          content:
            'We take data security seriously and use safeguards to protect your information from unauthorized access, alteration, or disclosure.',
        },
      ];

      setSections(dataFromApi);
    };

    fetchData();
  }, []);

  return (
    <LenderDashboardLayout>
    <div className="px-2 py-4 text-gray-800 max-w-4xl ml-8 space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-yellow-400 text-sm font-semibold uppercase tracking-widest">
          01-SEPT-2023
        </h2>
        <h1 className="text-3xl font-bold text-blue-700 mt-1">
          Privacy Policy
        </h1>
      </div>

      {/* Sections */}
      {sections.map((section, idx) => (
        <section key={idx} className="space-y-4">
          <h3 className="text-xl font-bold text-gray-800">{section.title}</h3>
          <p className="text-gray-600 leading-normal">{section.content}</p>
          {section.list && (
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              {section.list.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
    </LenderDashboardLayout>
  );
}
