import { Job, JobFilter } from "../../../lib/api/jobs1";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BuildingIcon, MapIcon, MessageIcon, CalendarIcon, LoadIcon, RightArrow } from "@/components/icons";
import { Plus } from "lucide-react";

interface JobsContentProps {
  jobs: Job[];
  loading: boolean;
  error: string;
  searchQuery: string;
  activeFilter: JobFilter;
  setActiveFilter: (f: JobFilter) => void;
  onNewJob: () => void;
}

function getCityCountry(address: string) {
  const parts = address.split(",").map(part => part.trim());
  if (parts.length >= 3) {
    return parts[2] + ", " + parts[parts.length - 1];
  }
  return address;
}

export default function JobsContent({
  jobs,
  loading,
  error,
  searchQuery,
  activeFilter,
  setActiveFilter,
  onNewJob,
}: JobsContentProps) {
  const router = useRouter();

  const filteredJobs = jobs.filter(
    (job) =>
      job.property_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.job_status?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-6">Loading jobs...</div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-red-500">Error: {error}</div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-[calc(80vh-14px)] p-3">
      <div className="flex-1">
        {/* Filter Tabs */}
        <div className="flex gap-4 mb-8">
          {(
            [
              { key: "All", label: "All" },
              { key: "in-progress", label: "In Progress" },
              { key: "completed", label: "Completed" },
              { key: "cancelled", label: "Cancelled" },
            ] as { key: JobFilter; label: string }[]
          ).map((f) => (
            <Button
              key={f.key}
              className={`w-full py-6 rounded-full ${
                activeFilter === f.key
                  ? "bg-[#2A020D] hover:bg-[#4e1b29] text-white"
                  : "border-[#2A020D] text-[#2A020D] hover:bg-[#FBEFF2] bg-transparent border"
              }`}
              onClick={() => setActiveFilter(f.key)}
            >
              {f.label}
            </Button>
          ))}
        </div>

        {/* Jobs List */}
        {filteredJobs.length === 0 && (
          <div className="flex items-center justify-center py-24">
            <span className="text-gray-500 text-xl font-medium">
              No jobs found.
            </span>
          </div>
        )}
        {filteredJobs.map((job) => (
          <div key={job.id} className="bg-[#FBEFF2] rounded-xl p-2 shadow border border-[#E6F9F3] hover:shadow-md transition-shadow mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-[#2A020D] rounded-full flex items-center justify-center">
                  <BuildingIcon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{job.property_type}</h3>
                  <p className="text-gray-600 text-sm">{job.address}</p>
                  {/* Status Badge below address */}
                  <div className="flex justify-start mt-3">
                    <Badge
                      className="px-3 py-2 rounded-full text-sm font-medium flex items-center text-white transition-colors cursor-pointer hover:brightness-110"
                      style={{
                        backgroundColor:
                          job.job_status?.toLowerCase() === "pending" ? "#FFC107"
                          : job.job_status?.toLowerCase() === "completed" ? "#22c55e"
                          : job.job_status?.toLowerCase() === "cancelled" ? "#ef4444"
                          : job.job_status?.toLowerCase() === "accepted" || job.job_status?.toLowerCase() === "active" ? "#00F90A"
                          : "#FFC107"
                      }}
                    >
                      <LoadIcon className="w-5 h-5 mr-2" />
                      {job.job_status?.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-nowrap">
                <Button variant="outline" size="sm" className="bg-[#FBEFF2] border border-[#2A020D] text-[#2A020D] rounded-full px-4 py-4 flex items-center gap-2 hover:bg-white transition-colors">
                  <MapIcon className="w-6 h-6 mr-1" />
                  {getCityCountry(job.address)}
                </Button>
                <Button variant="outline" size="sm" className="bg-[#FBEFF2] border border-[#2A020D] text-[#2A020D] rounded-full px-4 py-4 flex items-center gap-2 hover:bg-white transition-colors">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  {job.preferred_date ? new Date(job.preferred_date).toLocaleDateString() : "N/A"}
                </Button>
                <Button variant="outline" size="sm" className="bg-white border border-[#2A020D] text-[#2A020D] rounded-full px-4 py-4 flex items-center gap-2 hover:bg-[#FBEFF2] transition-colors"
                  onClick={() => router.push(`/lender/chats/${job.id}`)}>
                  <MessageIcon className="w-5 h-5 me-1" />
                  Message
                </Button>
                <Button
                  variant="ghost"
                  size="lg"
                  className="bg-white text-[#2A020D] hover:bg-[#FBEFF2] p-0 rounded-full flex items-center justify-center transition-colors w-[40px] h-[40px] shadow"
                  onClick={() => router.push(`/lender/jobs/${job.id}`)}
                >
                  <span className="flex items-center justify-center w-[44px] h-[44px] rounded-full">
                    <RightArrow className="w-7 h-7" />
                  </span>
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="w-full pb-8">
        <button
          onClick={onNewJob}
          className="w-full bg-[#2A020D] text-white py-4 px-6 rounded-lg font-medium hover:bg-[#4e1b29] transition-colors flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          New Job Request
        </button>
      </div>
    </div>
  );
}