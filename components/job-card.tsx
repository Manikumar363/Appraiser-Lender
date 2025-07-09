import { TimerIcon, BuildingIcon } from "./icons"

interface JobCardProps {
  title: string
  location: string
  status: "in-progress" | "active" | "cancelled"
}

const statusConfig = {
  "in-progress": {
    label: "In Progress",
    className: " bg-[#FFC107] text-white",
    icon: TimerIcon,
  },
  active: {
    label: "Active",
    className: "bg-[#00F90A] text-white ",
    icon: TimerIcon,
  },
  cancelled: {
    label: "Cancel",
    className: "bg-[#FD5D2D] text-white",
    icon: TimerIcon,
  },
}

export function JobCard({ title, location, status }: JobCardProps) {
  const statusInfo = statusConfig[status]
  const StatusIconComponent = statusInfo.icon

  return (
    <div className="bg-cyan-50 rounded-xl p-3 shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-[#1e5ba8] rounded-full flex items-center justify-center text-white shadow-md">
          <BuildingIcon />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 text-lg mb-1">{title}</h3>
          <p className="text-gray-500 text-sm">{location}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span
          className={`px-5 py-2.5 rounded-full text-sm font-medium flex items-center gap-2 ${statusInfo.className}`}
        >
          <StatusIconComponent />
          {statusInfo.label}
        </span>
      </div>
    </div>
  )
}
