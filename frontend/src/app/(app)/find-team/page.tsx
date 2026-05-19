import FindTeamClient from "@/components/team/FindTeamClient";
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

export default async function FindTeamPage() {
  // ─── Artificial delay directly in the Server Component body ───
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const teams = mockTeams.map((t) => buildTeamViewModel(t, mockUsers));
  const people = Object.values(mockUsers).map(buildPeopleViewModel);

  return <FindTeamClient initialTeams={teams} initialPeople={people} />;
}
