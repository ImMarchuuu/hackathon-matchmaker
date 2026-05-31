/** Types for skill bank data */

// ── Rank-summary API shapes ────────────────────────────────────────────────

export interface ApiSkillRankEntry {
  name: string;
  project_count: number;
  tier: number;
  rank_title: string;
  progress_current: number;
  progress_total: number;
  is_max: boolean;
}

export interface ApiRoleRankEntry {
  name: string;
  project_count: number;
  tier: number;
  rank_title: string;
}

export interface ApiRankSummary {
  rank_overall: string;
  skills: ApiSkillRankEntry[];
  roles: ApiRoleRankEntry[];
  behavioral_rates: number;
}


export type RankTier = "Gold" | "Silver" | "Bronze" | "Unranked";

export interface RankOverview {
  tier: RankTier;
  progressPercent: number;
}

export interface RoleMastery {
  roleName: string;
  count: number;
}

export interface HardSkill {
  name: string;
  iconUrl?: string;
  currentLevel: number;
  maxLevel: number;
}

export interface SoftSkillRating {
  roleName: string;
  score: number;
  maxScore: number;
}

export interface SkillBankData {
  rank: RankOverview;
  roleMastery: RoleMastery[];
  hardSkills: HardSkill[];
  softSkillOverall: number;
  softSkillByRole: SoftSkillRating[];
}

export interface CompetitionEntry {
  name: string;
  award?: string;
  dateRange: string;
  memberCount: number;
}
