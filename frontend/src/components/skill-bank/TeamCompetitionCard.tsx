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
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function TeamCompetitionCard({
  id,
  title,
  subtitle,
  date,
  status,
  members,
  onEdit,
  onDelete,
}: TeamCompetitionCardProps) {
  const isPending = status === "Pending";

  return (
    <div className="flex flex-row justify-between items-center bg-white border border-slate-300 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.05)] p-4 sm:p-5 w-full">
      {/* ── Left Column — navigates to team page ── */}
      <Link href={`/teams/${id}`} className="flex flex-col min-w-0 pr-4 flex-1 hover:opacity-80 transition-opacity">
        <h3 className="text-base sm:text-lg font-semibold text-[#0B1A42] leading-snug truncate">
          {title}
        </h3>
        <span className="text-xs sm:text-sm text-orange-400 font-semibold mt-1">
          {subtitle}
        </span>
        <span className="text-[10px] sm:text-xs text-slate-400 mt-1">
          {date}
        </span>
      </Link>

      {/* ── Right Column ── */}
      <div className="flex flex-col items-end justify-between self-stretch shrink-0 min-h-[56px]">
        {/* Top: Actions + Status */}
        <div className="flex items-center gap-1">
          {onEdit && (
            <button
              onClick={onEdit}
              className="p-1.5 rounded-lg text-gray-400 hover:text-[#1b3168] hover:bg-gray-100 transition-colors"
              aria-label="Edit"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              aria-label="Delete"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
          {isPending ? (
            <div className="flex items-center gap-1 text-orange-400 text-[11px] sm:text-xs font-semibold ml-1">
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <circle cx="12" cy="12" r="10" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
              </svg>
              <span>รอการรีวิว</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-emerald-600 text-[11px] sm:text-xs font-semibold ml-1">
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>เสร็จสิ้น</span>
            </div>
          )}
        </div>

        {/* Bottom: Member count */}
        <div className="flex items-center gap-1.5 text-[#0B1A42] text-xs sm:text-sm font-semibold mt-auto">
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span>{members} คน</span>
        </div>
      </div>
    </div>
  );
}
