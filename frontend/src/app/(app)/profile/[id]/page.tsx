"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import MyRoleSection from "@/components/profile/MyRoleSection";
import SkillRankSection from "@/components/profile/SkillRankSection";
import CompetitionSection from "@/components/profile/CompetitionSection";
import ActiveTeamSection from "@/components/profile/ActiveTeamSection";
import { apiFetch } from "@/lib/api";
import type { ApiUser, ApiCompetitionExperience } from "@/types/profile";
import type { ApiTeam } from "@/types/team";
import type { ApiRankSummary } from "@/types/skill";
import type { CompactActiveTeam } from "@/components/profile/CompactActiveCard";
import type { RoleWithRank } from "@/components/profile/MyRoleSection";

export default function DynamicProfilePage({ params }: { params: { id: string } }) {
  const username = params.id;

  const [user, setUser] = useState<ApiUser | null>(null);
  const [me, setMe] = useState<ApiUser | null>(null);
  const [allUsers, setAllUsers] = useState<ApiUser[]>([]);
  const [competitions, setCompetitions] = useState<ApiCompetitionExperience[]>([]);

  function handleCompetitionUpdated(updatedList: ApiCompetitionExperience[]) {
    setCompetitions(updatedList);
    if (user) {
      // Re-fetch rank summary so role/skill sections reflect updated counts instantly
      apiFetch<ApiRankSummary>(`/api/v1/users/${user._id}/rank-summary`)
        .then(setRankSummary)
        .catch(() => {});
    }
  }
  const [teams, setTeams] = useState<CompactActiveTeam[]>([]);
  const [rankSummary, setRankSummary] = useState<ApiRankSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);

  function fmt(d: string) {
    return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  }

  function daysLeft(end: string) {
    return Math.max(0, Math.ceil((new Date(end).getTime() - Date.now()) / 86_400_000));
  }

  useEffect(() => {
    Promise.all([
      apiFetch<ApiUser>(`/api/v1/users/${username}`),
      apiFetch<ApiUser>("/api/v1/users/me").catch(() => null),
    ])
      .then(([profile, currentUser]) => {
        setUser(profile);
        setMe(currentUser);

        // non-critical secondary fetches — fail silently
        apiFetch<ApiCompetitionExperience[]>(`/api/v1/users/${profile._id}/competitions`)
          .then(setCompetitions)
          .catch(() => {});

        apiFetch<ApiTeam[]>(`/api/v1/users/${profile._id}/teams`)
          .then((apiTeams) => {
            const mapped = apiTeams
              .filter((t) => t.status === "WAITING" || t.status === "IN_PROGRESS")
              .map((t) => ({
                id: t._id,
                teamName: t.title,
                dateRange: `${fmt(t.start_date)} – ${fmt(t.end_date)}`,
                daysLeft: daysLeft(t.start_date),
                currentMembers: t.member_ids.length,
                maxMembers: t.max_members,
                status: t.status,
              }));
            mapped.sort((a, b) => a.daysLeft - b.daysLeft);
            setTeams(mapped);
          })
          .catch(() => {});

        apiFetch<ApiRankSummary>(`/api/v1/users/${profile._id}/rank-summary`)
          .then(setRankSummary)
          .catch(() => {});

        apiFetch<ApiUser[]>("/api/v1/users")
          .then(setAllUsers)
          .catch(() => {});
      })
      .catch(() => setMissing(true))
      .finally(() => setLoading(false));
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f6f8]">
        <div className="w-8 h-8 border-4 border-[#1b3168] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (missing || !user) return notFound();

  const isCurrentUser = !!me && me._id === user._id;

  // display_roles: explicit selection → else top-2 by project_count from rank summary
  const displayRoles: string[] =
    user.display_roles?.length
      ? user.display_roles.slice(0, 2)
      : (rankSummary?.roles ?? user.role)
          .slice()
          .sort((a, b) => (b as { project_count: number }).project_count - (a as { project_count: number }).project_count)
          .slice(0, 2)
          .map((r) => r.name);

  // Prefer live rank-summary data; fall back to stored user fields
  const roles: RoleWithRank[] = rankSummary
    ? rankSummary.roles.map((r) => ({ name: r.name, rank_title: r.rank_title }))
    : user.role.map((r) => ({ name: r.name, rank_title: r.rank_title }));

  const skills = rankSummary
    ? rankSummary.skills.map((s) => ({ name: s.name, rank: s.rank_title.toLowerCase() }))
    : user.skills.map((s) => ({ name: s.name, rank: s.rank_title.toLowerCase() }));

  return (
    <div className="w-full min-h-screen bg-[#f4f6f8] py-0 px-0 sm:py-8 sm:px-6">
      <div className="flex flex-col w-full max-w-5xl mx-auto bg-white rounded-none sm:rounded-[2rem] border-0 sm:border border-gray-200 shadow-sm overflow-hidden pb-10">

        {/* Section 1: Cover Photo + Avatar */}
        <section className="relative w-full" aria-label="Cover photo and avatar">
          <div className="w-full aspect-[4/1] overflow-hidden relative bg-blue-100 rounded-none sm:rounded-t-[2rem]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={user.cover_image ?? "/cover-bg.png"} alt="Cover Photo" className="w-full h-full object-cover object-center" />
          </div>
          <div className="absolute -bottom-16 left-6 sm:left-12">
            <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-white shadow-sm shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={user.avatar_url ?? "/avatar.png"} alt="Profile Picture" className="w-full h-full object-cover" />
            </div>
          </div>
        </section>

        <div className="w-full px-6 sm:px-12 flex flex-col mt-20 space-y-8">

          {/* Section 2: User Info Header */}
          <section className="flex items-start justify-between w-full" aria-label="User information">
            <div className="text-left">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#233876] tracking-tight">{user.name}</h1>
              {displayRoles.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {displayRoles.map((role) => (
                    <span
                      key={role}
                      className="px-3 py-1 rounded-full text-xs font-bold bg-[#1b3168] text-white"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              )}
              <p className="text-sm sm:text-base text-[#233876] flex items-center gap-1.5 mt-1 font-semibold">
                <span className="flex items-center justify-center w-5 h-5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </span>
                @{user.username}
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

          {/* Section 3: Bio */}
          <section className="w-full">
            <div className="rounded-[1.25rem] border border-gray-200 bg-white p-8 min-h-[100px] flex items-center justify-center text-center">
              <p className="text-[#233876] font-medium text-base">
                {user.bio ?? <span className="text-gray-400 italic">No bio yet.</span>}
              </p>
            </div>
          </section>

          {/* Section 4 & 5: Details & Contact */}
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 px-6 sm:px-12">
            <section className="space-y-4 text-left" aria-label="Personal details">
              <h2 className="text-xl font-bold text-[#233876] tracking-wide">Personal details</h2>
              <ul className="space-y-4">
                {user.university && (
                  <li className="flex items-center gap-3 text-[#233876] font-semibold text-sm">
                    <svg className="w-5 h-5 text-[#233876]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path d="M12 14l9-5-9-5-9 5 9 5z" />
                      <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                    </svg>
                    {user.university}
                  </li>
                )}
                {user.birth_date && (
                  <li className="flex items-center gap-3 text-[#233876] font-semibold text-sm">
                    <svg className="w-5 h-5 text-[#233876]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {user.birth_date}
                  </li>
                )}
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
                  <li>
                    <a
                      href={user.github.startsWith("http") ? user.github : `https://${user.github}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-[#233876] font-semibold text-sm hover:underline"
                    >
                      <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.372.79 1.102.79 2.222v3.293c0 .319.23.57.75.576 4.765-1.589 8.195-6.086 8.195-11.386 0-6.627-5.373-12-12-12" />
                      </svg>
                      {user.github}
                    </a>
                  </li>
                )}
                {user.linkedin && (
                  <li>
                    <a
                      href={user.linkedin.startsWith("http") ? user.linkedin : `https://${user.linkedin}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-[#233876] font-semibold text-sm hover:underline"
                    >
                      <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                      </svg>
                      {user.linkedin}
                    </a>
                  </li>
                )}
              </ul>
            </section>
          </div>

          {/* Section 6: Competition Experience (between personal details and role & skill) */}
          <div className="w-full pt-8 border-t border-gray-100">
            <CompetitionSection
              competitions={competitions}
              allUsers={allUsers}
              isCurrentUser={isCurrentUser}
              onUpdated={handleCompetitionUpdated}
            />
          </div>

          {/* Section 7: Role & Skills */}
          <div className="w-full flex flex-col lg:flex-row gap-8 pt-8 border-t border-gray-100">
            <MyRoleSection roles={roles} />
            <SkillRankSection skills={skills} />
          </div>

          {/* Section 8: Active Team */}
          <div className="w-full pb-4 mt-4">
            <ActiveTeamSection teams={teams} />
          </div>

        </div>
      </div>
    </div>
  );
}
