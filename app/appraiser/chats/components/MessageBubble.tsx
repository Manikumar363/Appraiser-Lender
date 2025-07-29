import { CheckCircle } from "lucide-react";
import { UIMessage, User } from "./types";

interface MessageBubbleProps {
  message: UIMessage;
  user: User | null;
}

export default function MessageBubble({ message, user }: MessageBubbleProps) {
  const isAppraiser = message.senderRole === "appraiser";
  const isCurrentUserAppraiser = user?.role === "appraiser" && isAppraiser;

  const getDisplayRole = (role: string) => {
    switch (role.toLowerCase()) {
      case "appraiser":
        return "Appraiser";
      case "lender":
        return "Lender";
      case "admin":
        return "Admin";
      default:
        return role.charAt(0).toUpperCase() + role.slice(1);
    }
  };

  return (
    <div
      className={`flex items-center mb-4 ${isAppraiser ? "justify-end" : "justify-start"}`}
    >
      {/* Avatar on left - aligned with center of bubble */}
      {!isAppraiser && (
        <img
          src={message.avatar}
          alt={message.senderName}
          className="w-10 h-10 rounded-full object-cover mr-3 flex-shrink-0"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "/placeholder.svg";
          }}
        />
      )}

      {/* Message Bubble Container */}
      <div className="flex flex-col max-w-md min-w-[280px]">
        <div className="rounded-[20px] px-6 py-4 bg-[#E9FFFD] shadow-sm">
          {/* Name & Role Row */}
          <div className="flex justify-between items-center mb-3">
            <span className="text-base font-bold text-gray-900 truncate mr-2">
              {message.senderName}
            </span>
            <span className="text-sm font-medium text-[#00F90A] flex-shrink-0">
              {getDisplayRole(message.senderRole)}
            </span>
          </div>
          
          {/* Message Content */}
          <div className="text-base text-gray-900 mb-3 leading-relaxed break-words">
            {message.content}
          </div>
          
          {/* Time & Status Row */}
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">{message.timestamp}</span>
           
              <CheckCircle className="w-4 h-4 text-yellow-500 flex-shrink-0" />
            
          </div>
        </div>
      </div>

      {/* Avatar on right - aligned with center of bubble */}
      {isAppraiser && (
        <img
          src={message.avatar}
          alt={message.senderName}
          className="w-10 h-10 rounded-full object-cover ml-3 flex-shrink-0"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "/placeholder.svg";
          }}
        />
      )}
    </div>
  );
}
