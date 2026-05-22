"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import type { ApiUser } from "@/types/profile";
import type { ApiTeam } from "@/types/team";
import type { TeamCardViewModel, PeopleCardViewModel } from "@/types";

function computeDaysLeft(endDate: string): number {
  const diff = new Date(endDate).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86_400_000));
}

function fmt(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function buildTeamViewModel(
  team: ApiTeam,
  userMap: Record<string, ApiUser>,
): TeamCardViewModel {
  const leader = userMap[team.leader_id];
  const members = team.member_ids.map((id) => userMap[id]).filter(Boolean) as ApiUser[];

  return {
    id: team._id,
    avatarUrl: leader?.avatar_url ?? "/avatar.png",
    title: team.title,
    authorName: leader?.name ?? "Unknown",
    dateRange: `${fmt(team.start_date)} - ${fmt(team.end_date)}`,
    daysLeft: computeDaysLeft(team.end_date),
    roles: team.required_roles,
    skills: team.required_skills,
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

export function useTeamsData() {
  const [teams, setTeams] = useState<TeamCardViewModel[]>([]);
  const [people, setPeople] = useState<PeopleCardViewModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setIsLoading(true);
        const [apiTeams, apiUsers, apiFavorites] = await Promise.all([
          apiFetch<ApiTeam[]>("/api/v1/teams"),
          apiFetch<ApiUser[]>("/api/v1/users"),
          apiFetch<ApiUser[]>("/api/v1/users/me/favorites").catch(() => [] as ApiUser[]),
        ]);

        const userMap = Object.fromEntries(apiUsers.map((u) => [u._id, u]));
        const favoriteIds = new Set(apiFavorites.map((u) => u._id));

        if (!cancelled) {
          setTeams(apiTeams.map((t) => buildTeamViewModel(t, userMap)));
          setPeople(apiUsers.map((u) => buildPeopleViewModel(u, favoriteIds)));
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load data");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  return { teams, people, isLoading, error };
}
