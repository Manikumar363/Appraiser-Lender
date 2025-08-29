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
  { name: "All Request", key: "all" },
  { name: "Pending Request", key: "pending" },
  { name: "Accepted Request", key: "accepted" },
];

// ✅ MAIN CONTENT COMPONENT (This will receive searchQuery)
const PropertyPreferenceContent = ({ searchQuery = "" }: { searchQuery?: string }) => {
  const [activeFilter, setActiveFilter] = useState<FilterKey>("proposal");
  const [hasSearched, setHasSearched] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(false);

  const loadData = async (showToast = true) => {
    try {
      setLoading(true);
      const [propertiesRes, quotationsRes] = await Promise.all([
        propertyApi.getProperties(),
        propertyApi.getQuotations(),
      ]);
      setProperties(propertiesRes.property || []);
      setQuotations(quotationsRes.quotations || []);
      if (showToast) {
        toast.success("Data loaded successfully!");
      }
    } catch (err: any) {
      toast.error("Could not load data");
      console.error("Load data error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(false); // Don't show toast on initial load
  }, []);

  // ✅ Handle search query changes - auto-switch to "all" if searching
  useEffect(() => {
    if (searchQuery && searchQuery.trim() !== "") {
      if (!hasSearched && activeFilter === "proposal") {
        setActiveFilter("all"); // Switch to "all" only on first search
        setHasSearched(true);
      }
    } else if (searchQuery === "" && hasSearched) {
      // Reset when search is cleared
      setHasSearched(false);
    }
  }, [searchQuery, activeFilter, hasSearched]);

  return (
    <>
      <Toaster position="top-center" />
      <div className="p-2">
        {/* Filter Tabs */}
        <div className="flex gap-4 mb-2">
          {FILTERS.map((filter) => (
            <button
              key={filter.key}
              className={`w-full py-1 rounded-full transition md:py-2 overflow-hidden ${
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
            onSuccess={() => loadData(true)} // Show toast when form succeeds
            loading={loading}
          />
        ) : (
          <QuotationsList 
            quotations={quotations} 
            activeFilter={activeFilter}
            loading={loading}
            searchQuery={searchQuery}
          />
        )}
      </div>
    </>
  );
};

// ✅ PAGE COMPONENT (Clean wrapper)
const PropertyPreferencePage = () => {
  return (
    <DashboardLayout role="appraiser">
      <PropertyPreferenceContent />
    </DashboardLayout>
  );
};

export default PropertyPreferencePage;