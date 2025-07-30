"use client";
import React, { useState } from "react";
import { Dialog } from "@headlessui/react";
import { uploadDocs } from "../lib/job";
import { ProfileIcon3, BuildingIcon, UploadIcon, LoadIcon } from "@/components/icons";

interface SimpleJobStatusModalProps {
  open: boolean;
  onClose: () => void;
  jobId: string; // 6-digit job ID
  currentStatus: string; // Current job_status
  jobData: any; // Pass the entire job data
  onSubmit: (payload: any) => Promise<void>;
}

export function SimpleJobStatusModal({
  open,
  onClose,
  jobId, 
  currentStatus,
  jobData, // New prop for job data
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
    if (currentStatus === "accepted"|| currentStatus === "active") {
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
      <Dialog.Panel className="bg-white max-w-3xl w-full rounded-2xl shadow-lg px-8 py-6 relative max-h-[85vh] overflow-y-auto">
        <button 
          onClick={onClose} 
          className="absolute right-6 top-6 w-8 h-8 bg-[#014F9D] text-white rounded-full flex items-center justify-center hover:bg-blue-700"
        >
          ×
        </button>
        
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
              <BuildingIcon className="w-5 h-5 text-[#014F9D]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{jobData?.property_type || "Property Inspection"}</h3>
              <p className="text-sm text-gray-600">{jobData?.address || "Location not specified"}</p>
            </div>
          </div>
          
          <div className="flex gap-3 mb-4">
  <span
    className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 
      ${currentStatus === "accepted" || currentStatus === "active"
        ? "bg-[#014F9D] text-white"
        : "bg-yellow-400 text-black"}`}
  >
    <LoadIcon className="w-3 h-3" />
    {(currentStatus === "accepted" || currentStatus === "active")
      ? "Active"
      : "Site Visit Scheduled"}
  </span>
</div>

          
          <div className="flex gap-3 text-sm">
            <span className="w-[108px] h-[36px] px-[10px] py-[8px] rounded-full border border-[#014F9D] text-[#014F9D] text-sm font-medium flex items-center gap-2 overflow-hidden whitespace-nowrap">
              <span className="text-xs">#</span> {jobId}
            </span>
            <span className="w-[108px] h-[36px] px-[10px] py-[8px] rounded-full border border-[#014F9D] text-[#014F9D] text-sm font-medium flex items-center gap-2 overflow-hidden whitespace-nowrap">
              <ProfileIcon3 className="flex-shrink-0" /> {jobData?.intended_username || "Unknown"}
            </span>
            <span className="w-[108px] h-[36px] px-[10px] py-[8px] rounded-full border border-[#014F9D] text-[#014F9D] text-sm font-medium flex items-center gap-2 overflow-hidden whitespace-nowrap">
              <BuildingIcon className="flex-shrink-0" /> {jobData?.property_type || "Property"}
            </span>
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

          {/* FIXED: Upload section to match Figma - centered icon */}
          <div>
            <label className="block mb-2 text-gray-700 font-medium">Upload Document</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 bg-gray-50">
              <input 
                type="file" 
                multiple 
                accept="application/pdf" 
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                {/* CENTERED: Upload section to match your Figma design */}
                <div className="text-center">
                  <div className="flex justify-center mb-3">
                    <UploadIcon className="w-12 h-12 text-gray-400" />
                  </div>
                  <p className="text-gray-600 font-medium mb-1">Upload any additional PDF related to this job</p>
                  <p className="text-sm text-gray-500">Click here to browse files</p>
                </div>
              </label>
              {files.length > 0 && (
                <div className="mt-4 text-center">
                  <div className="inline-flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {files.length} file(s) selected
                  </div>
                </div>
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
            className="w-full bg-[#014F9D] text-white py-4 rounded-full font-semibold hover:bg-[#015F9D] transition text-lg"
            disabled={loading}
          >
            {loading ? "Requesting..." : "Request Info"}
          </button>
        </form>
      </Dialog.Panel>
    </Dialog>
  );
}
