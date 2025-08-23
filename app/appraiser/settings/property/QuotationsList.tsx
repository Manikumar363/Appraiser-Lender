import React from "react";
import { BuildingIcon, LoadIcon } from "@/components/icons";

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

type FilterKey = "all" | "pending" | "accepted";

interface QuotationsListProps {
  quotations: Quotation[];
  activeFilter: FilterKey;
  loading: boolean;
  searchQuery?: string;
}

const getStatusColor = (approved: boolean) => {
  return approved ? "bg-[#019D23]" : "bg-[#FFC107]";
};

const QuotationsList: React.FC<QuotationsListProps> = ({ 
  quotations, 
  activeFilter, 
  loading, 
  searchQuery = "" 
}) => {
  // First filter by tab (pending/accepted/all)
  const tabFilteredQuotations = quotations.filter((quotation) => {
    if (activeFilter === "pending") return !quotation.approved;
    if (activeFilter === "accepted") return quotation.approved;
    return true; // "all"
  });

  // Then filter by search query
  const filteredQuotations = tabFilteredQuotations.filter((quotation) => {
    if (!searchQuery) return true;
    
    const searchLower = searchQuery.toLowerCase();
    
    // Search through property type
    const propertyType = quotation.property_type?.property_type?.toLowerCase() || "";
    
    // Search through appraiser name
    const appraiserName = quotation.appraiser?.name?.toLowerCase() || "";
    
    // Search through cost values (convert to string for searching)
    const cost = quotation.cost?.toString().toLowerCase() || "";
    const costOfAppraiser = quotation.cost_of_appraiser?.toString().toLowerCase() || "";
    
    // Search through status
    const status = quotation.approved ? "approved" : "pending";
    
    return (
      propertyType.includes(searchLower) ||
      appraiserName.includes(searchLower) ||
      cost.includes(searchLower) ||
      costOfAppraiser.includes(searchLower) ||
      status.includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadIcon className="animate-spin w-8 h-8 text-[#2A020D]" />
      </div>
    );
  }

  if (filteredQuotations.length === 0) {
    return (
      <div className="flex items-center justify-center py-24">
        <span className="text-gray-500 text-xl font-medium">
          {searchQuery ? "No quotations found matching your search." : "No quotations found."}
        </span>
      </div>
    );
  }

return (
  <div className="space-y-4">
    {filteredQuotations.map((quotation) => (
      <div
        key={quotation.id}
        className="flex justify-between items-center bg-[#FBEFF2] p-4 rounded-lg shadow"
      >
        {/* LEFT SIDE - Icon and Quotation Info */}
        <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
            <BuildingIcon className="w-6 h-6 text-[#2A020D]" />
            </div>

          <div className="flex flex-col">
            <h3 className="font-semibold text-base text-gray-900 mb-1">
              {quotation.property_type?.property_type || "Residential Appraisal"}
            </h3>
            <p className="text-sm text-gray-700 mb-1">
              Estimated Market Value Range: <span className="font-semibold text-gray-900">${quotation.cost}</span>
            </p>
            <p className="text-sm text-gray-700 mb-1">
              Fees For Appraisal: <span className="font-semibold text-gray-900">${quotation.cost_of_appraiser}</span>
            </p>
            {/* <p className="text-sm text-gray-600">
              Appraiser: <span className="font-medium text-gray-800">{quotation.appraiser?.name}</span>
            </p> */}
          </div>
        </div>

        {/* RIGHT SIDE - Status Badge */}
        <div className="flex items-center gap-2">
          <span
                className={`inline-block mt-2 text-white text-xs font-medium ${getStatusColor(
                  quotation.approved
                )}`}
                style={{
                  height: 32,
                  borderRadius: 100,
                  padding: "8px 16px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: 1,
                  gap: 8,
                  whiteSpace: "nowrap",
                  width: "auto",
                  minWidth: 60,
                  maxWidth: 200,
                }}
              >
                <LoadIcon />
                {quotation.approved ? "APPROVED" : "PENDING"}
              </span>
        </div>
      </div>
    ))}
  </div>
);

};

export default QuotationsList;