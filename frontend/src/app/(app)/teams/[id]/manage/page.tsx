"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import type { ApiUser } from "@/types/profile";
import type { ApiJoinRequest } from "@/types/team";

interface ApiInvite {
  id: string;
  user_id: string;
  status: "pending" | "accepted" | "declined";
}

interface ApiTeamDetail {
  _id: string;
  title: string;
  leader_id: string;
  leader: ApiUser;
  members: ApiUser[];
  status: "WAITING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  start_date: string;
  end_date: string;
  required_roles: string[];
  required_skills: string[];
  member_ids: string[];
  max_members: number;
  description?: string;
  join_requests: ApiJoinRequest[];
  invites: ApiInvite[];
}

const ALL_ROLES = ["Developer", "Business", "UI/UX Designer", "Marketing", "AI / Data", "Pitching"];

type ConfirmAction = "cancel" | "complete" | null;

export default function ManageTeamPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [team, setTeam] = useState<ApiTeamDetail | null>(null);
  const [me, setMe] = useState<ApiUser | null>(null);
  const [favorites, setFavorites] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [skillsInput, setSkillsInput] = useState("");
  const [maxMembers, setMaxMembers] = useState(4);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  // Action states
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const [actioning, setActioning] = useState(false);
  const [kickingId, setKickingId] = useState<string | null>(null);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [optimisticInvited, setOptimisticInvited] = useState<Set<string>>(new Set());

  const loadAll = useCallback(async () => {
    try {
      const [t, m, favs] = await Promise.all([
        apiFetch<ApiTeamDetail>(`/api/v1/teams/${params.id}`),
        apiFetch<ApiUser>("/api/v1/users/me"),
        apiFetch<ApiUser[]>("/api/v1/users/me/favorites").catch(() => [] as ApiUser[]),
      ]);

      if (t.leader_id !== m._id) {
        router.replace(`/teams/${params.id}`);
        return;
      }

      setTeam(t);
      setMe(m);
      setFavorites(favs);

      setTitle(t.title);
      setDescription(t.description ?? "");
      setStartDate(t.start_date);
      setEndDate(t.end_date);
      setSelectedRoles(t.required_roles);
      setSkillsInput(t.required_skills.join(", "));
      setMaxMembers(t.max_members);
    } catch {
      router.replace("/active-teams");
    } finally {
      setLoading(false);
    }
  }, [params.id, router]);

  useEffect(() => { loadAll(); }, [loadAll]);

  function toggleRole(role: string) {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  }

  async function handleSave() {
    if (!team) return;
    setSaving(true);
    setSaveMsg("");
    try {
      const skills = skillsInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      await apiFetch(`/api/v1/teams/${team._id}`, {
        method: "PATCH",
        body: JSON.stringify({
          title,
          description,
          start_date: startDate,
          end_date: endDate,
          required_roles: selectedRoles,
          required_skills: skills,
          max_members: maxMembers,
        }),
      });
      setSaveMsg("Saved!");
      await loadAll();
    } catch {
      setSaveMsg("Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  async function handleKick(userId: string) {
    if (!team) return;
    setKickingId(userId);
    try {
      const updated = await apiFetch<ApiTeamDetail>(
        `/api/v1/teams/${team._id}/members/${userId}`,
        { method: "DELETE" }
      );
      setTeam(updated);
    } finally {
      setKickingId(null);
    }
  }

  async function handleAddFavorite(userId: string) {
    if (!team) return;
    setAddingId(userId);
    try {
      await apiFetch<ApiTeamDetail>(
        `/api/v1/teams/${team._id}/members`,
        { method: "POST", body: JSON.stringify({ user_id: userId }) }
      );
      setOptimisticInvited((prev) => new Set(Array.from(prev).concat(userId)));
      await loadAll(); // refresh to pick up updated invites list
    } finally {
      setAddingId(null);
    }
  }

  async function handleConfirmAction() {
    if (!team || !confirmAction) return;
    setActioning(true);
    try {
      await apiFetch(`/api/v1/teams/${team._id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: confirmAction === "cancel" ? "CANCELLED" : "COMPLETED" }),
      });
      router.replace("/active-teams");
    } finally {
      setActioning(false);
      setConfirmAction(null);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#1b3168] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!team || !me) return null;

  const memberSet = new Set(team.member_ids);
  const pendingInviteIds = new Set(
    team.invites.filter((i) => i.status === "pending").map((i) => i.user_id)
      .concat(Array.from(optimisticInvited))
  );
  // Show favorites not already in team (invitables + those with pending invites)
  const invitableFavorites = favorites.filter((u) => !memberSet.has(u._id));

  return (
    <div className="w-full min-h-screen bg-[#f4f6f8] py-8 px-4 sm:px-6 flex flex-col items-center gap-6">
      {/* Header */}
      <div className="w-full max-w-3xl flex items-center justify-between relative">
        <button
          onClick={() => router.back()}
          className="absolute left-0 flex items-center gap-1.5 px-4 py-2 rounded-full bg-white shadow-sm text-[#1b3168] font-bold text-sm hover:bg-gray-50"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          ย้อนกลับ
        </button>
        <h1 className="w-full text-center text-[#1b3168] font-black text-xl">จัดการทีม</h1>
      </div>

      {/* ── Edit Details ── */}
      <section className="w-full max-w-3xl bg-white rounded-[2rem] shadow-sm border border-gray-100 p-6 sm:p-8 flex flex-col gap-5">
        <h2 className="text-[#1b3168] font-black text-base">รายละเอียดทีม</h2>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-500">ชื่อทีม</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-[#1b3168]"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-500">คำอธิบาย</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-[#1b3168] resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-500">วันต้นกิจกรรม</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-[#1b3168]"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-500">วันสิ้นสุด</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-[#1b3168]"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-500">จำนวนสมาชิกสูงสุด</label>
          <input
            type="number"
            min={2}
            max={10}
            value={maxMembers}
            onChange={(e) => setMaxMembers(Number(e.target.value))}
            className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-[#1b3168] w-28"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-gray-500">Role Tags</label>
          <div className="flex flex-wrap gap-2">
            {ALL_ROLES.map((r) => (
              <button
                key={r}
                onClick={() => toggleRole(r)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors border ${
                  selectedRoles.includes(r)
                    ? "bg-[#1b3168] text-white border-[#1b3168]"
                    : "bg-white text-gray-500 border-gray-200 hover:border-[#1b3168]"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-500">Skill Tags (คั่นด้วยจุลภาค)</label>
          <input
            value={skillsInput}
            onChange={(e) => setSkillsInput(e.target.value)}
            placeholder="React, Figma, Python…"
            className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-[#1b3168]"
          />
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 rounded-full bg-[#1b3168] text-white text-sm font-bold hover:bg-[#12224f] transition-colors disabled:opacity-60"
          >
            {saving ? "กำลังบันทึก…" : "บันทึก"}
          </button>
          {saveMsg && (
            <span className={`text-sm font-semibold ${saveMsg === "Saved!" ? "text-green-600" : "text-red-500"}`}>
              {saveMsg}
            </span>
          )}
        </div>
      </section>

      {/* ── Members ── */}
      <section className="w-full max-w-3xl bg-white rounded-[2rem] shadow-sm border border-gray-100 p-6 sm:p-8 flex flex-col gap-4">
        <h2 className="text-[#1b3168] font-black text-base">สมาชิก ({team.members.length}/{team.max_members})</h2>
        <div className="flex flex-col gap-2">
          {team.members.map((member) => {
            const isLeaderRow = member._id === team.leader_id;
            return (
              <div key={member._id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-gray-50">
                <Link href={`/profile/${member.username}`} className="flex items-center gap-3 group min-w-0">
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={member.avatar_url ?? "/avatar.png"} alt={member.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[#1b3168] font-bold text-sm truncate group-hover:text-[#2c52ed]">{member.name}</p>
                    {isLeaderRow && <p className="text-[10px] text-orange-500 font-bold">กัปตัน</p>}
                  </div>
                </Link>
                {!isLeaderRow && (
                  <button
                    onClick={() => handleKick(member._id)}
                    disabled={kickingId === member._id}
                    className="px-3 py-1.5 rounded-full border border-red-300 text-red-500 text-xs font-bold hover:bg-red-50 transition-colors disabled:opacity-50 shrink-0 ml-2"
                  >
                    {kickingId === member._id ? "…" : "นำออก"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Invite from Favorites ── */}
      {invitableFavorites.length > 0 && (
        <section className="w-full max-w-3xl bg-white rounded-[2rem] shadow-sm border border-gray-100 p-6 sm:p-8 flex flex-col gap-4">
          <h2 className="text-[#1b3168] font-black text-base">เชิญจาก Saved People</h2>
          <div className="flex flex-col gap-2">
            {invitableFavorites.map((fav) => (
              <div key={fav._id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-gray-50">
                <Link href={`/profile/${fav.username}`} className="flex items-center gap-3 group min-w-0">
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={fav.avatar_url ?? "/avatar.png"} alt={fav.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[#1b3168] font-bold text-sm truncate group-hover:text-[#2c52ed]">{fav.name}</p>
                    <p className="text-gray-400 text-xs">{fav.role[0]?.name ?? ""}</p>
                  </div>
                </Link>
                {pendingInviteIds.has(fav._id) ? (
                  <span className="shrink-0 ml-2 px-3 py-1.5 rounded-full bg-orange-50 text-orange-500 border border-orange-200 text-xs font-bold">
                    รอการตอบรับ
                  </span>
                ) : (
                  <button
                    onClick={() => handleAddFavorite(fav._id)}
                    disabled={addingId === fav._id || team.member_ids.length >= team.max_members}
                    className="px-3 py-1.5 rounded-full bg-[#1b3168] text-white text-xs font-bold hover:bg-[#12224f] transition-colors disabled:opacity-50 shrink-0 ml-2"
                  >
                    {addingId === fav._id ? "…" : "เชิญ"}
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Danger Zone ── */}
      <section className="w-full max-w-3xl bg-white rounded-[2rem] shadow-sm border border-red-100 p-6 sm:p-8 flex flex-col gap-4">
        <h2 className="text-red-600 font-black text-base">Danger Zone</h2>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => setConfirmAction("complete")}
            className="flex-1 py-3 rounded-2xl bg-green-500 text-white text-sm font-bold hover:bg-green-600 transition-colors flex flex-col items-center gap-1"
          >
            <span>จบทีม (Complete)</span>
            <span className="text-xs font-medium opacity-80">สมาชิกได้รับแต้ม Skill + แจ้งให้ Rating กัน</span>
          </button>
          <button
            onClick={() => setConfirmAction("cancel")}
            className="flex-1 py-3 rounded-2xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-colors flex flex-col items-center gap-1"
          >
            <span>ยกเลิกทีม (Cancel)</span>
            <span className="text-xs font-medium opacity-80">ลบข้อมูลทีม ทุกคนออกจากทีม</span>
          </button>
        </div>
      </section>

      {/* ── Confirm Modal ── */}
      {confirmAction && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => !actioning && setConfirmAction(null)}
        >
          <div
            className="bg-white rounded-[2rem] shadow-2xl border border-gray-100 w-full max-w-sm p-8 flex flex-col items-center gap-6"
            onClick={(e) => e.stopPropagation()}
          >
            {confirmAction === "complete" ? (
              <>
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-[#1b3168] font-extrabold text-lg">จบทีม?</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    สมาชิกทุกคนจะได้รับ Skill จากทีมนี้เข้า Skill Bank และได้รับการแจ้งเตือนให้ Rating เพื่อนร่วมทีม
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                  <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-[#1b3168] font-extrabold text-lg">ยกเลิกทีม?</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    ข้อมูลทีมจะถูกลบถาวร สมาชิกทุกคนจะได้รับการแจ้งเตือนว่าทีมถูกยกเลิก
                  </p>
                </div>
              </>
            )}

            <div className="flex gap-3 w-full">
              <button
                onClick={() => setConfirmAction(null)}
                disabled={actioning}
                className="flex-1 py-3 rounded-full border-2 border-gray-200 bg-white text-gray-600 text-sm font-bold hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleConfirmAction}
                disabled={actioning}
                className={`flex-1 py-3 rounded-full text-white text-sm font-bold transition-colors disabled:opacity-60 ${
                  confirmAction === "complete" ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"
                }`}
              >
                {actioning ? "กำลังดำเนินการ…" : "ยืนยัน"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
