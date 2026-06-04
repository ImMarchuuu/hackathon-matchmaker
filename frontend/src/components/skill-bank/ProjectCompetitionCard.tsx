"use client";

import React from "react";

export interface ProjectCompetitionCardProps {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  githubUrl?: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function ProjectCompetitionCard({
  title,
  subtitle,
  date,
  githubUrl,
  onEdit,
  onDelete,
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
      <div className="flex flex-col items-end justify-between self-stretch shrink-0 min-h-[56px]">
        {/* Actions */}
        {(onEdit || onDelete) && (
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
          </div>
        )}

        {/* GitHub link */}
        <div className="mt-auto">
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
    </div>
  );
}
