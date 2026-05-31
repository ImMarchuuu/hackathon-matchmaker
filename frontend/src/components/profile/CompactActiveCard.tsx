import React from "react";

export interface CompactActiveTeam {
  id: string;
  teamName: string;
  dateRange: string;
  daysLeft: number;
  currentMembers: number;
  maxMembers: number;
  status: "WAITING" | "IN_PROGRESS";
}

export default function CompactActiveCard({
  teamName,
  dateRange,
  daysLeft,
  currentMembers,
  maxMembers,
  status,
}: CompactActiveTeam) {
  return (
    <div className="bg-white border border-gray-100 rounded-[2rem] shadow-sm p-6 flex flex-col gap-2 hover:shadow-md transition-shadow">
      {/* ── Top Row: Team name + duration ── */}
      <div className="flex items-start justify-between gap-4">
        {/* Left: Team name */}
        <h4 className="font-extrabold text-[#1b3168] text-lg leading-tight line-clamp-2">
          {teamName}
        </h4>

        {/* Right: Duration */}
        <div className="flex flex-col items-end shrink-0 ml-2">
          <div className="flex items-center gap-1 text-[#1b3168]">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-extrabold text-base leading-none">{daysLeft} วัน</span>
          </div>
          <span className="text-#516BB1 text-[10px] font-medium mt-0.5 text-right">เวลาดำเนินงาน</span>
        </div>
      </div>

      {/* ── Middle Row: Date range ── */}
      <p className="text-#516BB1 text-xs font-medium -mt-2">{dateRange}</p>

      {/* ── Bottom Row: Status badge + member count ── */}
      <div className="flex items-center justify-between mt-auto pt-2">
        {/* Status badge */}
        <div className={`font-extrabold text-sm px-5 py-2 rounded-full shadow-sm tracking-wide whitespace-nowrap ${
          status === "IN_PROGRESS"
            ? "bg-[#FBBF24] text-white"
            : "bg-orange-100 text-orange-600"
        }`}>
          {status === "IN_PROGRESS" ? "กำลังร่วมทีม" : "รอเริ่ม"}
        </div>

        {/* Member count */}
        <div className="flex items-center gap-1.5 text-[#1b3168] font-black text-sm">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <span>{currentMembers}/{maxMembers} <span className="font-semibold text-gray-500">คน</span></span>
        </div>
      </div>
    </div>
  );
}
