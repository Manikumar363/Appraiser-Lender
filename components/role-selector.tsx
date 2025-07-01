"use client"

interface RoleSelectorProps {
  selectedRole: "appraiser" | "lender"
  onRoleChange: (role: "appraiser" | "lender") => void
}

export function RoleSelector({ selectedRole, onRoleChange }: RoleSelectorProps) {
  return (
    <div className="flex gap-3 mb-8">
      <button
        type="button"
        onClick={() => onRoleChange("appraiser")}
        className={`flex-1 py-4 px-6 rounded-full border transition-all text-lg font-medium ${
          selectedRole === "appraiser"
            ? "bg-white border-[#1e5ba8] text-[#1e5ba8]"
            : "bg-white border-gray-200 text-gray-600 hover:border-[#1e5ba8] hover:text-[#1e5ba8]"
        }`}
      >
        Appraiser
      </button>
      <button
        type="button"
        onClick={() => onRoleChange("lender")}
        className={`flex-1 py-4 px-6 rounded-full border transition-all text-lg font-medium ${
          selectedRole === "lender"
            ? "bg-[#1e5ba8] border-[#1e5ba8] text-white"
            : "bg-white border-gray-200 text-gray-600 hover:border-[#1e5ba8] hover:text-[#1e5ba8]"
        }`}
      >
        Lender
      </button>
    </div>
  )
}
