"use client";

interface ProfilePendingActionCardProps {
  type: "join_request" | "team_invite";
  teamName: string;
  // join_request: roles/skills the person offered
  roles?: string[];
  skills?: string[];
  // team_invite: available roles from team's required_roles
  inviteRoles?: string[];
  loading?: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export default function ProfilePendingActionCard({
  type,
  teamName,
  roles,
  skills,
  inviteRoles,
  loading,
  onAccept,
  onDecline,
}: ProfilePendingActionCardProps) {
  const isJoinRequest = type === "join_request";

  return (
    <div className="rounded-[1.25rem] border border-[#c7d4f7] bg-[#f0f4ff] px-6 py-4 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="font-bold text-[#1b3168] text-sm">
            {isJoinRequest ? "คำขอเข้าร่วมทีม" : "คำเชิญเข้าร่วมทีม"}
          </p>
          <p className="text-sm text-gray-600 mt-0.5 truncate">
            {isJoinRequest
              ? `คนนี้ขอเข้าร่วมทีม ${teamName} ของคุณ`
              : `คนนี้ชวนคุณเข้าร่วมทีม ${teamName}`}
          </p>
        </div>

        <div className="flex gap-2 shrink-0">
          <button
            onClick={onAccept}
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#1b3168] text-white text-xs font-bold hover:bg-[#12224f] disabled:opacity-50 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            ตอบรับ
          </button>
          <button
            onClick={onDecline}
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-gray-300 text-gray-600 text-xs font-bold hover:bg-gray-100 disabled:opacity-50 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            ปฏิเสธ
          </button>
        </div>
      </div>

      {/* chips */}
      {isJoinRequest && (roles?.length || skills?.length) ? (
        <div className="flex flex-wrap gap-1.5">
          {roles?.map((r) => (
            <span key={r} className="bg-blue-50 text-[#2c52ed] text-[11px] font-bold px-2.5 py-0.5 rounded-full">{r}</span>
          ))}
          {skills?.map((s) => (
            <span key={s} className="bg-white border border-gray-200 text-gray-600 text-[11px] font-semibold px-2.5 py-0.5 rounded-full">{s}</span>
          ))}
        </div>
      ) : null}

      {!isJoinRequest && inviteRoles?.length ? (
        <div className="flex flex-wrap gap-1.5">
          {inviteRoles.map((r) => (
            <span key={r} className="bg-[#1b3168] text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full">{r}</span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
