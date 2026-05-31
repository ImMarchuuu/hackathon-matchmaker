import React from "react";

interface ActiveTeam {
  teamName: string;
  dateRange: string;
  daysLeft: number;
  status: string;
  memberCount: string;
  hasNotification?: boolean;
}

export default function ActiveTeamCard({
  teamName,
  dateRange,
  daysLeft,
  status,
  memberCount,
  hasNotification
}: ActiveTeam) {
  const getBadgeColor = (status: string) => {
    if (status === "กำลังประกาศ") return "bg-[#ffcc00] text-white";
    if (status === "กำลังร่วมทีม") return "bg-[#ff6600] text-white";
    return "bg-gray-400 text-white";
  };

  return (
    <div className="relative rounded-[2rem] border border-gray-200 bg-white p-6 shadow-sm flex flex-col justify-between w-full max-w-[360px] min-h-[140px] hover:shadow-md transition-shadow">
      {hasNotification && (
        <div className="absolute -top-3 right-6 w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center font-bold text-xs border-2 border-white shadow-sm z-10">
          2
        </div>
      )}
      
      <div className="flex justify-between items-start mb-6">
        <div className="flex flex-col">
          <h4 className="font-extrabold text-[#1b3168] text-lg sm:text-xl">{teamName}</h4>
          <p className="text-[10px] sm:text-xs text-gray-400 font-medium mt-1">{dateRange}</p>
        </div>
        <div className="flex flex-col items-center ml-4 min-w-[50px]">
          <span className={`font-extrabold text-base sm:text-lg leading-tight ${hasNotification ? 'text-red-500' : 'text-[#1b3168]'}`}>
            {daysLeft} วัน
          </span>
          <span className="text-gray-400 text-[9px] sm:text-[10px] font-medium">เวลาสิ้นสุด</span>
        </div>
      </div>

      <div className="flex justify-between items-end mt-auto">
        <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${getBadgeColor(status)} shadow-sm tracking-wide`}>
          {status}
        </span>
        <span className="text-sm font-bold text-gray-500">{memberCount}</span>
      </div>
    </div>
  );
}
