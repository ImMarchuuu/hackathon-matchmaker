/** Types for user profile data */

export interface UserProfile {
  id: string;
  displayName: string;
  avatarUrl?: string;
  coverPhotoUrl?: string;
  bio?: string;
  university?: string;
  birthday?: string;
  email?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  roles: string[];
  teammateCount?: number;
}

/** API response shape from GET /api/v1/users/{username} and /api/v1/users/me */
export interface ApiRoleEntry {
  name: string;
  tier: number;
  project_count: number;
  rank_title: string;
}

export interface ApiSkillEntry {
  name: string;
  tier: number;
  project_count: number;
  rank_title: string;
}

export interface ApiCompetitionExperience {
  id: string;
  competition_name: string;
  detail: string;
  role: string;
  skills: string[];
  contributor_ids: string[];
}

export interface ApiUser {
  _id: string;
  username: string;
  name: string;
  email: string;
  avatar_url: string | null;
  cover_image: string | null;
  bio: string | null;
  university: string | null;
  birth_date: string | null;
  github: string | null;
  linkedin: string | null;
  mbti: string | null;
  behavioral_rates: number;
  rank_overall: string;
  role: ApiRoleEntry[];
  skills: ApiSkillEntry[];
  portfolios: unknown[];
  competition_experiences: ApiCompetitionExperience[];
}

export interface CompetitionItem {
  name: string;
  date: string;
  iconUrl?: string;
}

export interface SkillItem {
  name: string;
  /** URL of the rank icon image — leave empty for default ship placeholder */
  iconUrl?: string;
  rank?: string;
}

export interface ActiveTeam {
  teamName: string;
  dateRange?: string;
  daysLeft?: number;
  /** e.g. "กำลังประกาศ", "กำลังร่วมทีม" */
  status?: string;
  memberCount?: string;
}
