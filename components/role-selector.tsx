"use client";

interface RoleSelectorProps {
  selectedRole: "appraiser" | "lender";
  onRoleChange: (role: "appraiser" | "lender") => void;
}

export function RoleSelector({ selectedRole, onRoleChange }: RoleSelectorProps) {
  const baseButton =
    "flex-1 h-[56px] flex items-center justify-center py-4 px-6 rounded-full border transition-all text-lg font-medium";

  return (
    <div className="flex gap-3 mb-8 w-[765px] h-[56px] ">
      <button
      type="button"
      onClick={() => onRoleChange("appraiser")}
      className={`${baseButton} ${
        selectedRole === "appraiser"
          ? "bg-[#2A020D] border-[#2A020D] text-white"
          : "bg-white border-[#2A020D] text-[#2A020D] hover:bg-[#f1f7ff]"
      }`}
    >
      Appraiser
    </button>

    <button
      type="button"
      onClick={() => onRoleChange("lender")}
      className={`${baseButton} ${
        selectedRole === "lender"
          ? "bg-[#2A020D] border-[#2A020D] text-white"
          : "bg-white border-[#2A020D] text-[#2A020D] hover:bg-[#f1f7ff]"
      }`}
    >
      Lender
    </button>
    </div>
  );
}
