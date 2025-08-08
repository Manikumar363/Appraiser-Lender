// app/appraiser/property/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { BuildingIcon, LoadIcon, ResidentialIcon } from '@/components/icons';
import { propertyApi } from '../lib/property';
import DashboardLayout from '@/components/dashboard-layout';

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
  const [properties, setProperties] = useState([]); // From /property API
  const [quotations, setQuotations] = useState([]); // From /user/quotation API
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [costOfAppraiser, setCostOfAppraiser] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load data on page mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [propertiesRes, quotationsRes] = await Promise.all([
        propertyApi.getProperties(),
        propertyApi.getQuotations()
      ]);
      
      setProperties(propertiesRes.property || []);
      setQuotations(quotationsRes.quotations || []);
    } catch (err: any) {
      setError('Failed to load data');
      console.error('Load data error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Get selected property details
  const getSelectedProperty = (): Property | undefined => {
    return properties.find((prop:any) => prop.id === selectedPropertyId);
  };

  
  const getCostRange = (): string => {
    const selected = getSelectedProperty();
    if (!selected || !selected.min_price || !selected.max_price) return '';
    return `${selected.min_price} - ${selected.max_price}`;
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPropertyId || !costOfAppraiser) {
      setError('Please fill all fields');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      await propertyApi.createQuotation({
        property_type: selectedPropertyId, // Send the property ID
        cost_of_appraiser: costOfAppraiser,
        cost: getCostRange() // Send range like "500 - 999"
      });
      
      // Reset form and reload data
      setSelectedPropertyId('');
      setCostOfAppraiser('');
      await loadData();
      
    } catch (err: any) {
      setError('Failed to create quotation');
      console.error('Submit error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
     <DashboardLayout role="appraiser">
    <div className="p-2 ">
      {/* Header */}
      <div className="bg-[#E9FFFD] rounded-lg p-6 mb-6 shadow-sm">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4 flex-1">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
              <BuildingIcon className="w-6 h-6 text-[#014F9D]" />
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
      </div>

      <h2 className="text-xl font-semibold mb-6">Add Property Preference</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Property Type Dropdown */}
        <div>
          <label className="block mb-2 text-gray-700 font-medium">
            Property Type
          </label>
          <div className="relative">
            <select 
              className="w-full border border-gray-300 rounded-full px-12 py-3 pr-10 appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-[#014F9D] focus:border-transparent"
              value={selectedPropertyId}
              onChange={(e) => setSelectedPropertyId(e.target.value)}
              required
            >
              <option value="">Select Property Type</option>
              {properties.map((property: any) => (
                <option key={property.id} value={property.id}>
                  {property.property_type}
                </option>
              ))}
            </select>
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
              <ResidentialIcon className="w-5 h-5 text-gray-400" />
            </div>
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Cost Range (Auto-filled) */}
        <div>
          <label className="block mb-2 text-gray-700 font-medium">
            Market Range
          </label>
          <input
            type="text"
            value={getCostRange()}
            readOnly
            className="w-full border border-gray-300 rounded-full px-4 py-3 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#014F9D] focus:border-transparent"
            placeholder="Select property type to see range"
          />
        </div>

        {/* Cost of Appraiser */}
        <div>
          <label className="block mb-2 text-gray-700 font-medium">
            Cost of Appraiser
          </label>
          <input
            type="number"
            value={costOfAppraiser}
            onChange={(e) => setCostOfAppraiser(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#014F9D] focus:border-transparent"
            placeholder="Enter appraiser cost"
          />
        </div>

        

        <button
          type="submit"
          className="w-full bg-[#014F9D] text-white py-4 rounded-full font-semibold hover:bg-blue-700 transition text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <LoadIcon className="w-5 h-5 animate-spin" />
              Creating...
            </div>
          ) : (
            "Add Property Preference"
          )}
        </button>
      </form>

      {/* Existing Quotations */}
      {quotations.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-semibold mb-6">Your Quotations</h2>
          <div className="space-y-4">
            {quotations.map((quotation: any) => (
              <div key={quotation.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {quotation.property_type.property_type}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      Market Range: {quotation.cost}
                    </p>
                    <p className="text-sm text-gray-600 mb-1">
                      Appraiser Cost: ${quotation.cost_of_appraiser}
                    </p>
                    <p className="text-sm text-gray-600">
                      Appraiser: {quotation.appraiser.name}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      quotation.approved 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {quotation.approved ? 'Approved' : 'Pending'}
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
     </DashboardLayout >
  );
};

export default PropertyPage;
