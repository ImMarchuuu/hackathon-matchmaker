export type NotificationType = "join_request" | "request_approved" | "request_rejected";

export interface ApiNotification {
  id: string;
  type: NotificationType;
  payload: {
    team_id?: string;
    team_name?: string;
    requester_id?: string;
    requester_name?: string;
    requester_avatar?: string | null;
    request_id?: string;
  };
  read: boolean;
  created_at: string;
}
