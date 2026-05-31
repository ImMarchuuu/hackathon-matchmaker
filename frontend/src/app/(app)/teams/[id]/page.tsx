"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { RoleIcon, SkillIcon } from "@/components/Icons";
import type { ApiUser } from "@/types/profile";
import type { ApiJoinRequest } from "@/types/team";

interface ApiTeamDetail {
  _id: string;
  title: string;
  leader_id: string;
  leader: ApiUser;
  members: ApiUser[];
  status: "WAITING" | "IN_PROGRESS";
  start_date: string;
  end_date: string;
  required_roles: string[];
  required_skills: string[];
  member_ids: string[];
  max_members: number;
  description?: string;
  join_requests: ApiJoinRequest[];
}

function fmt(d: string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function TeamDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [team, setTeam] = useState<ApiTeamDetail | null>(null);
  const [me, setMe] = useState<ApiUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"members" | "requests">("members");

  useEffect(() => {
    Promise.all([
      apiFetch<ApiTeamDetail>(`/api/v1/teams/${params.id}`),
      apiFetch<ApiUser>("/api/v1/users/me").catch(() => null),
    ])
      .then(([t, m]) => { setTeam(t); setMe(m); })
      .catch(() => setMissing(true))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-[#1b3168] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (missing || !team) return notFound();

  const isLeader = me?._id === team.leader_id;
  const pendingRequests = team.join_requests.filter((r) => r.status === "pending");

  async function resolveRequest(reqId: string, status: "approved" | "rejected") {
    setResolvingId(reqId);
    try {
      const updated = await apiFetch<ApiTeamDetail>(
        `/api/v1/teams/${team!._id}/requests/${reqId}`,
        { method: "PATCH", body: JSON.stringify({ status }) }
      );
      setTeam(updated);
    } finally {
      setResolvingId(null);
    }
  }

  const userMap = Object.fromEntries(team.members.map((u) => [u._id, u]));

  return (
    <div className="w-full min-h-screen bg-[#f4f6f8] py-8 px-4 sm:px-6 flex flex-col items-center">
      {/* Header */}
      <div className="w-full max-w-4xl flex items-center justify-between mb-6 relative">
        <button onClick={() => router.back()} className="absolute left-0 flex items-center gap-1.5 px-4 py-2 rounded-full bg-white shadow-sm text-[#1b3168] font-bold text-sm hover:bg-gray-50">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          ย้อนกลับ
        </button>
        <h1 className="w-full text-center text-[#1b3168] font-black text-xl">รายละเอียดทีม</h1>
      </div>

      <div className="w-full max-w-4xl bg-white rounded-[2rem] shadow-sm p-6 sm:p-10 border border-gray-100 flex flex-col gap-8">

        {/* Top Info */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full overflow-hidden border border-gray-200 shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={team.leader.avatar_url ?? "/avatar.png"} alt={team.title} className="w-full h-full object-cover" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-[#1b3168]">{team.title}</h2>
              <p className="text-[#1b3168] font-bold mt-1">{team.leader.name} <span className="text-gray-400 font-medium">(กัปตัน)</span></p>
              <p className="text-blue-400 text-sm font-semibold mt-1">{fmt(team.start_date)} – {fmt(team.end_date)}</p>
            </div>
          </div>
          <span className={`px-5 py-2 rounded-full text-sm font-bold shadow-sm ${team.status === "IN_PROGRESS" ? "bg-[#ffefc2] text-[#d49900]" : "bg-orange-100 text-orange-600"}`}>
            {team.status === "IN_PROGRESS" ? "กำลังดำเนินการ" : "รอเริ่ม"}
          </span>
        </div>

        {/* Description */}
        {team.description && (
          <div className="bg-slate-50 text-gray-600 text-sm leading-relaxed p-5 rounded-2xl border border-gray-100">
            {team.description}
          </div>
        )}

        <hr className="border-gray-100" />

        {/* Tags */}
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1 flex flex-col gap-4">
            <div className="flex items-center gap-1.5"><RoleIcon className="w-4 h-4 text-[#1b3168]" /><span className="text-[#1b3168] font-bold text-xs">Role Tags</span></div>
            <div className="flex flex-wrap gap-2">
              {team.required_roles.map((r) => (
                <span key={r} className="bg-white border border-blue-100 text-[#2c52ed] text-xs font-bold px-4 py-1.5 rounded-full">{r}</span>
              ))}
            </div>
            <div className="flex items-center gap-1.5 mt-2"><SkillIcon className="w-4 h-4 text-[#1b3168]" /><span className="text-[#1b3168] font-bold text-xs">Skill Tags</span></div>
            <div className="flex flex-wrap gap-2">
              {team.required_skills.map((s) => (
                <span key={s} className="bg-white border border-gray-200 text-gray-500 text-xs font-bold px-4 py-1.5 rounded-full">{s}</span>
              ))}
            </div>
          </div>

          {/* Members / Requests tabs */}
          <div className="flex-1 flex flex-col gap-3">
            <div className="flex gap-2">
              <button onClick={() => setActiveTab("members")}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${activeTab === "members" ? "bg-[#1b3168] text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                Members {team.member_ids.length}/{team.max_members}
              </button>
              {isLeader && (
                <button onClick={() => setActiveTab("requests")}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors flex items-center gap-1.5 ${activeTab === "requests" ? "bg-[#1b3168] text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                  Requests
                  {pendingRequests.length > 0 && (
                    <span className="bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">{pendingRequests.length}</span>
                  )}
                </button>
              )}
            </div>

            {activeTab === "members" ? (
              <div className="flex flex-col gap-2 bg-gray-50/50 p-3 rounded-2xl border border-gray-100">
                {team.members.map((member) => (
                  <Link key={member._id} href={`/profile/${member.username}`}
                    className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-white shadow-sm hover:border-blue-200 transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={member.avatar_url ?? "/avatar.png"} alt={member.name} className="w-full h-full object-cover" />
                      </div>
                      <span className="text-[#1b3168] font-bold text-sm group-hover:text-[#2c52ed]">{member.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {member.role[0] && (
                        <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-3 py-1 rounded-full">{member.role[0].name}</span>
                      )}
                      <span className="font-bold text-[#1b3168] text-sm">{member.behavioral_rates.toFixed(1)} ⭐</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {pendingRequests.length === 0 ? (
                  <p className="text-gray-400 text-xs italic py-4 text-center">ยังไม่มีคำขอเข้าร่วม</p>
                ) : pendingRequests.map((req) => {
                  const requester = userMap[req.user_id];
                  return (
                    <div key={req.id} className="flex flex-col gap-3 p-3 rounded-xl border border-gray-100 bg-white shadow-sm">
                      <div className="flex items-center justify-between gap-3">
                        <Link href={requester ? `/profile/${requester.username}` : "#"} className="flex items-center gap-3 min-w-0 group">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={requester?.avatar_url ?? "/avatar.png"} alt="" className="w-9 h-9 rounded-full object-cover border border-gray-200 shrink-0" />
                          <p className="text-[#1b3168] font-bold text-sm truncate group-hover:text-[#2c52ed]">{requester?.name ?? req.user_id}</p>
                        </Link>
                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => resolveRequest(req.id, "approved")}
                            disabled={resolvingId === req.id}
                            className="px-3 py-1.5 rounded-full bg-[#1b3168] text-white text-xs font-bold hover:bg-[#12224f] disabled:opacity-50"
                          >
                            ✓ รับ
                          </button>
                          <button
                            onClick={() => resolveRequest(req.id, "rejected")}
                            disabled={resolvingId === req.id}
                            className="px-3 py-1.5 rounded-full border border-red-300 text-red-500 text-xs font-bold hover:bg-red-50 disabled:opacity-50"
                          >
                            ✕ ปฏิเสธ
                          </button>
                        </div>
                      </div>

                      {(req.roles.length > 0 || req.skills.length > 0) && (
                        <div className="flex flex-wrap gap-1.5 pl-12">
                          {req.roles.map((r) => (
                            <span key={r} className="bg-blue-50 text-[#2c52ed] text-[11px] font-bold px-2.5 py-0.5 rounded-full">{r}</span>
                          ))}
                          {req.skills.map((s) => (
                            <span key={s} className="bg-gray-100 text-gray-600 text-[11px] font-semibold px-2.5 py-0.5 rounded-full">{s}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
