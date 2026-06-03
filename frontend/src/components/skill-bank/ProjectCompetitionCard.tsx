"use client";

import React from "react";

export interface ProjectCompetitionCardProps {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  githubUrl?: string;
}

export default function ProjectCompetitionCard({
  title,
  subtitle,
  date,
  githubUrl,
}: ProjectCompetitionCardProps) {
  return (
    <div className="flex flex-row justify-between items-center bg-white border border-slate-300 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.05)] p-4 sm:p-5 w-full">
      {/* ── Left Column ── */}
      <div className="flex flex-col min-w-0 pr-4">
        <h3 className="text-base sm:text-lg font-semibold text-[#0B1A42] leading-snug truncate">
          {title}
        </h3>
        <span className="text-xs sm:text-sm text-teal-500 font-medium mt-1">
          {subtitle}
        </span>
        <span className="text-[10px] sm:text-xs text-slate-400 mt-1">
          {date}
        </span>
      </div>

      {/* ── Right Column ── */}
      <div className="flex flex-col items-end justify-end self-stretch shrink-0 min-h-[56px]">
        {githubUrl ? (
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-[#0B1A42] text-xs sm:text-sm font-semibold hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.372.79 1.102.79 2.222v3.293c0 .319.23.57.75.576 4.765-1.589 8.195-6.086 8.195-11.386 0-6.627-5.373-12-12-12" />
            </svg>
            <span>View Project</span>
          </a>
        ) : (
          <span className="text-xs text-slate-300 font-medium">No link</span>
        )}
      </div>
    </div>
  );
}
