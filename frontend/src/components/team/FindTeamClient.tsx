"use client";

import { useState } from "react";
import Link from "next/link";
import TeamCard from "@/components/team/TeamCard";
import PersonCard from "@/components/team/PersonCard";
import type { TeamCardViewModel, PeopleCardViewModel } from "@/types";

type ActiveTab = "team" | "people";

const ALL_ROLES = ["Developer", "Business", "UI/UX Designer", "Marketing", "AI / Data", "Pitching"];

interface FindTeamClientProps {
  initialTeams: TeamCardViewModel[];
  initialPeople: PeopleCardViewModel[];
}

export default function FindTeamClient({ initialTeams, initialPeople }: FindTeamClientProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>("team");
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const toggleFilter = (role: string) => {
    setActiveFilters((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  // Filter teams by search + role filters
  const filteredTeams = initialTeams.filter((t) => {
    const matchesSearch =
      !searchQuery ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.authorName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      activeFilters.length === 0 ||
      activeFilters.some((f) => t.roles.includes(f));
    return matchesSearch && matchesFilter;
  });

  // Filter people by search
  const filteredPeople = initialPeople.filter((p) => {
    const matchesSearch =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      activeFilters.length === 0 ||
      activeFilters.some((f) => p.roleTags.includes(f));
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-8 w-full">
      {/* ── Search Bar Row ── */}
      <div className="flex items-center gap-3 w-full">
        <div className="relative flex-1">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1b3168]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search teams or people..."
            className="w-full pl-12 pr-4 py-3 rounded-[1rem] border border-gray-200 bg-white text-gray-700 text-sm focus:outline-none focus:border-[#1b3168] shadow-sm placeholder:text-gray-400"
          />
        </div>

        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className={`p-3 rounded-[1rem] border text-[#1b3168] hover:bg-gray-50 transition-colors shadow-sm shrink-0 ${
            activeFilters.length > 0
              ? "bg-[#1b3168] text-white border-[#1b3168] hover:bg-[#12224f]"
              : "bg-white border-gray-200"
          }`}
          aria-label="Toggle filter panel"
        >
          <svg className={`w-5 h-5 ${activeFilters.length > 0 ? "text-white" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
        </button>

        <Link
          href="/find-team/create"
          className="flex items-center gap-2 px-6 py-3 rounded-[1rem] bg-[#1b3168] text-white text-sm font-bold hover:bg-[#12224f] transition-colors shadow-sm shrink-0 whitespace-nowrap"
        >
          create +
        </Link>
      </div>

      {/* ── Filter Panel ── */}
      {isFilterOpen && (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-[#1b3168]">Filter by Role</h3>
            {activeFilters.length > 0 && (
              <button onClick={() => setActiveFilters([])} className="text-xs text-gray-400 hover:text-gray-600 font-semibold">
                Clear all
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {ALL_ROLES.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleFilter(tag)}
                className={`px-4 py-2 rounded-full border text-sm font-semibold transition-colors ${
                  activeFilters.includes(tag)
                    ? "bg-[#1b3168] text-white border-[#1b3168]"
                    : "border-gray-200 text-gray-600 hover:bg-[#1b3168] hover:text-white hover:border-[#1b3168]"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Tabs ── */}
      <div className="flex justify-center w-full">
        <div className="flex bg-[#EAEAEA] rounded-xl p-1 shrink-0 w-full max-w-[280px]">
          <button
            onClick={() => setActiveTab("team")}
            className={`flex-1 py-2.5 rounded-lg text-xs font-black tracking-widest transition-all ${
              activeTab === "team" ? "bg-[#1b3168] text-white shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            TEAM
          </button>
          <button
            onClick={() => setActiveTab("people")}
            className={`flex-1 py-2.5 rounded-lg text-xs font-black tracking-widest transition-all ${
              activeTab === "people" ? "bg-[#1b3168] text-white shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            PEOPLE
          </button>
        </div>
      </div>

      {/* ── Card Grid ── */}
      <section aria-label={activeTab === "team" ? "Team listings" : "People listings"}>
        {activeTab === "team" ? (
          filteredTeams.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full items-start">
              {filteredTeams.map((team) => (
                <TeamCard key={team.id} data={{
                  id: team.id,
                  avatarUrl: team.avatarUrl,
                  title: team.title,
                  authorName: team.authorName,
                  dateRange: team.dateRange,
                  daysLeft: team.daysLeft,
                  roles: team.roles,
                  skills: team.skills,
                  currentMembers: team.currentMemberCount,
                  maxMembers: team.maxMembers,
                  memberAvatars: team.memberAvatars,
                  description: team.description,
                  detailedMembers: team.detailedMembers,
                }} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
              <p className="text-gray-400 font-semibold text-sm">No teams match your filters</p>
            </div>
          )
        ) : filteredPeople.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full items-start">
            {filteredPeople.map((person) => (
              <PersonCard key={person.id} data={person} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
            <p className="text-gray-400 font-semibold text-sm">No people match your filters</p>
          </div>
        )}
      </section>
    </div>
  );
}
