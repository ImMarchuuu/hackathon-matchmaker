"use client";

import { useRef } from "react";
import Link from "next/link";
import type { ApiCompetitionExperience } from "@/types/profile";

const ROLE_COLORS: Record<string, string> = {
  "Developer":      "bg-blue-500/20 text-blue-200",
  "Business":       "bg-green-500/20 text-green-200",
  "UI/UX Designer": "bg-purple-500/20 text-purple-200",
  "Marketing":      "bg-orange-500/20 text-orange-200",
  "AI / Data":      "bg-yellow-500/20 text-yellow-100",
  "Pitching":       "bg-red-500/20 text-red-200",
};

const ROLE_COLORS_LIGHT: Record<string, string> = {
  "Developer":      "bg-blue-50 text-blue-700",
  "Business":       "bg-green-50 text-green-700",
  "UI/UX Designer": "bg-purple-50 text-purple-700",
  "Marketing":      "bg-orange-50 text-orange-700",
  "AI / Data":      "bg-yellow-50 text-yellow-700",
  "Pitching":       "bg-red-50 text-red-700",
};

function fmtDate(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("en-GB", { month: "short", year: "numeric" });
}

interface CompetitionSectionProps {
  competitions: ApiCompetitionExperience[];
  allUsers?: unknown[];
  isCurrentUser: boolean;
  onUpdated: (updatedList: ApiCompetitionExperience[]) => void;
}

export default function CompetitionSection({ competitions, isCurrentUser }: CompetitionSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const sorted = [...competitions].sort((a, b) => {
    if (!a.date && !b.date) return 0;
    if (!a.date) return 1;
    if (!b.date) return -1;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  function scroll(dir: "left" | "right") {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -284 : 284, behavior: "smooth" });
  }

  return (
    <section className="w-full rounded-[1.5rem] bg-gradient-to-br from-[#0f1f55] via-[#1b3168] to-[#0d1a40] p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
          <h2 className="text-base font-extrabold text-white tracking-wide">Competition Experience</h2>
        </div>
        {isCurrentUser && (
          <Link href="/skill-bank" className="flex items-center gap-1 text-xs font-bold text-white/60 hover:text-white transition-colors">
            Manage
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        )}
      </div>

      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 border border-white/10 rounded-2xl">
          <p className="text-sm text-white/40 italic">No competition experience yet.</p>
          {isCurrentUser && (
            <Link href="/skill-bank" className="mt-3 px-5 py-2 rounded-full bg-white/10 text-white text-xs font-bold hover:bg-white/20 transition-colors">
              Add your first experience
            </Link>
          )}
        </div>
      ) : (
        <div className="relative group">
          {/* Left arrow */}
          <button
            onClick={() => scroll("left")}
            className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/10 backdrop-blur border border-white/20 shadow-lg flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-white/20"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Track */}
          <div
            ref={scrollRef}
            className="flex gap-3 overflow-x-auto pb-1"
            style={{ scrollSnapType: "x mandatory", scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {sorted.map((comp) => (
              <CompCard key={comp.id} comp={comp} />
            ))}
          </div>

          {/* Right arrow */}
          <button
            onClick={() => scroll("right")}
            className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/10 backdrop-blur border border-white/20 shadow-lg flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-white/20"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </section>
  );
}

function CompCard({ comp }: { comp: ApiCompetitionExperience }) {
  const isTeam = comp.type === "team";
  const date = fmtDate(comp.date);

  const card = (
    <div
      className={`flex-none w-64 h-[200px] rounded-2xl p-4 flex flex-col overflow-hidden transition-transform hover:scale-[1.02] cursor-pointer ${
        isTeam
          ? "bg-white/10 backdrop-blur border border-white/15 hover:bg-white/[0.15]"
          : "bg-white border border-gray-100 shadow-sm hover:shadow-md"
      }`}
      style={{ scrollSnapAlign: "start" }}
    >
      {/* Type badge + date row */}
      <div className="flex items-center justify-between mb-3 shrink-0">
        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-widest uppercase ${
          isTeam
            ? "bg-white/20 text-white"
            : "bg-[#1b3168]/10 text-[#1b3168]"
        }`}>
          {isTeam ? "Competition" : "Project"}
        </span>
        {date && (
          <span className={`text-[11px] font-medium ${isTeam ? "text-white/50" : "text-gray-400"}`}>
            {date}
          </span>
        )}
      </div>

      {/* Name */}
      <h3 className={`font-extrabold text-sm leading-snug line-clamp-2 mb-2 shrink-0 ${
        isTeam ? "text-white" : "text-[#1b3168]"
      }`}>
        {comp.competition_name}
      </h3>

      {/* Roles */}
      {comp.roles.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2 shrink-0">
          {comp.roles.slice(0, 3).map((r) => (
            <span key={r} className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              isTeam ? (ROLE_COLORS[r] ?? "bg-white/20 text-white") : (ROLE_COLORS_LIGHT[r] ?? "bg-gray-100 text-gray-600")
            }`}>
              {r}
            </span>
          ))}
        </div>
      )}

      {/* Skills — pushed to bottom */}
      <div className={`flex flex-wrap gap-1 mt-auto pt-2 border-t ${isTeam ? "border-white/10" : "border-gray-100"}`}>
        {comp.skills.slice(0, 3).map((s) => (
          <span key={s} className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
            isTeam ? "bg-white/10 text-white/70" : "bg-gray-50 text-gray-500 border border-gray-100"
          }`}>
            {s}
          </span>
        ))}
        {comp.skills.length > 3 && (
          <span className={`text-[10px] font-semibold ${isTeam ? "text-white/40" : "text-gray-400"}`}>
            +{comp.skills.length - 3}
          </span>
        )}
        {comp.skills.length === 0 && (
          // Footer link when no skills
          isTeam && comp.team_id ? (
            <span className="text-[10px] font-bold text-white/50 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              View Team
            </span>
          ) : comp.github_url ? (
            <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.372.79 1.102.79 2.222v3.293c0 .319.23.57.75.576 4.765-1.589 8.195-6.086 8.195-11.386 0-6.627-5.373-12-12-12" />
              </svg>
              GitHub
            </span>
          ) : null
        )}
      </div>
    </div>
  );

  if (isTeam && comp.team_id) return <Link href={`/teams/${comp.team_id}`}>{card}</Link>;
  if (!isTeam && comp.github_url) return <a href={comp.github_url} target="_blank" rel="noopener noreferrer">{card}</a>;
  return card;
}
