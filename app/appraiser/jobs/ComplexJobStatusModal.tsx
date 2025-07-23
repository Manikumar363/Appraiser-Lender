"use client";
import React, { useState } from "react";
import { Dialog } from "@headlessui/react";
import { uploadDocs } from "../lib/job";
import { EnhancedPropertyMapPicker } from './EnhancedPropertyMapPicker';

interface ComplexJobStatusModalProps {
  open: boolean;
  onClose: () => void;
  jobId: string; // 6-digit job ID
  jobData: any; // Pass the entire job data
  onSubmit: (payload: any) => Promise<void>;
}

export function ComplexJobStatusModal({
  open,
  onClose,
  jobId,
  jobData, // New prop for job data
  onSubmit,
}: ComplexJobStatusModalProps) {
  const [estimateMarketValue, setEstimateMarketValue] = useState("");
  const [effectiveDate, setEffectiveDate] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("completed");
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let uploadedDocs: string[] = [];
      if (files.length) {
        uploadedDocs = await uploadDocs(files);
      }

      const payload = {
        job_status: selectedStatus,
        estimate_market_value: estimateMarketValue,
        effective_date: effectiveDate,
        notes: notes,
        comments: notes,
        location: location ?? undefined,
        appraiser_docs: uploadedDocs.length ? uploadedDocs : undefined,
      };

      console.log("Submitting payload for job:", jobId, payload);
      await onSubmit(payload);
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Failed to update job.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" aria-hidden="true"/>
      <Dialog.Panel className="bg-white max-w-4xl w-full rounded-2xl shadow-lg px-8 py-6 relative max-h-[90vh] overflow-y-auto">
        <button 
          onClick={onClose} 
          className="absolute right-6 top-6 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700"
        >
          ×
        </button>
        
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
              <span className="text-blue-600">🏢</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold">{jobData?.property_type || "Property Inspection"}</h3>
              <p className="text-sm text-gray-600">{jobData?.address || "Location not specified"}</p>
            </div>
          </div>
          
          <div className="flex gap-3 mb-4">
            <span className="bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-medium">
              📊 Post Visit Summary
            </span>
          </div>
          
          <div className="flex gap-3 text-sm">
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">📄 #{jobId}</span>
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">👤 {jobData?.intended_username || "Unknown"}</span>
            <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full">🏢 {jobData?.property_type || "Property"}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-2 text-gray-700 font-medium">Estimate Market Value</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg">$</span>
              <input
                type="text"
                value={estimateMarketValue}
                onChange={e => setEstimateMarketValue(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-full px-10 py-3"
                placeholder="Enter Value"
              />
            </div>
          </div>

          <div>
            <label className="block mb-2 text-gray-700 font-medium">Effective Date</label>
            <input
              type="date"
              value={effectiveDate}
              onChange={e => setEffectiveDate(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-full px-4 py-3"
            />
          </div>

          <div>
            <label className="block mb-2 text-gray-700 font-medium">Notes/Comments</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-3 h-20 resize-none"
              placeholder="Enter Comments"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block mb-2 text-gray-700 font-medium">Property Location *</label>
              <EnhancedPropertyMapPicker
                onLocationSelect={(lat, lng) => setLocation({ latitude: lat, longitude: lng })}
                initialLocation={location}
              />
              {location && (
                <div className="mt-2 p-2 bg-green-50 rounded text-sm text-green-700">
                  ✅ <strong>Property location selected:</strong><br/>
                  Latitude: {location.latitude.toFixed(6)}<br/>
                  Longitude: {location.longitude.toFixed(6)}
                </div>
              )}
            </div>

            <div>
              <label className="block mb-2 text-gray-700 font-medium">Upload Document</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg h-32 flex items-center justify-center bg-gray-50">
                <input 
                  type="file" 
                  multiple 
                  accept="application/pdf" 
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload-complex"
                />
                <label htmlFor="file-upload-complex" className="cursor-pointer text-center">
                  <div className="text-2xl mb-2">📤</div>
                  <p className="text-xs text-gray-600">Upload any additional PDF<br/>related to this job</p>
                  {files.length > 0 && (
                    <div className="mt-1 text-xs text-green-600">{files.length} file(s) selected</div>
                  )}
                </label>
              </div>
            </div>
          </div>

          <div>
            <label className="block mb-2 text-gray-700 font-medium">Status</label>
            <select 
              className="w-full border border-gray-300 rounded-full px-4 py-3 pr-10 appearance-none bg-white"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="completed">Completed</option>
            </select>
          </div>

          {error && <div className="text-sm text-red-500 bg-red-50 p-3 rounded-lg">{error}</div>}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-4 rounded-full font-semibold hover:bg-blue-700 transition text-lg"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit Report"}
          </button>
        </form>
      </Dialog.Panel>
    </Dialog>
  );
}
