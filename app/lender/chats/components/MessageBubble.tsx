import { CheckCircle } from "lucide-react";
import { UIMessage, User } from "./types";

interface MessageBubbleProps {
  message: UIMessage;
  user: User | null;
}

export default function MessageBubble({ message, user }: MessageBubbleProps) {
  const isLender = message.senderRole === "lender";

  const getDisplayRole = (role: string) => {
    switch (role.toLowerCase()) {
      case "lender":
        return "Lender";
      case "appraiser":
        return "Appraiser";
      case "admin":
        return "Admin";
      default:
        return role.charAt(0).toUpperCase() + role.slice(1);
    }
  };

  return (
    <div
      className={`flex mb-3 sm:mb-4 ${isLender ? "justify-end" : "justify-start"}`}
    >
      {/* Avatar (left for non‑lender) */}
      {!isLender && (
        <img
          src={message.avatar}
          alt={message.senderName}
            className="
              rounded-full object-cover mr-2 sm:mr-3 flex-shrink-0
              w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10
            "
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/placeholder.svg";
          }}
        />
      )}

      {/* Bubble */}
      <div
        className={`
          flex flex-col
          max-w-[85%] sm:max-w-[70%] md:max-w-[60%] lg:max-w-md
          ${isLender ? "items-end" : "items-start"}
        `}
      >
        <div
          className={`
            rounded-2xl sm:rounded-[20px]
            px-3 py-2 sm:px-5 sm:py-3 md:px-6 md:py-4
            bg-[#FBEFF2] shadow-sm w-full
          `}
        >
          {/* Name + Role */}
          <div className="flex items-center justify-between gap-2 mb-2 md:mb-3">
            <span
              className="
                font-semibold truncate
                text-sm sm:text-base text-gray-900
              "
              title={message.senderName}
            >
              {message.senderName}
            </span>
            <span className="text-[11px] sm:text-xs md:text-sm font-medium text-[#2A020D] flex-shrink-0">
              {getDisplayRole(message.senderRole)}
            </span>
          </div>

          {/* Content */}
            <div
              className="
                text-sm sm:text-[15px] md:text-base
                text-gray-900 leading-relaxed
                break-words whitespace-pre-wrap
              "
            >
              {message.content}
            </div>

          {/* Time + Status */}
          <div className="flex justify-between items-center mt-2 md:mt-3">
            <span className="text-[10px] sm:text-xs text-gray-500">
              {message.timestamp}
            </span>
            <CheckCircle className="w-4 h-4 text-yellow-500 flex-shrink-0" />
          </div>
        </div>
      </div>

      {/* Avatar (right for lender) */}
      {isLender && (
        <img
          src={message.avatar}
          alt={message.senderName}
          className="
            rounded-full object-cover ml-2 sm:ml-3 flex-shrink-0
            w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10
          "
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/placeholder.svg";
          }}
        />
      )}
    </div>
  );
}