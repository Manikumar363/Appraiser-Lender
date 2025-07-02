'use client';
import { useState,useEffect } from "react";
import DashboardLayout from "../../../components/dashboard-layout"

interface Section {
  title: string;
  content: string;
  list?: string[];
}
export default function LenderTermsPage() {
  const [sections, setSections] = useState<Section[]>([]);

  useEffect(() => {
    // Simulating API fetch
    const fetchData = async () => {
      const dataFromApi: Section[] = [
        {
          title: '1. Terms',
          content:
            'Tellus at sit ante rutrum suspendisse pretium, vitae vel dignissim. Nunc, scelerisque adipiscing condimentum...',
        },
        {
          title: '2. Use License',
          content:
            'Fermentum erat nisl duis varius risus. Augue ac facilisi porta metus enim. Ullamcorper lacus praesent rhoncus...',
          list: [
            'Fermentum erat nisl duis varius risus.',
            'Augue ac facilisi porta metus enim.',
            'Ullamcorper lacus praesent rhoncus...',
          ],
        },
      ];

      setSections(dataFromApi);
    };

    fetchData();
  }, []);
  return (
    <DashboardLayout>

       <div className="px-6 py-10 text-gray-800 max-w-4xl ml-8 space-y-8">
      <div>
        <h2 className="text-yellow-400 text-sm font-semibold uppercase tracking-widest">
          Agreement
        </h2>
        <h1 className="text-3xl font-bold text-blue-700 mt-1">
          Terms &amp; Condition
        </h1>
      </div>

      {sections.map((section, idx) => (
        <section key={idx} className="space-y-4">
          <h3 className="text-xl font-bold text-gray-800">{section.title}</h3>
          <p className="text-gray-600 leading-relaxed">{section.content}</p>
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
    </DashboardLayout>
  )
}
