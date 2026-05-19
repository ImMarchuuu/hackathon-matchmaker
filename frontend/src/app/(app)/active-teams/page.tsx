"use client";

import ActiveTeamCard, { ActiveTeamCardData } from "@/components/team/ActiveTeamCard";
import { CURRENT_USER_ID, mockTeams, mockUsers } from "@/data/mockData";
import Link from "next/link";

// Build view-model from normalized Team data
function buildActiveCardData(team: typeof mockTeams[0]): ActiveTeamCardData {
  const leader = mockUsers[team.leaderId];
  const start = new Date(team.startDate).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
  const end = new Date(team.endDate).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });

  const memberAvatars = team.currentMemberIds
    .map((uid) => mockUsers[uid]?.avatarUrl)
    .filter(Boolean) as string[];

  const detailedMembers = team.currentMemberIds
    .map((uid) => mockUsers[uid])
    .filter(Boolean)
    .map((u) => ({
      name: u.name,
      avatar: u.avatarUrl,
      role: u.roles[0],
      score: u.skillBank.softSkillScore,
    }));

  return {
    id: team.id,
    avatarUrl: leader?.avatarUrl ?? "https://i.pravatar.cc/150",
    title: team.title,
    authorName: leader?.name ?? "Unknown",
    dateRange: `${start} - ${end}`,
    daysLeft: team.daysLeft,
    status: team.status,
    roles: team.requiredRoles,
    skills: team.requiredSkills,
    currentMembers: team.currentMemberIds.length,
    maxMembers: team.maxMembers,
    memberAvatars,
    description: team.description,
    detailedMembers,
  };
}

export default function ActiveTeamsPage() {
  // Only show teams where the current user is a member
  const myTeams = mockTeams.filter((t) =>
    t.currentMemberIds.includes(CURRENT_USER_ID)
  );

  return (
    <div className="w-full space-y-8 pb-12">
      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#1b3168] tracking-tight">
          ทีมที่เข้าร่วม
        </h1>
        <p className="text-sm text-gray-500 font-medium mt-0.5">
          {myTeams.length} ทีม
        </p>
      </div>

      {/* ── Status Summary Pills ── */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-xs font-bold px-4 py-2 rounded-full">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          กำลังแข่งขัน {myTeams.filter((t) => t.status === "IN_PROGRESS").length} ทีม
        </div>
        <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 text-orange-600 text-xs font-bold px-4 py-2 rounded-full">
          <span className="w-2 h-2 rounded-full bg-orange-400" />
          รอเริ่ม {myTeams.filter((t) => t.status === "WAITING").length} ทีม
        </div>
      </div>

      {/* ── Card Grid ── */}
      {myTeams.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full items-start">
          {myTeams.map((team) => (
            <ActiveTeamCard key={team.id} data={buildActiveCardData(team)} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
            </svg>
          </div>
          <p className="text-gray-400 font-semibold text-sm">ยังไม่ได้เข้าร่วมทีมใด</p>
          <Link
            href="/find-team"
            className="px-6 py-2.5 rounded-full bg-[#1b3168] text-white text-sm font-bold hover:bg-[#12224f] transition-colors shadow-sm"
          >
            ค้นหาทีม
          </Link>
        </div>
      )}
    </div>
  );
}
