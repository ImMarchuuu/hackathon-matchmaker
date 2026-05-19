"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import MyRoleSection from "@/components/profile/MyRoleSection";
import SkillRankSection from "@/components/profile/SkillRankSection";
import CompetitionSection from "@/components/profile/CompetitionSection";
import ActiveTeamSection from "@/components/profile/ActiveTeamSection";
import { CURRENT_USER_ID, mockUsers, mockPendingRequests, mockTeams, User } from "@/data/mockData";

export default function DynamicProfilePage({ params }: { params: { id: string } }) {
  const profileId = params.id;
  const user = mockUsers[profileId];

  if (!user) {
    notFound();
  }

  const isCurrentUser = profileId === CURRENT_USER_ID;

  // Check if viewing another user and there's a pending request
  const pendingRequest = mockPendingRequests.find(
    req => req.requesterId === profileId && req.targetOwnerId === CURRENT_USER_ID
  );

  const showActionBanner = !isCurrentUser && !!pendingRequest;

  // Build active teams for this profile's Section 8
  const activeTeams = mockTeams
    .filter((t) => t.currentMemberIds.includes(profileId))
    .map((t) => {
      const start = new Date(t.startDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
      const end = new Date(t.endDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
      return {
        id: t.id,
        teamName: t.title,
        dateRange: `${start} - ${end}`,
        daysLeft: t.daysLeft,
        currentMembers: t.currentMemberIds.length,
        maxMembers: t.maxMembers,
      };
    });

  return (
    <div className="w-full min-h-screen bg-[#f4f6f8] py-0 px-0 sm:py-8 sm:px-6">
      <div className="flex flex-col w-full max-w-5xl mx-auto bg-white rounded-none sm:rounded-[2rem] border-0 sm:border border-gray-200 shadow-sm overflow-hidden pb-10">
        {/* ═══════════════════════════════════════════
            Section 1: Cover Photo + Avatar
            ═══════════════════════════════════════════ */}
        <section className="relative w-full" aria-label="Cover photo and avatar">
          <div className="w-full aspect-[4/1] overflow-hidden relative bg-blue-100 rounded-none sm:rounded-t-[2rem]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={user.coverImage || "/cover-bg.png"} alt="Cover Photo" className="w-full h-full object-cover object-center" />
          </div>

          <div className="absolute -bottom-16 left-6 sm:left-12">
            <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-white shadow-sm shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={user.avatarUrl} alt="Profile Picture" className="w-full h-full object-cover" />
            </div>
          </div>
        </section>

        {/* ส่วนเนื้อหาด้านล่างทั้งหมด */}
        <div className="w-full px-6 sm:px-12 flex flex-col mt-20 space-y-8">

          {/* ═══════════════════════════════════════════
            Section 2: User Info Header
            ═══════════════════════════════════════════ */}
          <section className="flex items-start justify-between w-full" aria-label="User information">
            <div className="text-left">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#233876] tracking-tight">{user.name}</h1>
              <p className="text-sm sm:text-base text-[#233876] flex items-center gap-1.5 mt-1 font-semibold">
                <span className="flex items-center justify-center w-5 h-5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </span>
                Teammate
              </p>
            </div>

            <div className="flex items-center gap-3 pt-1">
              {isCurrentUser && (
                <Link
                  href="/profile/edit"
                  className="px-6 py-2 rounded-full bg-[#233876] text-white text-sm font-bold hover:bg-[#1a2a5c] transition-all"
                >
                  edit profile
                </Link>
              )}
              <button
                className="p-2.5 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors shadow-sm"
                aria-label="Share profile"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </button>
            </div>
          </section>

          {/* ═══════════════════════════════════════════
            Section 3: Bio
            ═══════════════════════════════════════════ */}
          <section className="w-full">
            <div className="rounded-[1.25rem] border border-gray-200 bg-white p-8 min-h-[100px] flex items-center justify-center text-center">
              <p className="text-[#233876] font-medium text-base">
                {user.bio}
              </p>
            </div>
          </section>

          {/* ═══════════════════════════════════════════
            Section 3.5: Profile Action Banner (Pending Request)
            ═══════════════════════════════════════════ */}
          {showActionBanner && (
            <section className="w-full">
              <div className="rounded-[2rem] border border-[#c1d3e8] bg-[#f0f6fc] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#1b3168]/10 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-[#1b3168]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <p className="text-[#1b3168] font-bold text-sm">
                    คำขอเข้าร่วมทีม: <span className="font-semibold text-gray-700">{user.name} ขอเข้าร่วมทีม <span className="text-[#1b3168] font-bold">{pendingRequest.teamName}</span> ของคุณ</span>
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <button className="flex items-center justify-center gap-1.5 w-full md:w-auto px-5 py-2.5 rounded-full bg-[#1b3168] text-white text-xs font-bold tracking-wide hover:bg-[#12224f] transition-all shadow-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    ตอบรับ
                  </button>
                  <button className="flex items-center justify-center gap-1.5 w-full md:w-auto px-5 py-2.5 rounded-full border-2 border-gray-200 bg-white text-gray-600 text-xs font-bold tracking-wide hover:bg-gray-50 hover:text-red-500 hover:border-red-200 transition-all shadow-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    ปฏิเสธ
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* ═══════════════════════════════════════════
            Section 4 & 5: Details & Contact
            ═══════════════════════════════════════════ */}
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 px-6 sm:px-12">
            <section className="space-y-4 text-left" aria-label="Personal details">
              <h2 className="text-xl font-bold text-[#233876] tracking-wide">Personal details</h2>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-[#233876] font-semibold text-sm">
                  <svg className="w-5 h-5 text-[#233876]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path d="M12 14l9-5-9-5-9 5 9 5z" />
                    <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                  </svg>
                  {user.university}
                </li>
                <li className="flex items-center gap-3 text-[#233876] font-semibold text-sm">
                  <svg className="w-5 h-5 text-[#233876]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {user.birthDate}
                </li>
              </ul>
            </section>

            <section className="space-y-4 text-left" aria-label="Contact information">
              <h2 className="text-xl font-bold text-[#233876] tracking-wide">contact</h2>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-[#233876] font-semibold text-sm hover:underline cursor-pointer">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {user.email}
                </li>
                {user.github && (
                  <li className="flex items-center gap-3 text-[#233876] font-semibold text-sm hover:underline cursor-pointer">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.372.79 1.102.79 2.222v3.293c0 .319.23.57.75.576 4.765-1.589 8.195-6.086 8.195-11.386 0-6.627-5.373-12-12-12" />
                    </svg>
                    {user.github}
                  </li>
                )}
                {user.linkedin && (
                  <li className="flex items-center gap-3 text-[#233876] font-semibold text-sm hover:underline cursor-pointer">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                    {user.linkedin}
                  </li>
                )}
              </ul>
            </section>
          </div>

          {/* ═══════════════════════════════════════════
            Section 6: Role & Skills
            ═══════════════════════════════════════════ */}
          <div className="w-full flex flex-col lg:flex-row gap-8 mt-12 pt-8 border-t border-gray-100">
            <MyRoleSection
              roles={user.roles}
            />
            <SkillRankSection
              skills={user.skillBank.hardSkills.map(s => ({ name: s.name, rank: s.level as any }))}
            />
          </div>

          {/* ═══════════════════════════════════════════
            Section 7: Competition
            ═══════════════════════════════════════════ */}
          <div className="w-full mt-4">
            <CompetitionSection
              competitions={[
                { name: "Pirate Hackathon", date: "9 May 2024" },
                { name: "Superman Engineer", date: "1 May 2024" }
              ]}
            />
          </div>

          {/* ═══════════════════════════════════════════
            Section 8: Active Team
            ═══════════════════════════════════════════ */}
          <div className="w-full pb-4 mt-4">
            <ActiveTeamSection teams={activeTeams} />
          </div>
        </div>
      </div>
    </div>
  );
}
