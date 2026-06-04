"use client";

import { useState, useEffect, useRef } from "react";
import { apiFetch } from "@/lib/api";
import type { ApiUser } from "@/types/profile";
import type { ApiTeam } from "@/types/team";
import type { TeamCardViewModel, PeopleCardViewModel } from "@/types";

function computeDaysLeft(startDate: string): number {
  return Math.max(0, Math.ceil((new Date(startDate).getTime() - Date.now()) / 86_400_000));
}

function fmt(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function buildTeamViewModel(
  team: ApiTeam,
  userMap: Record<string, ApiUser>,
  meId: string | null,
): TeamCardViewModel {
  const leader = userMap[team.leader_id];
  const members = team.member_ids.map((id) => userMap[id]).filter(Boolean) as ApiUser[];

  let joinStatus: TeamCardViewModel["joinStatus"] = "open";
  let myRequestId: string | undefined;

  if (meId) {
    if (team.leader_id === meId) {
      joinStatus = "leader";
    } else if (team.member_ids.includes(meId)) {
      joinStatus = "member";
    } else {
      const myReq = team.join_requests?.find((r) => r.user_id === meId);
      if (myReq?.status === "pending") {
        joinStatus = "pending";
        myRequestId = myReq.id;
      } else if (myReq?.status === "rejected") {
        joinStatus = "rejected";
      }
    }
  }

  const memberSkills = new Set(
    members.flatMap((u) => u.skills.map((s) => s.name))
  );
  const filledSkills = team.required_skills.filter((s) => memberSkills.has(s));

  return {
    id: team._id,
    avatarUrl: leader?.avatar_url ?? "/avatar.png",
    title: team.title,
    authorName: leader?.name ?? "Unknown",
    dateRange: `${fmt(team.start_date)} - ${fmt(team.end_date)}`,
    daysLeft: computeDaysLeft(team.start_date),
    status: team.status,
    roles: team.required_roles,
    skills: team.required_skills,
    filledSkills,
    positions: (team.positions ?? []).map((p) => ({ role: p.role, filled: p.filled })),
    currentMemberCount: team.member_ids.length,
    maxMembers: team.max_members,
    memberAvatars: members.map((u) => u.avatar_url ?? "/avatar.png"),
    description: team.description,
    detailedMembers: members.map((u) => ({
      name: u.name,
      avatar: u.avatar_url ?? "/avatar.png",
      role: u.role[0]?.name ?? "Member",
      score: u.behavioral_rates,
    })),
    joinStatus,
    myRequestId,
  };
}

function buildPeopleViewModel(user: ApiUser, favoriteIds: Set<string>): PeopleCardViewModel {
  return {
    id: user._id,
    username: user.username,
    name: user.name,
    bio: user.bio ?? "",
    avatarUrl: user.avatar_url ?? "/avatar.png",
    roleTags: user.role.map((r) => r.name),
    skillTags: user.skills.map((s) => s.name),
    isFavorited: favoriteIds.has(user._id),
  };
}

interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  has_next: boolean;
}

const LIMIT = 20;

export function useTeamsData(params: {
  q?: string;
  roles?: string[];
  page?: number;
} = {}) {
  const { q = "", roles = [], page = 1 } = params;

  const [teams, setTeams] = useState<TeamCardViewModel[]>([]);
  const [people, setPeople] = useState<PeopleCardViewModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasNextTeams, setHasNextTeams] = useState(false);
  const [hasNextPeople, setHasNextPeople] = useState(false);
  const [totalTeams, setTotalTeams] = useState(0);
  const [totalPeople, setTotalPeople] = useState(0);

  // Debounce q by 350ms so we don't fire on every keystroke
  const [debouncedQ, setDebouncedQ] = useState(q);
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => {
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => setDebouncedQ(q), 350);
    return () => clearTimeout(debounceTimer.current);
  }, [q]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      try {
        const roleParam = roles.length === 1 ? `&role=${encodeURIComponent(roles[0])}` : "";
        const qParam = debouncedQ ? `&q=${encodeURIComponent(debouncedQ)}` : "";
        const pageParam = `&page=${page}&limit=${LIMIT}`;

        const [teamsResult, usersResult, apiFavorites, me] = await Promise.all([
          apiFetch<PaginatedResult<ApiTeam>>(`/api/v1/teams?${qParam}${roleParam}${pageParam}`),
          apiFetch<PaginatedResult<ApiUser>>(`/api/v1/users?${qParam}${roleParam}${pageParam}`),
          apiFetch<ApiUser[]>("/api/v1/users/me/favorites").catch(() => [] as ApiUser[]),
          apiFetch<ApiUser>("/api/v1/users/me").catch(() => null),
        ]);

        if (cancelled) return;

        const favoriteIds = new Set(apiFavorites.map((u) => u._id));
        const meId = me?._id ?? null;

        // Build a userMap from the users page — leaders not in this page will show "Unknown"
        const userMap = Object.fromEntries(
          (usersResult.items as ApiUser[]).map((u: ApiUser) => [u._id, u])
        );

        // Apply multi-role client-side filter only when more than 1 role selected
        const rawTeams = (teamsResult.items as ApiTeam[]).filter((t: ApiTeam) =>
          roles.length <= 1 || roles.some((r) => t.required_roles.includes(r))
        );
        const rawPeople = (usersResult.items as ApiUser[]).filter((u: ApiUser) =>
          roles.length <= 1 || roles.some((r) => u.role.some((ur) => ur.name === r))
        );

        setTeams(rawTeams.map((t: ApiTeam) => buildTeamViewModel(t, userMap, meId)));
        setPeople(rawPeople.map((u: ApiUser) => buildPeopleViewModel(u, favoriteIds)));
        setHasNextTeams(teamsResult.has_next);
        setHasNextPeople(usersResult.has_next);
        setTotalTeams(teamsResult.total);
        setTotalPeople(usersResult.total);
      } catch {
        // silent — keep previous results visible
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [debouncedQ, roles.join(","), page]);

  return { teams, setTeams, people, isLoading, hasNextTeams, hasNextPeople, totalTeams, totalPeople };
}
