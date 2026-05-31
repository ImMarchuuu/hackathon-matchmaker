"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import SkillAutocomplete from "@/components/shared/SkillAutocomplete";

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

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [durationDays, setDurationDays] = useState("");
  const [maxMembers, setMaxMembers] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  const [skillInput, setSkillInput] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const toggleRole = (role: string) =>
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );

  const removeSkill = (skill: string) =>
    setSelectedSkills((prev) => prev.filter((s) => s !== skill));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const days = Number(durationDays);
    if (!startDate || days < 1) {
      setError("กรุณาระบุวันเริ่มต้นและระยะเวลา");
      return;
    }

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + days);
    const endDateStr = endDate.toISOString().slice(0, 10);

    const members = Number(maxMembers);
    if (members < 2 || members > 10) {
      setError("จำนวนสมาชิกต้องอยู่ระหว่าง 2–10 คน");
      return;
    }

    setSaving(true);
    try {
      await apiFetch("/api/v1/teams", {
        method: "POST",
        body: JSON.stringify({
          title,
          description: description || undefined,
          start_date: startDate,
          end_date: endDateStr,
          required_roles: selectedRoles,
          required_skills: selectedSkills,
          max_members: members,
        }),
      });
      router.push("/find-team");
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด กรุณาลองอีกครั้ง");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      {/* Back link */}
      <div className="mb-6">
        <Link
          href="/find-team"
          className="text-[#1b3168] hover:text-[#12224f] transition-colors text-sm font-semibold"
        >
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

        {/* ── Dates ── */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="start-date" className="block text-sm font-bold text-[#1b3168]">
              วันเริ่มต้น <span className="text-red-500">*</span>
            </label>
            <input
              id="start-date"
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[#1b3168] text-sm focus:outline-none focus:ring-2 focus:ring-[#1b3168]/30 focus:border-[#1b3168]"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="duration" className="block text-sm font-bold text-[#1b3168]">
              ระยะเวลา (วัน) <span className="text-red-500">*</span>
            </label>
            <input
              id="duration"
              type="number"
              min={1}
              required
              value={durationDays}
              onChange={(e) => setDurationDays(e.target.value)}
              placeholder="เช่น 3"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[#1b3168] text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1b3168]/30 focus:border-[#1b3168]"
            />
          </div>
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
