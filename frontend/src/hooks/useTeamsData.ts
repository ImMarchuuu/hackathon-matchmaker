"use client";

import { useState, useEffect } from "react";
import { mockTeams, mockUsers, Team, User } from "@/data/mockData";
import type { TeamCardViewModel, PeopleCardViewModel } from "@/types";

// ─── Utility: build a TeamCardViewModel from a normalized Team + User lookup ──
function buildTeamViewModel(team: Team, users: Record<string, User>): TeamCardViewModel {
  const leader = users[team.leaderId];

  const detailedMembers = team.currentMemberIds
    .map((uid) => users[uid])
    .filter(Boolean)
    .map((u, idx) => ({
      name: u.name,
      avatar: u.avatarUrl,
      role: team.currentMemberIds[idx] === team.leaderId
        ? u.roles[0]
        : u.roles[0],
      score: u.skillBank.softSkillScore,
    }));

  const memberAvatars = team.currentMemberIds
    .map((uid) => users[uid]?.avatarUrl)
    .filter(Boolean) as string[];

  const start = new Date(team.startDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  const end = new Date(team.endDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  return {
    id: team.id,
    avatarUrl: leader?.avatarUrl ?? "https://i.pravatar.cc/150",
    title: team.title,
    authorName: leader?.name ?? "Unknown",
    dateRange: `${start} - ${end}`,
    daysLeft: team.daysLeft,
    roles: team.requiredRoles,
    skills: team.requiredSkills,
    currentMemberCount: team.currentMemberIds.length,
    maxMembers: team.maxMembers,
    memberAvatars,
    description: team.description,
    detailedMembers,
  };
}

// ─── Utility: build a PeopleCardViewModel from a User ────────────────────────
function buildPeopleViewModel(user: User): PeopleCardViewModel {
  return {
    id: user.id,
    name: user.name,
    bio: user.bio,
    avatarUrl: user.avatarUrl,
    roleTags: user.roles,
    skillTags: user.skillBank.hardSkills.map((s) => s.name),
    isFavorited: false,
  };
}

// ─── Simulated async fetcher (swap internal logic for real API later) ─────────
async function fetchTeams(): Promise<TeamCardViewModel[]> {
  await new Promise((res) => setTimeout(res, 350)); // simulate ~350ms network latency
  return mockTeams.map((t) => buildTeamViewModel(t, mockUsers));
}

async function fetchPeople(): Promise<PeopleCardViewModel[]> {
  await new Promise((res) => setTimeout(res, 350));
  return Object.values(mockUsers).map(buildPeopleViewModel);
}

// ─── Custom Hook: useTeamsData ────────────────────────────────────────────────
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
        const [teamsData, peopleData] = await Promise.all([fetchTeams(), fetchPeople()]);
        if (!cancelled) {
          setTeams(teamsData);
          setPeople(peopleData);
        }
      } catch (e) {
        if (!cancelled) setError("Failed to load data");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  return { teams, people, isLoading, error };
}
