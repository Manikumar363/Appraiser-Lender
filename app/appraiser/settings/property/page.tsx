"use client";

import React, { useState, useEffect } from "react";
import { BuildingIcon, LoadIcon, ResidentialIcon } from "@/components/icons";
import { propertyApi } from "../../lib/property";
import DashboardLayout from "@/components/dashboard-layout";
import { Listbox } from '@headlessui/react';
import { ChevronDown, Check } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

interface Property {
  id: string;
  property_type: string;
  min_price: string;
  max_price: string;
  created_at: string;
  updated_at: string;
  status: string;
}

const PropertyPage = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [quotations, setQuotations] = useState<any[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [costOfAppraiser, setCostOfAppraiser] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load data on page mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [propertiesRes, quotationsRes] = await Promise.all([
        propertyApi.getProperties(),
        propertyApi.getQuotations(),
      ]);
      setProperties(propertiesRes.property || []);
      setQuotations(quotationsRes.quotations || []);
      toast.success("Loaded data!");
    } catch (err: any) {
      setError("Failed to load data");
      toast.error("Could not load data.");
      console.error("Load data error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Get cost range
  const getCostRange = (): string => {
    if (!selectedProperty || !selectedProperty.min_price || !selectedProperty.max_price) return "";
    return `${selectedProperty.min_price}-${selectedProperty.max_price}`;
  };

  // Form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProperty || !costOfAppraiser) {
      setError("Please fill all fields");
      toast.error("Please fill all fields");
      return;
    }
    try {
      setLoading(true);
      setError("");
      await propertyApi.createQuotation({
        property_type: selectedProperty.id,
        cost_of_appraiser: costOfAppraiser,
        cost: getCostRange(),
      });
      setSelectedProperty(null);
      setCostOfAppraiser("");
      toast.success("Quotation added!");
      await loadData();
    } catch (err: any) {
      setError("Failed to create quotation");
      toast.error("Could not create quotation");
      console.error("Submit error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout role="appraiser">
      <Toaster position="top-center" />
      <div className="p-2">
        {/* Header */}
        <div className="bg-[#FBEFF2] rounded-lg p-6 mb-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
              <BuildingIcon className="w-6 h-6 text-[#2A020D]" />
            </div>
            <div className="flex flex-col">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Property Preferences
              </h3>
              <p className="text-sm text-gray-600">
                Manage your property quotations and preferences
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Property Type Dropdown */}
          <div>
            <label className="block mb-2 text-xl font-semibold">
              Service Type
            </label>
            <Listbox value={selectedProperty} onChange={setSelectedProperty}>
              <div className="relative">
                <Listbox.Button className="w-full border border-gray-300 rounded-full px-12 py-3 pl-12 bg-white flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-[#2A020D] focus:border-[#2A020D] pr-10">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                    <ResidentialIcon className="w-5 h-5 text-gray-400" />
                  </div>
                  <span className="block truncate">
                    {selectedProperty?.property_type || "Select Property Type"}
                  </span>
                  <ChevronDown className="w-5 h-5 text-gray-400 absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                </Listbox.Button>
                <Listbox.Options className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-lg border border-gray-200 text-base overflow-auto focus:outline-none">
                  {properties.map((property) => (
                    <Listbox.Option
                      key={property.id}
                      value={property}
                      className={({ active, selected }) =>
                        `cursor-pointer select-none relative py-3 pl-8 pr-4 transition-colors ${
                          selected
                            ? 'bg-[#2A020D] text-white font-medium'
                            : active
                              ? 'bg-[#FBEFF2] text-[#2A020D]'
                              : 'text-gray-900'
                        }`
                      }
                    >
                      {({ selected }) => (
                        <>
                          <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                            {property.property_type}
                          </span>
                          {selected && (
                            <span className="absolute inset-y-0 left-0 flex items-center pl-2">
                              <Check className="h-4 w-4" />
                            </span>
                          )}
                        </>
                      )}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </div>
            </Listbox>
          </div>

          {/* Estimated Market Value */}
          <div>
            <label className="block mb-2 text-xl font-semibold">
              Estimated Market Value
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-xl text-black font-bold select-none pointer-events-none">$</span>
              <input
                type="text"
                value={getCostRange()}
                readOnly
                className="w-full border border-gray-300 rounded-full pl-10 pr-4 py-3 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#2A020D] focus:border-transparent"
                placeholder="Select property type to see range"
              />
            </div>
          </div>

          {/* Fee for Appraiser */}
          <div>
            <label className="block mb-2 text-xl font-semibold">
              Fee for Appraiser
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-xl text-black font-bold select-none pointer-events-none">$</span>
              <input
                type="number"
                value={costOfAppraiser}
                onChange={(e) => setCostOfAppraiser(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-full pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#2A020D] focus:border-transparent"
                placeholder="Enter appraiser cost"
              />
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-500 bg-red-50 p-3 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-[#2A020D] text-white py-4 rounded-full font-semibold hover:bg-[#4e1b29] transition text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <LoadIcon className="w-5 h-5 animate-spin" />
                Updating...
              </div>
            ) : (
              "Update"
            )}
          </button>
        </form>

        {/* Existing Quotations (unchanged) */}
        {/* Existing Quotations */}
        {quotations.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-semibold mb-6">Your Quotations</h2>
            <div className="space-y-4">
              {quotations.map((quotation: any) => (
                <div
                  key={quotation.id}
                  className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {quotation.property_type?.property_type}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        Market Range: {quotation.cost}
                      </p>
                      <p className="text-sm text-gray-600 mb-1">
                        Appraiser Cost: ${quotation.cost_of_appraiser}
                      </p>
                      <p className="text-sm text-gray-600">
                        Appraiser: {quotation.appraiser?.name}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          quotation.approved
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {quotation.approved ? "Approved" : "Pending"}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(quotation.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default PropertyPage;
