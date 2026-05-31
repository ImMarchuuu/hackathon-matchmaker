import React from "react";
import CompactActiveCard, { CompactActiveTeam } from "./CompactActiveCard";

interface ActiveTeamSectionProps {
  teams?: CompactActiveTeam[];
}

export default function ActiveTeamSection({ teams = [] }: ActiveTeamSectionProps) {
  return (
    <section className="w-full">
      {/* ── Divider ── */}
      <hr className="border-gray-200 my-12" />

      {/* ── Section Header ── */}
      <div className="flex items-center justify-center mb-8">
        <div className="bg-white border border-gray-200 px-8 py-2.5 rounded-full flex items-center gap-2.5 shadow-sm">
          <svg className="w-5 h-5 text-[#1b3168]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span className="text-[#1b3168] font-black text-sm tracking-widest uppercase">
            Active Team
          </span>
        </div>
      </div>

      {/* ── Card Grid ── */}
      {teams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          {teams.map((team) => (
            <CompactActiveCard key={team.id} {...team} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 border border-dashed border-gray-200 rounded-[2rem] bg-gray-50">
          <p className="text-sm font-medium text-gray-400 italic">
            No active teams at the moment.
          </p>
        </div>
      )}
    </section>
  );
}
