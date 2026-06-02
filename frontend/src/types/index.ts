import type { Role } from "@/data/mockData";

// ─── Skill Bank ────────────────────────────────────────────────────────────────
export type SkillRank = "Bronze" | "Silver" | "Gold" | "Diamond";

export interface HardSkill {
  name: string;
  count: number; // raw repetition count — rank is derived via calculateSkillLevel()
}

export interface RoleSoftSkill {
  role: Role;
  score: number; // out of 5
}

export interface SkillBank {
  rankOverall: SkillRank;
  roleMastery: Record<Role, number>;
  hardSkills: HardSkill[];
  softSkillScore: number;
  roleSoftSkills: RoleSoftSkill[];
}

// ─── User ──────────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  coverImage: string;
  bio: string;
  university: string;
  birthDate: string;
  github?: string;
  linkedin?: string;
  roles: Role[];       // primary roles (displayed on cards)
  skillBank: SkillBank;
}

// ─── Team ──────────────────────────────────────────────────────────────────────
export interface TeamMember {
  userId: string;      // FK → User.id
  role: Role;
  score: number;       // soft-skill score shown on member card
}

export interface Team {
  id: string;
  title: string;
  leaderId: string;    // FK → User.id (must exist in mockUsers)
  startDate: string;   // ISO date string "2024-05-10"
  endDate: string;
  daysLeft: number;
  requiredRoles: Role[];        // roles the team is still looking for
  requiredSkills: string[];     // preferred skills
  currentMembers: TeamMember[]; // references User IDs
  maxMembers: number;
  description?: string;
}

// ─── API response shapes (simulated) ──────────────────────────────────────────
export interface TeamCardViewModel {
  id: string;
  avatarUrl: string;   // leader's avatar
  title: string;
  authorName: string;  // leader's name
  dateRange: string;
  daysLeft: number;
  status: "WAITING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  roles: string[];
  skills: string[];
  currentMemberCount: number;
  maxMembers: number;
  memberAvatars: string[];
  description?: string;
  detailedMembers: { name: string; avatar: string; role: string; score: number }[];
  joinStatus: "leader" | "member" | "pending" | "rejected" | "open";
  myRequestId?: string;  // req id when pending — needed to cancel
}

export interface PeopleCardViewModel {
  id: string;
  username: string;
  name: string;
  bio: string;
  avatarUrl: string;
  roleTags: string[];
  skillTags: string[];
  isFavorited: boolean;
}
