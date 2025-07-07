"use client";

import { useState } from "react";

export default function AvailabilityToggle() {
  const [isAvailable, setIsAvailable] = useState(true);

  const handleToggle = () => {
    setIsAvailable(!isAvailable);
    // TODO: Call your availability API here later!
  };

  return (
    <div className="flex items-center justify-between bg-white rounded-xl shadow-sm p-4">
      {/* Left: status + time */}
      <div className="flex items-center gap-3">
        {/* Green dot */}
        <span
          className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${
            isAvailable ? "bg-green-500" : "bg-gray-400"
          }`}
        >
          <span className="block w-2.5 h-2.5 bg-white rounded-full"></span>
        </span>

        <span className="text-sm text-gray-700 font-medium">00:01:25</span>
        <span className="text-sm text-gray-600">
          Available For New Job Requests.
        </span>
      </div>

      {/* Right: toggle button */}
      <button onClick={handleToggle} className="outline-none">
        {isAvailable ? (
          <svg
            width="40"
            height="25"
            viewBox="0 0 40 25"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect y="0.5" width="40" height="24" rx="12" fill="#00F90A" />
            <rect x="18" y="2.5" width="20" height="20" rx="10" fill="white" />
          </svg>
        ) : (
          <svg
            width="40"
            height="25"
            viewBox="0 0 40 25"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect y="0.5" width="40" height="24" rx="12" fill="#E5E7EB" />{" "}
            {/* gray off */}
            <rect x="2" y="2.5" width="20" height="20" rx="10" fill="white" />
          </svg>
        )}
      </button>
    </div>
  );
}
