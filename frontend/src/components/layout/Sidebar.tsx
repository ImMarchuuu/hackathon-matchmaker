"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { PROFILE_UPDATED_EVENT } from "@/lib/profile-events";
import type { ApiUser } from "@/types/profile";
import type { ApiTeam } from "@/types/team";

export default function Sidebar({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) {
  const pathname = usePathname();
  const [isSkillBankOpen, setSkillBankOpen] = useState(false);
  const [isFindTeamOpen, setFindTeamOpen] = useState(false);

  const [user, setUser] = useState<ApiUser | null>(null);
  const [teams, setTeams] = useState<ApiTeam[]>([]);
  const [userMap, setUserMap] = useState<Record<string, ApiUser>>({});

  useEffect(() => {
    apiFetch<ApiUser>("/api/v1/users/me")
      .then(async (me) => {
        setUser(me);
        const [apiTeams, apiUsers] = await Promise.all([
          apiFetch<ApiTeam[]>(`/api/v1/users/${me._id}/teams`),
          apiFetch<ApiUser[]>("/api/v1/users"),
        ]);
        setTeams(apiTeams.slice(0, 3));
        setUserMap(Object.fromEntries(apiUsers.map((u) => [u._id, u])));
      })
      .catch(() => {});
  }, []);

  // Refresh the current user (avatar/name) when the profile is edited.
  useEffect(() => {
    const reloadUser = () =>
      apiFetch<ApiUser>("/api/v1/users/me").then(setUser).catch(() => {});
    window.addEventListener(PROFILE_UPDATED_EVENT, reloadUser);
    return () => window.removeEventListener(PROFILE_UPDATED_EVENT, reloadUser);
  }, []);

  const visibleTeams = teams.slice(0, 3);
  const remainingCount = Math.max(0, teams.length - 3);

  const rankOverall = user?.rank_overall ?? "Bronze";
  const roleCount   = user?.role.length ?? 0;
  const skillCount  = user?.skills.length ?? 0;

  async function handleLogout() {
    try {
      await apiFetch("/api/v1/auth/logout", { method: "POST" });
    } catch {
      // fail-safe — still clear and redirect
    }
    document.cookie = "grandline_auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    onClose?.();
    window.location.href = "/login";
  }

  return (
    <>
      {/* ── Backdrop overlay (mobile only) ── */}
      <div
        className={`
          fixed inset-0 z-40 bg-slate-900/60 lg:hidden
          transition-opacity duration-300 ease-in-out
          ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
        `}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* ── Sidebar panel ── */}
      <aside
        className={`
          fixed top-0 bottom-0 left-0 w-[75%] max-w-sm bg-white shadow-xl flex flex-col z-50 overflow-y-auto
          transition-transform duration-300 ease-in-out lg:hidden
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 bg-theme-gradient">
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/Logo.svg" alt="Grand Line Logo" className="h-7 object-contain" />
          </div>
          <button
            className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
            onClick={onClose}
            aria-label="Close menu"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        {/* ── User Profile Header ── */}
        <Link href="/profile" onClick={onClose} className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
          <div className="w-16 h-16 rounded-full overflow-hidden border border-gray-200 shadow-sm shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={user?.avatar_url ?? "/profile.svg"} alt="Profile" className="w-full h-full object-cover" />
          </div>
          <div>
            <h2 className="text-[#233876] font-black text-lg">
              {user?.name ?? <span className="inline-block w-28 h-5 bg-gray-200 rounded animate-pulse" />}
            </h2>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#eef4ff] text-[#2c52ed] rounded-full text-xs font-bold mt-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/${rankOverall.toLowerCase()}.svg`} alt={rankOverall} className="w-3.5 h-3.5 object-contain" />
              {rankOverall}
            </div>
          </div>
        </Link>

        {/* ── YOUR ACTIVE TEAM ── */}
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <Link
              href="/active-teams"
              onClick={onClose}
              className="text-[#233876] font-bold text-sm tracking-widest uppercase hover:text-[#2c52ed] transition-colors"
            >
              Your Active Team
            </Link>
            <Link href="/active-teams" onClick={onClose} className="text-[#2c52ed] text-xs font-bold hover:underline">
              See All
            </Link>
          </div>

          {visibleTeams.length > 0 ? (
            <div className="flex flex-row gap-4 items-start">
              {visibleTeams.map((team) => {
                const leader = userMap[team.leader_id];
                return (
                  <Link
                    key={team._id}
                    href={`/teams/${team._id}`}
                    onClick={onClose}
                    className="flex flex-col items-center w-14 shrink-0 group cursor-pointer"
                  >
                    <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[#1b3168] shrink-0 group-hover:border-[#2c52ed] transition-colors">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={leader?.avatar_url ?? "/profile.svg"}
                        alt={team.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-[#1b3168] text-[10px] font-semibold mt-1.5 text-center w-full truncate leading-tight">
                      {team.title}
                    </span>
                  </Link>
                );
              })}

              {remainingCount > 0 && (
                <Link
                  href="/active-teams"
                  onClick={onClose}
                  className="flex flex-col items-center w-14 shrink-0"
                >
                  <div className="w-14 h-14 rounded-full bg-[#1b3168] flex items-center justify-center text-white font-bold text-base shadow-sm hover:bg-[#12224f] transition-colors">
                    +{remainingCount}
                  </div>
                  <span className="text-gray-400 text-[10px] font-semibold mt-1.5">more</span>
                </Link>
              )}
            </div>
          ) : (
            <p className="text-gray-400 text-xs font-medium italic">ยังไม่มีทีมที่เข้าร่วม</p>
          )}
        </div>

        {/* ── Navigation Menu ── */}
        <nav className="flex-1 flex flex-col py-2 px-4" aria-label="Main navigation">

          {/* FIND TEAM */}
          <div className="border-b border-gray-50 py-2">
            <div className="flex items-center justify-between px-2 py-3">
              <Link href="/find-team" onClick={onClose} className="text-[#1b3168] font-black tracking-wider uppercase text-sm hover:text-[#2c52ed]">
                FIND TEAM
              </Link>
              <button onClick={() => setFindTeamOpen(!isFindTeamOpen)} className="p-1 text-[#1b3168]">
                <svg className={`w-5 h-5 transition-transform ${isFindTeamOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
            {isFindTeamOpen && (
              <div className="mx-2 mb-4 mt-2 flex gap-4">
                <Link href="/find-team?tab=team" onClick={onClose} className="flex-1 border-2 border-blue-100 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 hover:border-[#2c52ed] transition-colors">
                  <svg className="w-8 h-8 text-[#2c52ed]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                  <span className="text-[#1b3168] font-black text-sm">TEAM</span>
                </Link>
                <Link href="/find-team?tab=people" onClick={onClose} className="flex-1 border-2 border-blue-100 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 hover:border-[#2c52ed] transition-colors">
                  <svg className="w-8 h-8 text-[#2c52ed]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                  <span className="text-[#1b3168] font-black text-sm">PEOPLE</span>
                </Link>
              </div>
            )}
          </div>

          {/* SKILL BANK */}
          <div className="border-b border-gray-50 py-2">
            <div className="flex items-center justify-between px-2 py-3">
              <Link href="/skill-bank" onClick={onClose} className="text-[#1b3168] font-black tracking-wider uppercase text-sm hover:text-[#2c52ed]">
                SKILL BANK
              </Link>
              <button onClick={() => setSkillBankOpen(!isSkillBankOpen)} className="p-1 text-[#1b3168]">
                <svg className={`w-5 h-5 transition-transform ${isSkillBankOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
            {isSkillBankOpen && (
              <div className="mx-2 mb-4 mt-2 bg-[#f9fafb] border border-gray-100 rounded-2xl p-4 flex justify-between items-center">
                {/* Role count */}
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 bg-[#1b3168] rounded-full flex items-center justify-center text-white">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  </div>
                  <div className="text-center">
                    <div className="text-[#1b3168] font-black text-sm">{roleCount}</div>
                    <div className="text-gray-500 text-[10px] font-bold">Role</div>
                  </div>
                </div>
                {/* Rank overall */}
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`/${rankOverall.toLowerCase()}.svg`} alt={rankOverall} className="w-full h-full object-contain drop-shadow-sm" />
                  </div>
                  <div className="text-center">
                    <div className="text-[#1b3168] font-black text-sm">{rankOverall}</div>
                    <div className="text-gray-500 text-[10px] font-bold">Rank</div>
                  </div>
                </div>
                {/* Skill count */}
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 bg-[#1b3168] rounded-full flex items-center justify-center text-white">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                  </div>
                  <div className="text-center">
                    <div className="text-[#1b3168] font-black text-sm">{skillCount}</div>
                    <div className="text-gray-500 text-[10px] font-bold">Skills</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SAVED */}
          <div className="border-b border-gray-50 py-2">
            <div className="flex items-center px-2 py-3">
              <Link href="/saved" onClick={onClose} className="text-[#1b3168] font-black tracking-wider uppercase text-sm hover:text-[#2c52ed]">
                SAVED
              </Link>
            </div>
          </div>

          {/* SETTINGS */}
          <div className="border-b border-gray-50 py-2">
            <div className="flex items-center px-2 py-3">
              <Link href="/settings" onClick={onClose} className="text-[#1b3168] font-black tracking-wider uppercase text-sm hover:text-[#2c52ed]">
                SETTINGS
              </Link>
            </div>
          </div>
        </nav>

        {/* ── Log out ── */}
        <div className="p-6 mt-auto">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 border border-red-500 rounded-full px-6 py-2.5 w-full max-w-[80%] mx-auto font-bold text-red-500 hover:bg-red-500 hover:text-white active:bg-red-600 active:text-white transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
