"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import ActiveTeamCard, { ActiveTeamCardData } from "@/components/team/ActiveTeamCard";
import type { ApiUser } from "@/types/profile";
import type { ApiTeam } from "@/types/team";

function computeDaysLeft(startDate: string): number {
  return Math.max(0, Math.ceil((new Date(startDate).getTime() - Date.now()) / 86_400_000));
}

function fmt(d: string): string {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function buildCardData(team: ApiTeam, userMap: Record<string, ApiUser>, myId: string): ActiveTeamCardData {
  const leader = userMap[team.leader_id];
  const members = team.member_ids.map((id) => userMap[id]).filter(Boolean) as ApiUser[];

  const memberRoles = new Set(members.flatMap((u) => u.role.map((r) => r.name)));
  const filledRoles = team.required_roles.filter((r) => memberRoles.has(r));

  const memberSkills = new Set(members.flatMap((u) => u.skills.map((s) => s.name)));
  const filledSkills = team.required_skills.filter((s) => memberSkills.has(s));

  return {
    id: team._id,
    avatarUrl: leader?.avatar_url ?? "/profile.svg",
    title: team.title,
    authorName: leader?.name ?? "Unknown",
    dateRange: fmt(team.start_date),
    daysLeft: computeDaysLeft(team.start_date),
    status: team.status,
    roles: team.required_roles,
    skills: team.required_skills,
    filledRoles,
    filledSkills,
    positions: (team.positions ?? []).map((p) => ({ role: p.role, filled: p.filled })),
    currentMembers: team.member_ids.length,
    maxMembers: team.max_members,
    memberAvatars: members.map((u) => u.avatar_url ?? "/profile.svg"),
    description: team.description,
    isLeader: team.leader_id === myId,
    detailedMembers: members.map((u) => ({
      name: u.name,
      avatar: u.avatar_url ?? "/profile.svg",
      role: u.role[0]?.name ?? "Member",
      score: u.behavioral_rates,
    })),
  };
}

export default function ActiveTeamsPage() {
  const router = useRouter();
  const [teams, setTeams] = useState<ActiveTeamCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const me = await apiFetch<ApiUser>("/api/v1/users/me");
        const apiTeams = await apiFetch<ApiTeam[]>(`/api/v1/users/${me._id}/teams`);

        // Collect only the user IDs referenced by these teams
        const neededIds = new Set<string>([me._id]);
        for (const t of apiTeams) {
          neededIds.add(t.leader_id);
          t.member_ids.forEach((id) => neededIds.add(id));
        }
        const userResults = await Promise.all(
          Array.from(neededIds).map((id) =>
            apiFetch<ApiUser>(`/api/v1/users/${id}`).catch(() => null)
          )
        );
        const userMap: Record<string, ApiUser> = { [me._id]: me };
        for (const u of userResults) {
          if (u) userMap[u._id] = u;
        }

        if (!cancelled) setTeams(apiTeams.map((t) => buildCardData(t, userMap, me._id)));
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error("[active-teams] load failed:", msg);
        const isAuthError = msg.includes("401") || msg.toLowerCase().includes("unauthorized") || msg.toLowerCase().includes("not authenticated");
        if (!cancelled && isAuthError) router.replace("/login");
        // non-auth errors (404, 500, network) → stay on page, show empty state
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [router]);

  const inProgress = teams.filter((t) => t.status === "IN_PROGRESS").length;
  const waiting = teams.filter((t) => t.status === "WAITING").length;

  if (loading) {
    return (
      <div className="w-full space-y-8 pb-12">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 h-48 animate-pulse">
              <div className="flex gap-4">
                <div className="w-16 h-16 rounded-full bg-gray-200 shrink-0" />
                <div className="flex-1 space-y-2 pt-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 pb-12">
      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#1b3168] tracking-tight">ทีมที่เข้าร่วม</h1>
        <p className="text-sm text-gray-500 font-medium mt-0.5">{teams.length} ทีม</p>
      </div>

      {/* ── Status Summary Pills ── */}
      {teams.length > 0 && (
        <div className="flex gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-xs font-bold px-4 py-2 rounded-full">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            กำลังแข่งขัน {inProgress} ทีม
          </div>
          <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 text-orange-600 text-xs font-bold px-4 py-2 rounded-full">
            <span className="w-2 h-2 rounded-full bg-orange-400" />
            รอเริ่ม {waiting} ทีม
          </div>
        </div>
      )}

      {/* ── Card Grid ── */}
      {teams.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full items-start">
          {teams.map((team) => (
            <ActiveTeamCard key={team.id} data={team} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
            </svg>
          </div>
          <p className="text-gray-400 font-semibold text-sm">ยังไม่ได้เข้าร่วมทีมใด</p>
          <Link
            href="/find-team"
            className="px-6 py-2.5 rounded-full bg-[#1b3168] text-white text-sm font-bold hover:bg-[#12224f] transition-colors shadow-sm"
          >
            ค้นหาทีม
          </Link>
        </div>
      )}
    </div>
  );
}
