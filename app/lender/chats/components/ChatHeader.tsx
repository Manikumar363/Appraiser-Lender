import { BuildingIcon, BuildingIcon2 } from "../../../../components/icons";
import { JobDetails, Participant } from "./types";

interface ChatHeaderProps {
  jobDetails: JobDetails;
  jobId: string;
  participants: Participant[];
}

export default function ChatHeader({ jobDetails, jobId, participants }: ChatHeaderProps) {
  return (
    <div className="flex justify-center pb-4 w-full">
      <div className="bg-[#2A020D] rounded-2xl px-8 py-4 flex items-center justify-between shadow w-full max-w-6xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-cyan-50 rounded-full flex items-center justify-center">
            <BuildingIcon2 className="w-6 h-6 text-[#2A020D]" />
          </div>
          <div>
            <div className="text-white font-semibold text-base">
              {jobDetails.title}
            </div>
            <div className="text-white text-xs opacity-80">
              {jobDetails.location}
            </div>
          </div>
        </div>
        <div className="flex -space-x-3">
          {participants.map((participant) => (
            <img
              key={participant.id}
              src={participant.avatar}
              alt={participant.name}
              className="w-8 h-8 rounded-full border-2 border-white object-cover"
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
