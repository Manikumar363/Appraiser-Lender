import { TimerIcon, BuildingIcon } from "./icons"
import { getStatusColor,Job } from "../lib/api/jobs1"

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
  const normalizedStatus =
    typeof jobStatus === "string"
      ? jobStatus.toLowerCase().replace(/\s+/g, "-")
      : "pending";
  const statusInfo = jobStatus ? statusConfig[normalizedStatus as JobStatus] : undefined;
  const StatusIconComponent = statusInfo ? statusInfo.icon : TimerIcon;
  const badgeColor = getStatusColor(normalizedStatus);


  return (
    <div className="bg-[#FBEFF2] rounded-xl p-3 shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-[#2A020D] rounded-full flex items-center justify-center text-white shadow-md">
          <BuildingIcon className="w-8 h-8"/>
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 text-lg mb-1">{title}</h3>
          <p className="text-gray-500 text-sm">{location}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
         <span
          className={`px-5 py-2.5 rounded-full text-sm font-medium flex items-center gap-2 text-white transition-colors cursor-pointer hover:brightness-110 ${badgeColor}`}
          style={{
           backgroundColor:
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
            }}
        >
          <StatusIconComponent />
          {statusInfo ? statusInfo.label : (jobStatus || "Unknown")}
        </span>
      </div>
    </div>
  )
}