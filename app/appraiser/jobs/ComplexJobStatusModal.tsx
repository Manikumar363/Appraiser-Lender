"use client";
import React, { useState } from "react";
import { Dialog } from "@headlessui/react";
import { uploadDocs } from "../lib/job";
import { EnhancedPropertyMapPicker } from "./EnhancedPropertyMapPicker";
import {
  ProfileIcon3,
  BuildingIcon,
  UploadIcon,
  LoadIcon,
  ResidentialIcon,
  Notes,
  Comments,
} from "@/components/icons";

interface ComplexJobStatusModalProps {
  open: boolean;
  onClose: () => void;
  jobId: string;
  jobData: any;
  onSubmit: (payload: any) => Promise<void>;
}

export function ComplexJobStatusModal({
  open,
  onClose,
  jobId,
  jobData,
  onSubmit,
}: ComplexJobStatusModalProps) {
  const [estimateMarketValue, setEstimateMarketValue] = useState("");
  const [effectiveDate, setEffectiveDate] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("completed");
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles((prevFiles) => [...prevFiles, ...newFiles]);
      e.target.value = "";
    }
  };

  const removeFile = (indexToRemove: number) => {
    setFiles((prevFiles) =>
      prevFiles.filter((_, index) => index !== indexToRemove)
    );
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
      setError(
        err?.response?.data?.message || err.message || "Failed to update job."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div className="fixed inset-0 bg-black/50" aria-hidden="true" />

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
                    {jobData?.property_type || "Property Inspection"}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {jobData?.address || "Location not specified"}
                  </p>
                </div>

                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ml-4 bg-yellow-400 text-black">
                  <LoadIcon className="w-3 h-3" />
                  Post Visit Summary
                </span>
              </div>

              <div className="flex gap-2 ml-6">
                <span className="inline-flex items-center gap-2 px-3 py-2 rounded-full border border-[#2A020D] text-[#2A020D] bg-white text-sm font-medium whitespace-nowrap">
                  <span className="text-xs">
                    <Notes />
                  </span>{" "}
                  #{jobId}
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

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block mb-2 text-[#000000] font-urbanist font-semibold">
                Estimate Market Value
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-black font-bold text-lg">
                  $
                </span>
                <input
                  type="number"
                  value={estimateMarketValue}
                  onChange={(e) => setEstimateMarketValue(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-full px-10 py-3 focus:outline-none focus:ring-2 focus:ring-[#2A020D] focus:border-transparent [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                  placeholder="Enter Value"
                  max="9999999999"
                  min="0"
                  step="any"
                />
              </div>
            </div>

            <div>
              <label className="block mb-2 text-[#000000] font-urbanist font-semibold">
                Effective Date
              </label>
              <input
                type="date"
                value={effectiveDate}
                onChange={(e) => setEffectiveDate(e.target.value)}
                required
                min="1900-01-01"
                max="2999-12-31"
                className="w-full border border-gray-300 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#2A020D] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block mb-2 text-[#000000] font-urbanist font-semibold">
                Notes/Comments
              </label>
              <div className="relative">
                {/* Icon positioned at top-left with proper spacing for textarea */}
                <div className="absolute left-4 top-4 text-gray-400 pointer-events-none">
                  <Comments />
                </div>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-lg pl-12 pr-4 py-3 h-20 resize-none focus:outline-none focus:ring-2 focus:ring-[#2A020D] focus:border-transparent"
                  placeholder="Enter your notes or comments here..."
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block mb-2 text-[#000000] font-urbanist font-semibold">
                  Location{" "}
                </label>
                <EnhancedPropertyMapPicker
                  onLocationSelect={(lat, lng) =>
                    setLocation({ latitude: lat, longitude: lng })
                  }
                  initialLocation={location}
                />
                {location && (
                  <div className="mt-2 p-2 bg-green-50 rounded text-sm text-green-700">
                    ✅ <strong>Property location selected:</strong>
                    <br />
                    Latitude: {location.latitude.toFixed(6)}
                    <br />
                    Longitude: {location.longitude.toFixed(6)}
                  </div>
                )}
              </div>

              <div>
                <label className="block mb-14 text-[#000000] font-urbanist font-semibold">
                  Upload Document
                </label>
                <div className="border-2 border-dashed h-[11rem] border-gray-300 rounded-lg p-8 bg-gray-50 hover:bg-gray-100 transition-colors">
                  <input
                    type="file"
                    multiple
                    accept="application/pdf,image/*,.jpg,.jpeg,.png,.gif"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload-complex"
                  />
                  <label
                    htmlFor="file-upload-complex"
                    className="cursor-pointer"
                  >
                    <div className="text-center">
                      <div className="flex justify-center mb-3">
                        <UploadIcon className="w-6 h-6 text-gray-400" />
                      </div>
                      <p className="text-gray-600 font-medium">
                        Upload any additional PDF or images related to this job
                      </p>
                    </div>
                  </label>

                  {files.length > 0 && (
                    <div className="mt-4">
                      <div className="text-center mb-3">
                        <div className="inline-flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {files.length} file(s) selected
                        </div>
                      </div>

                      <div className="max-h-32 overflow-y-auto">
                        {files.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 bg-white rounded-md mb-1 text-sm"
                          >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <div className="w-4 h-4 bg-blue-100 rounded flex items-center justify-center flex-shrink-0">
                                {file.type.includes("pdf") ? (
                                  <span className="text-red-600 text-xs font-bold">
                                    PDF
                                  </span>
                                ) : (
                                  <span className="text-blue-600 text-xs font-bold">
                                    IMG
                                  </span>
                                )}
                              </div>
                              <span className="truncate text-gray-700">
                                {file.name}
                              </span>
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
            </div>

            <div>
              <label className="block mb-2 text-[#000000] font-urbanist font-semibold">
                Status
              </label>
              <div className="relative">
                <select
                  className="w-full border border-gray-300 rounded-full px-12 py-3 pr-10 appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-[#2A020D] focus:border-transparent"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <option value="completed">Completed</option>
                </select>
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <LoadIcon className="w-5 h-5 text-gray-400" />
                </div>
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-500 bg-red-50 p-3 rounded-lg border border-red-200">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-[#2A020D] text-white py-4 rounded-full font-semibold hover:bg-[#014F9F] transition text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <LoadIcon className="w-5 h-5 animate-spin" />
                  Submitting...
                </div>
              ) : (
                "Submit Report"
              )}
            </button>
          </form>
        </div>
      </Dialog.Panel>
    </Dialog>
  );
}
