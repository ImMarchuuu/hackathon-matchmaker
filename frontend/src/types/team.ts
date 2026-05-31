/** Types for team and people listings */

export type JoinRequestStatus = "pending" | "approved" | "rejected";
export type JoinStatus = "leader" | "member" | "pending" | "rejected" | "open";

export interface ApiJoinRequest {
  id: string;
  user_id: string;
  roles: string[];
  skills: string[];
  status: JoinRequestStatus;
  created_at: string;
}

/** Raw shape returned by GET /api/v1/teams and GET /api/v1/teams/{id} */
export interface ApiTeam {
  _id: string;
  title: string;
  leader_id: string;
  status: "WAITING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  start_date: string;
  end_date: string;
  days_left: number;
  required_roles: string[];
  required_skills: string[];
  positions: { role: string; filled: boolean; invited_user_id: string | null }[];
  member_ids: string[];
  max_members: number;
  description?: string;
  join_requests: ApiJoinRequest[];
}

export interface TeamCardData {
  teamName: string;
  creatorName?: string;
  creatorAvatarUrl?: string;
  dateRange?: string;
  daysLeft?: number;
  roleTags: string[];
  skillTags: string[];
  currentMembers: number;
  maxMembers: number;
  memberAvatarUrls: string[];
}

export interface PersonCardData {
  name: string;
  avatarUrl?: string;
  bio?: string;
  roleTags: string[];
  skillTags: string[];
  isFavorited?: boolean;
}

export interface CreateTeamPayload {
  title: string;
  details: string;
  eventDate: string;
  durationDays: number;
  memberCount: number;
  roles: string[];
  skills: string[];
}
