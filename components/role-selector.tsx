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
          : "bg-white border-[#1e5ba8] text-[#1e5ba8] hover:bg-[#f1f7ff]"
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
          : "bg-white border-[#1e5ba8] text-[#1e5ba8] hover:bg-[#f1f7ff]"
      }`}
    >
      Lender
    </button>
    </div>
  );
}
