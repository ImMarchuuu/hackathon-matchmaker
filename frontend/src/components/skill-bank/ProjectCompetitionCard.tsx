"use client";

import React from "react";
import Link from "next/link";

export interface ProjectCompetitionCardProps {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  githubUrl?: string;
}

export default function ProjectCompetitionCard({
  id,
  title,
  subtitle,
  date,
  githubUrl = "https://github.com",
}: ProjectCompetitionCardProps) {
  return (
    <Link
      href={`/projects/${id}`}
      className="flex flex-row justify-between items-center bg-white border border-slate-300 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.05)] p-4 sm:p-5 hover:bg-slate-50 transition-all cursor-pointer w-full text-left"
    >
      {/* ── Left Column (Vertical Stack) ── */}
      <div className="flex flex-col min-w-0 pr-4">
        {/* Title */}
        <h3 className="text-base sm:text-lg font-semibold text-[#0B1A42] leading-snug truncate">
          {title}
        </h3>
        {/* Subtitle */}
        <span className="text-xs sm:text-sm text-teal-500 font-medium mt-1">
          {subtitle}
        </span>
        {/* Date */}
        <span className="text-[10px] sm:text-xs text-slate-400 mt-1">
          {date}
        </span>
      </div>

      {/* ── Right Column (Vertical Stack, Aligned Right) ── */}
      <div className="flex flex-col items-end justify-between self-stretch shrink-0 min-h-[56px]">
        {/* Top: Spacer */}
        <div className="h-4" />

        {/* Bottom: View Project Link with Folder Icon */}
        <div className="flex items-center gap-1.5 text-[#0B1A42] text-xs sm:text-sm font-semibold mt-auto">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
            />
          </svg>
          <span>View Project</span>
        </div>
      </div>
    </Link>
  );
}
