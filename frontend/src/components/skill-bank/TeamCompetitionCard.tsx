"use client";

import React from "react";
import Link from "next/link";

export type CompetitionStatus = "Pending" | "Finished";

export interface TeamCompetitionCardProps {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  status: CompetitionStatus;
  members: number;
}

export default function TeamCompetitionCard({
  id,
  title,
  subtitle,
  date,
  status,
  members,
}: TeamCompetitionCardProps) {
  const isPending = status === "Pending";

  return (
    <Link
      href={`/teams/${id}`}
      className="flex flex-row justify-between items-center bg-white border border-slate-300 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.05)] p-4 sm:p-5 hover:bg-slate-50 transition-all cursor-pointer w-full text-left"
    >
      {/* ── Left Column (Vertical Stack) ── */}
      <div className="flex flex-col min-w-0 pr-4">
        {/* Title */}
        <h3 className="text-base sm:text-lg font-semibold text-[#0B1A42] leading-snug truncate">
          {title}
        </h3>
        {/* Subtitle */}
        <span className="text-xs sm:text-sm text-orange-400 font-semibold mt-1">
          {subtitle}
        </span>
        {/* Date */}
        <span className="text-[10px] sm:text-xs text-slate-400 mt-1">
          {date}
        </span>
      </div>

      {/* ── Right Column (Vertical Stack, Aligned Right) ── */}
      <div className="flex flex-col items-end justify-between self-stretch shrink-0 min-h-[56px]">
        {/* Top: Status indicator */}
        <div>
          {isPending ? (
            <div className="flex items-center gap-1 text-orange-400 text-[11px] sm:text-xs font-semibold">
              {/* Clock Icon */}
              <svg
                className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-400 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <circle cx="12" cy="12" r="10" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
              </svg>
              <span>รอการรีวิว</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-emerald-600 text-[11px] sm:text-xs font-semibold">
              {/* Check Circle Icon */}
              <svg
                className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>เสร็จสิ้น</span>
            </div>
          )}
        </div>

        {/* Bottom: Member Count with Users Icon */}
        <div className="flex items-center gap-1.5 text-[#0B1A42] text-xs sm:text-sm font-semibold mt-auto">
          {/* Users Icon */}
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5 text-[#0B1A42]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <span>{members} คน</span>
        </div>
      </div>
    </Link>
  );
}
