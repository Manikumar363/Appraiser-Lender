"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard-layout";
import { Toaster } from "react-hot-toast";
import { propertyApi } from "../../lib/property";
import { BuildingIcon } from "@/components/icons";
import ProposalForm from "./ProposalForm";
import QuotationsList from "./QuotationsList";
import toast from "react-hot-toast";

interface Property {
  id: string;
  property_type: string;
  min_price: string;
  max_price: string;
  created_at: string;
  updated_at: string;
  status: string;
}

interface Quotation {
  id: string;
  property_type: {
    property_type: string;
  };
  cost: string;
  cost_of_appraiser: string;
  appraiser: {
    name: string;
  };
  approved: boolean;
  created_at: string;
}

type FilterKey = "proposal" | "all" | "pending" | "accepted";

const FILTERS: { name: string; key: FilterKey }[] = [
  { name: "Proposal", key: "proposal" },
  { name: "All Requests", key: "all" },
  { name: "Pending", key: "pending" },
  { name: "Accepted", key: "accepted" },
];

const PropertyPreferencePage = () => {
  const [activeFilter, setActiveFilter] = useState<FilterKey>("proposal");
  const [properties, setProperties] = useState<Property[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [propertiesRes, quotationsRes] = await Promise.all([
        propertyApi.getProperties(),
        propertyApi.getQuotations(),
      ]);
      setProperties(propertiesRes.property || []);
      setQuotations(quotationsRes.quotations || []);
      toast.success("Data loaded successfully!");
    } catch (err: any) {
      toast.error("Could not load data");
      console.error("Load data error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <DashboardLayout role="appraiser">
      <Toaster position="top-center" />
      <div className="p-2">
       
        {/* Filter Tabs */}
        <div className="flex gap-4 mb-4">
          {FILTERS.map((filter) => (
            <button
              key={filter.key}
              className={`w-full py-2 rounded-full transition ${
                activeFilter === filter.key
                  ? "bg-[#2A020D] hover:bg-[#4e1b29] text-white"
                  : "border-[#2A020D] text-[#2A020D] hover:bg-[#FBEFF2] bg-transparent border"
              }`}
              onClick={() => setActiveFilter(filter.key)}
            >
              {filter.name}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeFilter === "proposal" ? (
          <ProposalForm 
            properties={properties} 
            onSuccess={loadData}
            loading={loading}
          />
        ) : (
          <QuotationsList 
            quotations={quotations} 
            activeFilter={activeFilter}
            loading={loading}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default PropertyPreferencePage;
