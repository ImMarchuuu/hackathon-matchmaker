export type NotificationType =
  | "join_request"
  | "request_approved"
  | "request_rejected"
  | "team_invite"
  | "team_kicked"
  | "team_cancelled"
  | "team_completed"
  | "invite_accepted"
  | "invite_declined";

export interface ApiNotification {
  id: string;
  type: NotificationType;
  payload: {
    // join_request
    team_id?: string;
    team_name?: string;
    requester_id?: string;
    requester_name?: string;
    requester_avatar?: string | null;
    request_id?: string;
    roles?: string[];
    skills?: string[];
    resolved_status?: "approved" | "rejected";
    // team_invite
    invite_id?: string;
    invite_resolved?: "accepted" | "declined" | "error";
    required_roles?: string[];
    required_skills?: string[];
    // team_completed
    teammate_ids?: string[];
    // invite_accepted / invite_declined
    user_name?: string;
    user_avatar?: string | null;
  };
  read: boolean;
  created_at: string;
}
