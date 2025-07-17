"use client"

import DashboardLayout from "../../../components/dashboard-layout"
import { BellIcon } from "lucide-react"

const mockNotifications = [
  {
    id: 1,
    message: "Respective data will be visible here",
    date: "2025-07-08",
  },
  {
    id: 2,
    message: "Payment received for Job #3.",
    date: "2025-07-07",
  },
  {
    id: 3,
    message: "Post-visit summary uploaded for Job #2.",
    date: "2025-07-06",
  },
]

export default function NotificationsPage() {
  return (
    <DashboardLayout role="lender">
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold flex items-center gap-3">
          <BellIcon className="w-6 h-6 text-blue-700" /> Notifications
        </h1>

        <div className="space-y-4">
          {mockNotifications.length === 0 ? (
            <div className="text-center bg-cyan-50 shadow-lg text-gray-500 mt-10">
              Your notifications will appear here.
            </div>
          ) : (
            mockNotifications.map((notif) => (
              <div
                key={notif.id}
                className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm"
              >
                <p className="text-gray-800 font-medium">{notif.message}</p>
                <p className="text-xs text-gray-500 mt-1">{notif.date}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
