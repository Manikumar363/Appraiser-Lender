"use client";

interface RoleSelectorProps {
  selectedRole: "appraiser" | "lender";
  onRoleChange: (role: "appraiser" | "lender") => void;
}

export function RoleSelector({ selectedRole, onRoleChange }: RoleSelectorProps) {
  const baseButton =
    "flex-1 py-4 px-6 rounded-full border transition-all text-lg font-medium";

  return (
    <div className="flex gap-3 mb-8">
      <button
        type="button"
        onClick={() => onRoleChange("appraiser")}
        className={`${baseButton} ${
          selectedRole === "appraiser"
            ? "bg-[#1e5ba8] border-[#1e5ba8] text-white"
            : "bg-white border-gray-200 text-gray-600 hover:border-[#1e5ba8] hover:text-[#1e5ba8]"
        }`}
      >
        Appraiser
      </button>

      <button
        type="button"
        onClick={() => onRoleChange("lender")}
        className={`${baseButton} ${
          selectedRole === "lender"
            ? "bg-[#1e5ba8] border-[#1e5ba8] text-white"
            : "bg-white border-gray-200 text-gray-600 hover:border-[#1e5ba8] hover:text-[#1e5ba8]"
        }`}
      >
        Lender
      </button>
    </div>
  );
}
