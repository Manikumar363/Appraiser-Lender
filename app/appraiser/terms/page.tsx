'use client';
import { useState,useEffect } from "react";
import DashboardLayout from "../../../components/dashboard-layout"
import { contentApi } from "@/lib/api/contentApi";
import { set } from "date-fns";

interface Section {
  title: string;
  content: string;
  list?: string[];
}
export default function AppraiserTermsPage() {
  const [contentHtml, setContentHtml] = useState<string>("");

  useEffect(() => {
    // Simulating API fetch
    const fetchData = async () => {
      try{
      const res = await contentApi.getAll();

      const terms = res.content.find(
        (item:any) => item.type === "TERMS_AND_CONDITOINS_LENDER"
      );
      setContentHtml(terms?.content || "<P>No terms found.</P>");
      }catch(err){
        setContentHtml("<p>Failed to load terms.</p>");
      }
      
    };
    fetchData();
  }, []);
  return (
    <DashboardLayout role="appraiser">

       <div className="px-6 py-10 text-gray-800 max-w-4xl ml-8 space-y-8">
      <div>
        <h2 className="text-yellow-400 text-sm font-semibold uppercase tracking-widest">
          Agreement
        </h2>
        <h1 className="text-3xl font-bold text-blue-700 mt-1">
          Terms &amp; Condition
        </h1>
      </div>

        <section className="prose max-w-none">
          <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
        </section>
    </div>
    </DashboardLayout>
  )
}
