"use client";
import React, { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import { uploadDocs } from "../lib/job";
import { ProfileIcon3, BuildingIcon, UploadIcon, LoadIcon, ResidentialIcon, Notes } from "@/components/icons";

interface SimpleJobStatusModalProps {
  open: boolean;
  onClose: () => void;
  jobId: string;
  currentStatus: string;
  jobData: any;
  onSubmit: (payload: any) => Promise<void>;
}

export function SimpleJobStatusModal({
  open,
  onClose,
  jobId, 
  currentStatus,
  jobData,
  onSubmit,
}: SimpleJobStatusModalProps) {
  const [selectedStatus, setSelectedStatus] = useState("");
  const [propertyRights, setPropertyRights] = useState("");
  const [occupant, setOccupant] = useState("");
  const [comments, setComments] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load persisted data when modal opens
  useEffect(() => {
    if (open && jobId) {
      const persistedData = localStorage.getItem(`job_${jobId}_form_data`);
      if (persistedData) {
        try {
          const data = JSON.parse(persistedData);
          setPropertyRights(data.property_rights || "");
          setOccupant(data.occupant || "");
          setComments(data.comments || "");
          // Note: Files can't be persisted due to security restrictions
        } catch (error) {
          console.log("Failed to load persisted data");
        }
      }
    }
  }, [open, jobId]);

  // Persist form data when fields change
  const persistFormData = (data: any) => {
    if (jobId) {
      localStorage.setItem(`job_${jobId}_form_data`, JSON.stringify(data));
    }
  };

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
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prevFiles => [...prevFiles, ...newFiles]);
      e.target.value = '';
    }
  };

  const removeFile = (indexToRemove: number) => {
    setFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove));
  };

  // Handle field changes with persistence
  const handlePropertyRightsChange = (value: string) => {
    setPropertyRights(value);
    persistFormData({ property_rights: value, occupant, comments });
  };

  const handleOccupantChange = (value: string) => {
    setOccupant(value);
    persistFormData({ property_rights: propertyRights, occupant: value, comments });
  };

  const handleCommentsChange = (value: string) => {
    setComments(value);
    persistFormData({ property_rights: propertyRights, occupant, comments: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // ENHANCED VALIDATION: All fields are now required
    if (!selectedStatus) {
      setError("Please select a status to proceed");
      return;
    }

    if (!propertyRights.trim()) {
      setError("Property Rights Appraised is required");
      return;
    }

    if (!occupant.trim()) {
      setError("Occupant information is required");
      return;
    }

    if (!comments.trim()) {
      setError("Comments are required");
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
        property_rights: propertyRights.trim(),
        occupant: occupant.trim(),
        comments: comments.trim(),
        appraiser_docs: uploadedDocs.length ? uploadedDocs : undefined,
      };

      await onSubmit(payload);
      
      // Clear persisted data after successful submission
      if (jobId) {
        localStorage.removeItem(`job_${jobId}_form_data`);
      }
      
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
      
      <Dialog.Panel className="bg-white max-w-5xl w-full rounded-2xl shadow-lg relative max-h-[90vh] overflow-y-auto">
        
        <button 
          onClick={onClose} 
          className="absolute right-4 top-4 w-8 h-8 bg-[#2A020D] text-white rounded-full flex items-center justify-center hover:bg-blue-700 z-20 shadow-lg"
        >
          ×
        </button>
        
        <div className="p-8 pt-16">
          
          <div className="bg-[#E9FFFD] rounded-lg p-6 mb-6 shadow-sm">
            <div className="flex justify-between items-center">
              
              <div className="flex items-center gap-4 flex-1">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                  <BuildingIcon className="w-6 h-6 text-[#2A020D]" />
                </div>
                
                <div className="flex flex-col">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {jobData?.property_type || "Commercial Property Inspection"}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {jobData?.address || "Toronto, Canada"}
                  </p>
                </div>
                
                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ml-4
                  ${currentStatus === "accepted" || currentStatus === "active"
                    ? "bg-[#2A020D] text-white"
                    : "bg-yellow-400 text-black"}`}>
                  <LoadIcon className="w-3 h-3" />
                  {currentStatus === "accepted" || currentStatus === "active"
                    ? "Active"
                    : currentStatus === "site_visit_scheduled"
                      ? "Site Visit Scheduled"
                      : (currentStatus || "Unknown").replace(/_/g, " ").toUpperCase()}
                </span>
              </div>
              
              <div className="flex gap-2 ml-6">
                <span className="inline-flex items-center gap-2 px-3 py-2 rounded-full border border-[#2A020D] text-[#2A020D] bg-white text-sm font-medium whitespace-nowrap">
                  <span className="text-xs"><Notes/></span> #{jobId}
                </span>
                <span className="inline-flex items-center gap-2 px-3 py-2 rounded-full border border-[#2A020D] text-[#2A020D] bg-white text-sm font-medium whitespace-nowrap">
                  <ProfileIcon3 className="w-4 h-4 flex-shrink-0" /> 
                  <span className="truncate">{jobData?.intended_username}</span>
                </span>
                <span className="inline-flex items-center gap-2 px-3 py-2 rounded-full border border-[#2A020D] text-[#2A020D] bg-white text-sm font-medium whitespace-nowrap">
                  <ResidentialIcon className="w-4 h-4 flex-shrink-0" /> 
                  {jobData?.property_type}
                </span>
              </div>
            </div>
          </div>

          <h2 className="text-xl font-semibold mb-6">Update Status</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block mb-2 text-gray-700 font-medium">
                Update Status 
              </label>
              <div className="relative">
                <select 
                  className="w-full border border-gray-300 rounded-full px-12 py-3 pr-10 appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-[#2A020D] focus:border-transparent"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  required
                >
                  {getStatusOptions().map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <LoadIcon className="w-5 h-5 text-gray-400" />
                </div>
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block mb-2 text-gray-700 font-medium">
                Property Rights Appraised 
              </label>
              <input
                type="text"
                value={propertyRights}
                onChange={e => handlePropertyRightsChange(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#2A020D] focus:border-transparent"
                placeholder="Enter Property Rights Appraised"
              />
            </div>

            <div>
              <label className="block mb-2 text-gray-700 font-medium">
                Occupant 
              </label>
              <input
                type="text"
                value={occupant}
                onChange={e => handleOccupantChange(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#2A020D] focus:border-transparent"
                placeholder="Enter Occupant"
              />
            </div>

            <div>
              <label className="block mb-2 text-gray-700 font-medium">Upload Document</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 bg-gray-50 hover:bg-gray-100 transition-colors">
                <input 
                  type="file" 
                  multiple 
                  accept="application/pdf,image/*,.jpg,.jpeg,.png,.gif" 
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className="text-center">
                    <div className="flex justify-center mb-3">
                      <UploadIcon className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-gray-600 font-medium">Upload any additional PDF or images related to this job</p>
                    <p className="text-sm text-gray-500 mt-1">You can select multiple files or add more files in separate selections</p>
                  </div>
                </label>
                
                {files.length > 0 && (
                  <div className="mt-4">
                    <div className="text-center mb-3">
                      <div className="inline-flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {files.length} file(s) selected
                      </div>
                    </div>
                    
                    <div className="max-h-32 overflow-y-auto">
                      {files.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-white rounded-md mb-1 text-sm">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <div className="w-4 h-4 bg-blue-100 rounded flex items-center justify-center flex-shrink-0">
                              {file.type.includes('pdf') ? (
                                <span className="text-red-600 text-xs font-bold">PDF</span>
                              ) : (
                                <span className="text-blue-600 text-xs font-bold">IMG</span>
                              )}
                            </div>
                            <span className="truncate text-gray-700">{file.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500 text-xs">
                              {(file.size / 1024).toFixed(1)} KB
                            </span>
                            <button
                              type="button"
                              onClick={() => removeFile(index)}
                              className="text-red-500 hover:text-red-700 text-xs p-1"
                              title="Remove file"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="text-center mt-2">
                      <button
                        type="button"
                        onClick={() => setFiles([])}
                        className="text-sm text-red-600 hover:text-red-800 underline"
                      >
                        Clear all files
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block mb-2 text-gray-700 font-medium">
                Comments 
              </label>
              <textarea
                value={comments}
                onChange={e => handleCommentsChange(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 h-20 resize-none focus:outline-none focus:ring-2 focus:ring-[#2A020D] focus:border-transparent"
                placeholder="Enter Comments"
              />
            </div>

            {error && (
              <div className="text-sm text-red-500 bg-red-50 p-3 rounded-lg border border-red-200">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-[#2A020D] text-white py-4 rounded-full font-semibold hover:bg-blue-700 transition text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <LoadIcon className="w-5 h-5 animate-spin" />
                  Requesting...
                </div>
              ) : (
                "Request Info"
              )}
            </button>
          </form>
        </div>
      </Dialog.Panel>
    </Dialog>
  );
}
