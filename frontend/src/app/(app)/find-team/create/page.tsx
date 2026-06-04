"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import SkillAutocomplete from "@/components/shared/SkillAutocomplete";
import type { ApiUser } from "@/types/profile";

const ROLE_OPTIONS = [
  "Developer",
  "Business",
  "UI/UX Designer",
  "Marketing",
  "AI / Data",
  "Pitching",
] as const;

export default function CreateTeamPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventStartDate, setEventStartDate] = useState("");
  const [maxMembers, setMaxMembers] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  // Leader's own role/skill for credit
  const [leaderRoles, setLeaderRoles] = useState<string[]>([]);
  const [leaderSkillInput, setLeaderSkillInput] = useState("");
  const [leaderSkills, setLeaderSkills] = useState<string[]>([]);

  // Step 2 — invite
  const [createdTeamId, setCreatedTeamId] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<ApiUser[]>([]);
  const [invitedIds, setInvitedIds] = useState<Set<string>>(new Set());
  const [invitingId, setInvitingId] = useState<string | null>(null);

  // Load favorites upfront so they're ready after team creation
  useEffect(() => {
    apiFetch<ApiUser[]>("/api/v1/users/me/favorites").then(setFavorites).catch(() => {});
  }, []);

  const toggleRole = (role: string) =>
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );

  const removeSkill = (skill: string) =>
    setSelectedSkills((prev) => prev.filter((s) => s !== skill));

  const toggleLeaderRole = (role: string) =>
    setLeaderRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );

  const removeLeaderSkill = (skill: string) =>
    setLeaderSkills((prev) => prev.filter((s) => s !== skill));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!eventStartDate) {
      setError("กรุณาระบุวันต้นกิจกรรม");
      return;
    }

    if (leaderRoles.length === 0) {
      setError("กรุณาเลือกตำแหน่งของคุณในทีมอย่างน้อย 1 อัน");
      return;
    }

    const members = Number(maxMembers);
    if (members < 2 || members > 10) {
      setError("จำนวนสมาชิกต้องอยู่ระหว่าง 2–10 คน");
      return;
    }

    setSaving(true);
    try {
      const created = await apiFetch<{ _id: string }>("/api/v1/teams", {
        method: "POST",
        body: JSON.stringify({
          title,
          description: description || undefined,
          start_date: eventStartDate,
          required_roles: selectedRoles,
          required_skills: selectedSkills,
          max_members: members,
          leader_roles: leaderRoles,
          leader_skills: leaderSkills,
        }),
      });

      // If user has favorites → show invite step, else go straight to active-teams
      if (favorites.length > 0) {
        setCreatedTeamId(created._id);
      } else {
        router.push("/active-teams");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด กรุณาลองอีกครั้ง");
    } finally {
      setSaving(false);
    }
  };

  async function handleInvite(userId: string) {
    if (!createdTeamId || invitingId === userId || invitedIds.has(userId)) return;
    setInvitingId(userId);
    try {
      await apiFetch(`/api/v1/teams/${createdTeamId}/members`, {
        method: "POST",
        body: JSON.stringify({ user_id: userId }),
      });
      setInvitedIds((prev) => new Set(Array.from(prev).concat(userId)));
    } catch {
      // full team or other error — silently ignore, user can retry
    } finally {
      setInvitingId(null);
    }
  }

  // ── Step 2: Invite friends ──────────────────────────────────────────────────
  if (createdTeamId) {
    return (
      <div className="max-w-xl mx-auto flex flex-col gap-6">
        {/* Success header */}
        <div className="flex flex-col items-center gap-3 pt-4">
          <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-7 h-7 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="text-center">
            <h1 className="text-xl font-black text-[#1b3168]">สร้างทีมสำเร็จ!</h1>
            <p className="text-gray-500 text-sm mt-1">เชิญเพื่อนจาก Saved People ของคุณเข้าร่วมทีมได้เลย</p>
          </div>
        </div>

        {/* Favorites list */}
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6 flex flex-col gap-3">
          <p className="text-xs font-bold text-[#1b3168] uppercase tracking-wide">Saved People</p>
          {favorites.map((fav) => {
            const invited = invitedIds.has(fav._id);
            return (
              <div key={fav._id} className="flex items-center justify-between gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50">
                <Link href={`/profile/${fav.username}`} className="flex items-center gap-3 min-w-0 group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={fav.avatar_url ?? "/profile.svg"} alt={fav.name} className="w-10 h-10 rounded-full object-cover border border-gray-200 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[#1b3168] font-bold text-sm truncate group-hover:underline">{fav.name}</p>
                    <p className="text-gray-400 text-xs">{fav.role[0]?.name ?? ""}</p>
                  </div>
                </Link>

                {invited ? (
                  <span className="shrink-0 flex items-center gap-1 text-xs font-bold text-orange-500 bg-orange-50 px-3 py-1.5 rounded-full border border-orange-200">
                    รอการตอบรับ
                  </span>
                ) : (
                  <button
                    onClick={() => handleInvite(fav._id)}
                    disabled={invitingId === fav._id}
                    className="shrink-0 px-4 py-1.5 rounded-full bg-[#1b3168] text-white text-xs font-bold hover:bg-[#12224f] transition-colors disabled:opacity-50"
                  >
                    {invitingId === fav._id ? "…" : "เชิญ"}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Done */}
        <div className="flex gap-3 pb-8">
          <Link
            href={`/teams/${createdTeamId}/manage`}
            className="flex-1 py-3 rounded-full border-2 border-gray-200 text-center text-sm font-bold text-[#1b3168] hover:bg-gray-50 transition-colors"
          >
            จัดการทีม
          </Link>
          <button
            onClick={() => router.push("/active-teams")}
            className="flex-1 py-3 rounded-full bg-[#1b3168] text-white text-sm font-bold hover:bg-[#12224f] transition-colors"
          >
            เสร็จสิ้น
          </button>
        </div>
      </div>
    );
  }

  // ── Step 1: Create form ─────────────────────────────────────────────────────
  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-6">
        <Link href="/find-team" className="text-[#1b3168] hover:text-[#12224f] transition-colors text-sm font-semibold">
          &lt; ย้อนกลับ
        </Link>
      </div>

      <h1 className="text-2xl font-extrabold text-[#1b3168] text-center mb-8">สร้างทีม</h1>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* ── Title ── */}
        <div className="space-y-1.5">
          <label htmlFor="team-title" className="block text-sm font-bold text-[#1b3168]">
            หัวข้อ (Title) <span className="text-red-500">*</span>
          </label>
          <input
            id="team-title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="ระบุหัวข้อประกาศ"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[#1b3168] text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1b3168]/30 focus:border-[#1b3168]"
          />
        </div>

        {/* ── Description ── */}
        <div className="space-y-1.5">
          <label htmlFor="team-details" className="block text-sm font-bold text-[#1b3168]">
            รายละเอียดเพิ่มเติม (Details)
          </label>
          <textarea
            id="team-details"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="อธิบายเป้าหมาย แนวคิด หรือสิ่งที่ทีมต้องการ"
            rows={4}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[#1b3168] text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1b3168]/30 focus:border-[#1b3168] resize-none"
          />
        </div>

        {/* ── Start Date ── */}
        <div className="space-y-1.5">
          <label htmlFor="event-start-date" className="block text-sm font-bold text-[#1b3168]">
            วันที่เริ่มต้นกิจกรรม <span className="text-red-500">*</span>
          </label>
          <input
            id="event-start-date"
            type="date"
            required
            value={eventStartDate}
            onChange={(e) => setEventStartDate(e.target.value)}
            min={new Date().toISOString().slice(0, 10)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[#1b3168] text-sm focus:outline-none focus:ring-2 focus:ring-[#1b3168]/30 focus:border-[#1b3168]"
          />
        </div>

        {/* ── Max Members ── */}
        <div className="space-y-1.5">
          <label htmlFor="member-count" className="block text-sm font-bold text-[#1b3168]">
            จำนวนสมาชิกสูงสุด (2–10) <span className="text-red-500">*</span>
          </label>
          <input
            id="member-count"
            type="number"
            min={2}
            max={10}
            required
            value={maxMembers}
            onChange={(e) => setMaxMembers(e.target.value)}
            placeholder="เช่น 4"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[#1b3168] text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1b3168]/30 focus:border-[#1b3168]"
          />
        </div>

        {/* ── Roles ── */}
        <div className="space-y-2">
          <label className="block text-sm font-bold text-[#1b3168]">
            ตำแหน่งที่ต้องการ (Role)
          </label>
          <div className="flex flex-wrap gap-2">
            {ROLE_OPTIONS.map((role) => {
              const selected = selectedRoles.includes(role);
              return (
                <button
                  key={role}
                  type="button"
                  onClick={() => toggleRole(role)}
                  className={`px-4 py-2 rounded-full text-sm font-bold border transition-all ${
                    selected
                      ? "bg-[#1b3168] text-white border-[#1b3168] shadow-sm"
                      : "bg-white text-[#1b3168] border-gray-200 hover:border-[#1b3168]/50"
                  }`}
                >
                  {role}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Skills ── */}
        <div className="space-y-2">
          <label className="block text-sm font-bold text-[#1b3168]">
            ทักษะที่ต้องการ (Skill)
          </label>
          <SkillAutocomplete
            value={skillInput}
            onChange={setSkillInput}
            onAdd={(skill) => {
              if (!selectedSkills.includes(skill)) {
                setSelectedSkills((prev) => [...prev, skill]);
              }
            }}
          />
          {selectedSkills.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {selectedSkills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#1b3168] text-white text-xs font-semibold"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="ml-1 hover:text-red-300 leading-none"
                    aria-label={`Remove ${skill}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* ── Leader Role & Skills ── */}
        <div className="rounded-2xl border-2 border-[#1b3168]/15 bg-[#f5f7ff] p-5 space-y-5">
          <div>
            <p className="text-sm font-extrabold text-[#1b3168]">บทบาทของคุณในทีม</p>
            <p className="text-xs text-gray-400 mt-0.5">ระบบจะใช้ข้อมูลนี้ให้เครดิต Skill Bank เมื่อจบ Hackathon</p>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#1b3168] uppercase tracking-wide">
              ตำแหน่งของคุณ <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {ROLE_OPTIONS.map((role) => {
                const selected = leaderRoles.includes(role);
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => toggleLeaderRole(role)}
                    className={`px-4 py-2 rounded-full text-sm font-bold border transition-all ${
                      selected
                        ? "bg-[#1b3168] text-white border-[#1b3168] shadow-sm"
                        : "bg-white text-[#1b3168] border-gray-200 hover:border-[#1b3168]/50"
                    }`}
                  >
                    {role}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#1b3168] uppercase tracking-wide">
              ทักษะที่คุณจะนำมา
            </label>
            <SkillAutocomplete
              value={leaderSkillInput}
              onChange={setLeaderSkillInput}
              onAdd={(skill) => {
                if (!leaderSkills.includes(skill)) {
                  setLeaderSkills((prev) => [...prev, skill]);
                }
              }}
            />
            {leaderSkills.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {leaderSkills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#1b3168] text-white text-xs font-semibold"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeLeaderSkill(skill)}
                      className="ml-1 hover:text-red-300 leading-none"
                      aria-label={`Remove ${skill}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Error ── */}
        {error && (
          <p className="text-sm text-red-500 font-semibold">{error}</p>
        )}

        {/* ── Actions ── */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            href="/find-team"
            className="px-6 py-3 rounded-full border border-gray-200 text-sm font-bold text-[#1b3168] hover:bg-gray-50 transition-colors"
          >
            ยกเลิก
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 rounded-full bg-[#1b3168] text-white text-sm font-bold hover:bg-[#12224f] transition-colors shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? "กำลังสร้าง…" : "โพสต์ประกาศ"}
          </button>
        </div>

      </form>
    </div>
  );
}
