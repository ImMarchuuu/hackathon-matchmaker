"use client";

import React, { useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { mockTeams, mockUsers, CURRENT_USER_ID } from "@/data/mockData";
import { RoleIcon, SkillIcon } from "@/components/Icons";

export default function TeamDetailPage({ params }: { params: { id: string } }) {
  const team = mockTeams.find((t) => t.id === params.id);

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [ratings, setRatings] = useState<Record<string, number>>({});

  if (!team) {
    notFound();
  }

  const leader = mockUsers[team.leaderId];

  const startDateStr = new Date(team.startDate).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const endDateStr = new Date(team.endDate).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const dateRange = `${startDateStr} - ${endDateStr}`;

  const reviewMembers = team.currentMemberIds.filter(id => id !== CURRENT_USER_ID);
  const allRated = reviewMembers.length > 0 && reviewMembers.every(id => ratings[id] > 0);

  const handleRating = (memberId: string, rating: number) => {
    setRatings(prev => ({ ...prev, [memberId]: rating }));
  };

  const handleSubmitReview = () => {
    setIsReviewModalOpen(false);
  };

  return (
    <div className="w-full min-h-screen bg-[#f4f6f8] py-8 px-4 sm:px-6 flex flex-col items-center relative">
      {/* ── Header Navigation ── */}
      <div className="w-full max-w-4xl flex items-center justify-between mb-6 relative">
        <Link
          href="/active-teams"
          className="absolute left-0 flex items-center gap-1.5 px-4 py-2 rounded-full bg-white shadow-sm text-[#1b3168] font-bold text-sm hover:bg-gray-50 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          ย้อนกลับ
        </Link>
        <h1 className="w-full text-center text-[#1b3168] font-black text-xl">รายละเอียดทีม</h1>
      </div>

      {/* ── Main Card ── */}
      <div className="w-full max-w-4xl bg-white rounded-[2rem] shadow-sm p-6 sm:p-10 border border-gray-100 flex flex-col gap-8">

        {/* ── Top Info Section ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border border-gray-200 shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={leader?.avatarUrl ?? "https://i.pravatar.cc/150"} alt={team.title} className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col">
              <h2 className="text-2xl sm:text-3xl font-black text-[#1b3168]">{team.title}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[#1b3168] font-bold">{leader?.name}</span>
                <span className="text-gray-400 font-medium">(กัปตัน)</span>
              </div>
              <p className="text-blue-400 text-sm font-semibold mt-1">{dateRange}</p>
            </div>
          </div>

          <div className="shrink-0 self-start sm:self-center">
            <span className={`px-5 py-2 rounded-full text-sm font-bold shadow-sm tracking-wide ${team.status === "IN_PROGRESS" ? "bg-[#ffefc2] text-[#d49900]" : "bg-orange-100 text-orange-600"}`}>
              {team.status === "IN_PROGRESS" ? "กำลังดำเนินการ" : "รอเริ่ม"}
            </span>
          </div>
        </div>

        {/* ── Description ── */}
        {team.description && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-[#1b3168]">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" /></svg>
              <h3 className="font-extrabold text-sm tracking-wide">Description</h3>
            </div>
            <div className="bg-slate-50 text-gray-600 text-sm leading-relaxed p-5 rounded-2xl border border-gray-100">
              {team.description}
            </div>
          </div>
        )}

        <hr className="border-gray-100" />

        {/* ── Tags and Members (Side by Side on Desktop) ── */}
        <div className="flex flex-col md:flex-row gap-8">

          {/* Left: Tags */}
          <div className="flex-1 flex flex-col gap-6">
            <div className="flex items-center gap-2 text-[#1b3168]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              <h3 className="font-extrabold text-sm tracking-wide">Role & Skill Tags</h3>
            </div>

            <div className="flex flex-col gap-4">
              {/* Role Tags (Unfiltered) */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-1.5">
                  <RoleIcon className="w-4 h-4 text-[#1b3168]" />
                  <span className="text-[#1b3168] font-bold text-xs">Role</span>
                </div>
                {team.requiredRoles.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {team.requiredRoles.map((role: string, idx: number) => (
                      <span key={idx} className="bg-white border border-blue-100 shadow-sm text-[#2c52ed] text-xs font-bold px-4 py-1.5 rounded-full flex items-center justify-center whitespace-nowrap">
                        {role}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-gray-400 text-xs italic">No roles specified</span>
                )}
              </div>

              {/* Skill Tags (Unfiltered) */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-1.5">
                  <SkillIcon className="w-4 h-4 text-[#1b3168]" />
                  <span className="text-[#1b3168] font-bold text-xs">Skill</span>
                </div>
                {team.requiredSkills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {team.requiredSkills.map((skill: string, idx: number) => (
                      <span key={idx} className="bg-white border border-gray-200 shadow-sm text-gray-500 text-xs font-bold px-4 py-1.5 rounded-full flex items-center justify-center whitespace-nowrap">
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-gray-400 text-xs italic">No skills specified</span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Detailed Members */}
          <div className="flex-1 flex flex-col gap-4">
            <div className="flex items-center gap-2 text-[#1b3168]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              <h3 className="font-extrabold text-sm tracking-wide">Member {team.currentMemberIds.length}/{team.maxMembers}</h3>
            </div>
            <div className="flex flex-col gap-2 bg-gray-50/50 p-3 rounded-2xl border border-gray-100">
              {team.currentMemberIds.map((memberId: string) => {
                const member = mockUsers[memberId];
                if (!member) return null;
                const primaryRole = member.roles[0] || "Member";
                return (
                  <Link key={memberId} href={`/profile/${memberId}`} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-white shadow-sm hover:border-blue-200 transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-gray-200">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={member.avatarUrl} alt={member.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[#1b3168] font-bold text-sm leading-none group-hover:text-[#2c52ed] transition-colors">{member.name}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-3 py-1 rounded-full whitespace-nowrap">
                        {primaryRole}
                      </span>
                      <div className="flex items-center gap-1.5 w-10 justify-end">
                        <span className="font-bold text-[#1b3168] text-sm">{Number(member.skillBank.softSkillScore).toFixed(1)}</span>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/star-icon.svg" alt="star" className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

        </div>

        {/* ── Bottom Action ── */}
        <div className="flex justify-end mt-4">
          <button
            onClick={() => {
              if (team.status === "IN_PROGRESS") {
                setIsReviewModalOpen(true);
              }
            }}
            disabled={team.status !== "IN_PROGRESS"}
            className={`font-bold text-sm px-8 py-3 rounded-full shadow-md transition-colors tracking-wide ${team.status === "IN_PROGRESS"
                ? "bg-red-500 hover:bg-red-600 text-white cursor-pointer"
                : "bg-red-400 text-white/80 opacity-50 cursor-not-allowed"
              }`}
          >
            จบการแข่งขัน
          </button>
        </div>

      </div>

      {/* ── Teammate Review Modal ── */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md relative p-6 sm:p-8 shadow-2xl overflow-hidden flex flex-col">

            {/* Close Button */}
            <button
              onClick={() => setIsReviewModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full border-2 border-red-500 text-red-500 flex items-center justify-center hover:bg-red-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Header */}
            <h2 className="text-xl font-black text-[#1b3168] text-center mb-6">รีวิวเพื่อนร่วมทีม</h2>

            {/* Teammate List */}
            <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              {reviewMembers.length > 0 ? (
                reviewMembers.map(memberId => {
                  const member = mockUsers[memberId];
                  if (!member) return null;
                  const currentRating = ratings[memberId] || 0;
                  const primaryRole = member.roles[0] || "Member";

                  return (
                    <div key={memberId} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl border border-gray-100 bg-gray-50/50">

                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border border-gray-200">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={member.avatarUrl} alt={member.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex flex-col items-start gap-1">
                          <span className="text-[#1b3168] font-bold text-sm leading-none">{member.name}</span>
                          <span className="border border-[#1b3168] text-[#1b3168] rounded-md px-2 py-0.5 text-[10px] font-bold whitespace-nowrap">
                            {primaryRole}
                          </span>
                        </div>
                      </div>

                      {/* Stars */}
                      <div className="flex items-center gap-1 self-end sm:self-auto">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => handleRating(memberId, star)}
                            className={`w-6 h-6 transition-colors ${star <= currentRating ? "text-yellow-400" : "text-gray-300 hover:text-yellow-200"}`}
                          >
                            <svg fill={star <= currentRating ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={star <= currentRating ? 0 : 2} className="w-full h-full">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                          </button>
                        ))}
                      </div>

                    </div>
                  );
                })
              ) : (
                <p className="text-gray-500 text-sm text-center py-4 italic">No teammates to review.</p>
              )}
            </div>

            {/* Confirm Button */}
            <button
              onClick={handleSubmitReview}
              disabled={!allRated}
              className={`mt-6 w-full py-3.5 rounded-full font-bold tracking-wide transition-all ${allRated
                  ? "bg-[#1b3168] hover:bg-[#12224f] text-white shadow-md"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
            >
              ยืนยัน
            </button>

          </div>
        </div>
      )}
    </div>
  );
}
