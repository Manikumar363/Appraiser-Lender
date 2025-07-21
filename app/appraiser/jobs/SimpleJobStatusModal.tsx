"use client";
import React, { useState } from "react";
import { Dialog } from "@headlessui/react";
import { uploadDocs } from "../lib/job";

interface SimpleJobStatusModalProps {
  open: boolean;
  onClose: () => void;
  jobId: string; // This should be the 6-digit job ID (job.job.id)
  currentStatus: string; // Current job_status
  onSubmit: (payload: any) => Promise<void>;
}

export function SimpleJobStatusModal({
  open,
  onClose,
  jobId, 
  currentStatus,
  onSubmit,
}: SimpleJobStatusModalProps) {
  const [selectedStatus, setSelectedStatus] = useState("");
  const [propertyRights, setPropertyRights] = useState("");
  const [occupant, setOccupant] = useState("");
  const [comments, setComments] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get available next status options based on current status
  const getStatusOptions = () => {
    if (currentStatus === "accepted") {
      return [
        { value: "", label: "Enter Status" },
        { value: "site_visit_scheduled", label: "Site Visit Scheduled" }
      ];
    }
    if (currentStatus === "site_visit_scheduled") {
      return [
        { value: "", label: "Enter Status" },
        { value: "post_visit_summary", label: "Post Visit Summary" }
      ];
    }
    return [{ value: "", label: "Enter Status" }];
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedStatus) {
      setError("Please select a status to proceed");
      return;
    }

    setLoading(true);

    try {
      let uploadedDocs: string[] = [];
      if (files.length) {
        uploadedDocs = await uploadDocs(files);
      }

      const payload = {
        job_status: selectedStatus,
        property_rights: propertyRights,
        occupant: occupant,
        comments: comments,
        appraiser_docs: uploadedDocs.length ? uploadedDocs : undefined,
      };

      console.log("Submitting payload for job:", jobId, "Current status:", currentStatus, "New status:", selectedStatus, payload);
      await onSubmit(payload);
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Failed to update job status.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" aria-hidden="true"/>
      <Dialog.Panel className="bg-white max-w-2xl w-full rounded-2xl shadow-lg px-8 py-6 relative max-h-[85vh] overflow-y-auto">
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
              <h3 className="text-lg font-semibold">Commercial Property Inspection</h3>
              <p className="text-sm text-gray-600">Toronto, Canada shubham</p>
            </div>
          </div>
          
          <div className="flex gap-3 mb-4">
            <span className="bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-medium">
              📊 {currentStatus === "accepted" ? "Active" : "Site Visit Scheduled"}
            </span>
          </div>
          
          <div className="flex gap-3 text-sm">
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">📄 #{jobId}</span>
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">👤 </span>
            <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full">🏢 Commercial</span>
          </div>
        </div>

        <h2 className="text-xl font-semibold mb-6">Update Status</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-2 text-gray-700 font-medium">Update Status</label>
            <div className="relative">
              <select 
                className="w-full border border-gray-300 rounded-full px-12 py-3 pr-10 appearance-none bg-white"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                {getStatusOptions().map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                <div className="w-6 h-6 border-2 border-gray-400 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                </div>
              </div>
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          <div>
            <label className="block mb-2 text-gray-700 font-medium">Property Rights Appraised</label>
            <input
              type="text"
              value={propertyRights}
              onChange={e => setPropertyRights(e.target.value)}
              className="w-full border border-gray-300 rounded-full px-4 py-3"
              placeholder="Enter Property Rights Appraised"
            />
          </div>

          <div>
            <label className="block mb-2 text-gray-700 font-medium">Occupant</label>
            <input
              type="text"
              value={occupant}
              onChange={e => setOccupant(e.target.value)}
              className="w-full border border-gray-300 rounded-full px-4 py-3"
              placeholder="Enter Occupant"
            />
          </div>

          <div>
            <label className="block mb-2 text-gray-700 font-medium">Upload Document</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
              <input 
                type="file" 
                multiple 
                accept="application/pdf" 
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="text-3xl mb-2">📤</div>
                <p className="text-gray-600">Upload any additional PDF related to this job</p>
              </label>
              {files.length > 0 && (
                <div className="mt-2 text-sm text-green-600">{files.length} file(s) selected</div>
              )}
            </div>
          </div>

          <div>
            <label className="block mb-2 text-gray-700 font-medium">Comments</label>
            <textarea
              value={comments}
              onChange={e => setComments(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 h-20 resize-none"
              placeholder="Enter Comments"
            />
          </div>

          {error && <div className="text-sm text-red-500 bg-red-50 p-3 rounded-lg">{error}</div>}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-4 rounded-full font-semibold hover:bg-blue-700 transition text-lg"
            disabled={loading}
          >
            {loading ? "Requesting..." : "Request Info"}
          </button>
        </form>
      </Dialog.Panel>
    </Dialog>
  );
}
