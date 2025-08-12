import { BuildingIcon } from "../../../../components/icons";
import { ChatJob } from "./types";
import { getParticipantAvatars } from "./utils";

interface ChatListItemProps {
  chat: ChatJob;
  onClick: (jobId: string) => void;
}

export default function ChatListItem({ chat, onClick }: ChatListItemProps) {
  const participantAvatars = getParticipantAvatars(chat.participants);

  return (
    <div
      className="bg-[#2A020D] rounded-2xl px-6 py-5 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer hover:bg-[#2A020D]"
      onClick={() => onClick(chat.jobId)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
            <BuildingIcon className="w-6 h-6 text-[#2A020D]" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">
              {chat.title}
            </h3>
            <p className="text-blue-100 text-sm">{chat.location}</p>
          </div>
        </div>
        
        <div className="flex -space-x-3">
          {participantAvatars.map((participant) => (
            <img
              key={participant.id}
              src={participant.image}
              alt={participant.name}
              className="min-w-9 h-10 rounded-full border-2 border-white object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/placeholder.svg';
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
