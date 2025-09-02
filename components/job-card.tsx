import { TimerIcon, BuildingIcon } from "./icons"
import { getStatusColor, Job } from "../lib/api/jobs1"
import React, { useMemo } from "react"

type JobStatus =
  | "in-progress"
  | "completed"
  | "cancelled"
  | "pending"
  | "accepted"
  | "client-visit"
  | "site-visit-scheduled"
  | "post-visit-summary"

interface JobCardProps {
  title: string
  location: string
  jobStatus?: string
}

const statusConfig: Record<JobStatus, { label: string; icon: any }> = {
  "in-progress": { label: "In Progress", icon: TimerIcon },
  completed: { label: "Completed", icon: TimerIcon },
  cancelled: { label: "Cancelled", icon: TimerIcon },
  pending: { label: "Pending", icon: TimerIcon },
  accepted: { label: "Accepted", icon: TimerIcon },
  "client-visit": { label: "Client Visit", icon: TimerIcon },
  "site-visit-scheduled": { label: "Site Visit Scheduled", icon: TimerIcon },
  "post-visit-summary": { label: "Post Visit Summary", icon: TimerIcon },
}

export function JobCard({ title, location, jobStatus }: JobCardProps) {
  const MAX_LOCATION_LEN = 30
  const displayLocation = useMemo(() => {
    if (!location) return ""
    if (location.length <= MAX_LOCATION_LEN) return location
    const parts = location.split(",").map(p => p.trim()).filter(Boolean)
    if (parts.length >= 2) {
      const country = parts[parts.length - 1]
      const state = parts[parts.length - 2]
      const combo = `${state}, ${country}`
      if (combo.length + 3 < location.length) return combo
    }
    return location.slice(0, MAX_LOCATION_LEN - 1) + "…"
  }, [location])

  const normalizedStatus =
    typeof jobStatus === "string"
      ? jobStatus.toLowerCase().replace(/\s+/g, "-")
      : "pending"
  const statusInfo = jobStatus ? statusConfig[normalizedStatus as JobStatus] : undefined
  const StatusIconComponent = statusInfo ? statusInfo.icon : TimerIcon
  const badgeColor = getStatusColor(normalizedStatus)

  const badgeBg =
    normalizedStatus === "pending" ||
    normalizedStatus === "client-visit" ||
    normalizedStatus === "site-visit-scheduled" ||
    normalizedStatus === "post-visit-summary"
      ? "#FFC107"
      : normalizedStatus === "completed"
      ? "#22c55e"
      : normalizedStatus === "cancelled"
      ? "#ef4444"
      : normalizedStatus === "accepted" || normalizedStatus === "active"
      ? "#22c55e"
      : "#FFC107"

  return (
    <div
      className="
        bg-[#FBEFF2] rounded-xl border border-gray-100 shadow-sm
        p-3 sm:p-4
        flex flex-col sm:flex-row
        sm:items-center gap-3 sm:gap-4
        hover:shadow-md transition-shadow
      "
    >
      {/* Left: icon + text */}
      <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
        <div
          className="
            w-12 h-12 min-w-[3rem] min-h-[3rem]
            bg-[#2A020D] rounded-full flex items-center justify-center
            text-white shadow-md flex-shrink-0
          "
        >
          <BuildingIcon className="w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0" />
        </div>
        <div className="flex flex-col justify-center min-w-0 flex-1">
          <h3 className="font-semibold text-gray-900 text-sm sm:text-base leading-snug truncate">
            {title}
          </h3>
            <p className="text-gray-500 text-xs sm:text-sm leading-tight truncate">
              {displayLocation}
            </p>
        </div>
      </div>

      {/* Status badge (wraps below on very small screens) */}
      <div className="flex sm:block">
        <span
          className={`
            px-3 sm:px-4 py-1.5 sm:py-2
            rounded-full text-xs sm:text-sm font-medium
            inline-flex items-center gap-1 sm:gap-2
            text-white whitespace-nowrap
            flex-shrink-0 self-start
            ${badgeColor}
          `}
          style={{ backgroundColor: badgeBg }}
        >
          <StatusIconComponent className="w-4 h-4 flex-shrink-0" />
          {statusInfo ? statusInfo.label : (jobStatus || "Unknown")}
        </span>
      </div>
    </div>
  )
}