"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import type { ApiCompetitionExperience } from "@/types/profile";
import type { ApiUser } from "@/types/profile";

const ROLE_OPTIONS = ["Developer", "Business", "UI/UX Designer", "Marketing", "AI / Data", "Pitching"] as const;

interface AddProjectModalProps {
  onClose: () => void;
  onSaved: (updated: ApiCompetitionExperience[]) => void;
  editEntry?: ApiCompetitionExperience;
}

export default function AddProjectModal({ onClose, onSaved, editEntry }: AddProjectModalProps) {
  const [type, setType] = useState<"project" | "competition">(
    editEntry ? (editEntry.type === "team" ? "competition" : "project") : "project"
  );
  const [name, setName] = useState(editEntry?.competition_name ?? "");
  const [detail, setDetail] = useState(editEntry?.detail ?? "");
  const [selectedRoles, setSelectedRoles] = useState<string[]>(editEntry?.roles ?? []);
  const [githubUrl, setGithubUrl] = useState(editEntry?.github_url ?? "");
  const [date, setDate] = useState(editEntry?.date ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // contributors
  const [allUsers, setAllUsers] = useState<ApiUser[]>([]);
  const [contributors, setContributors] = useState<string[]>(editEntry?.contributor_ids ?? []);
  const [userSearch, setUserSearch] = useState("");

  useEffect(() => {
    apiFetch<ApiUser>("/api/v1/users/me")
      .then((me) =>
        apiFetch<{ items: ApiUser[] }>("/api/v1/users?limit=100").then((res) =>
          setAllUsers(res.items.filter((u) => u._id !== me._id))
        )
      )
      .catch(() => {});
  }, []);

  const filteredUsers = allUsers.filter((u) => {
    const q = userSearch.toLowerCase();
    return u.name.toLowerCase().includes(q) || u.username.toLowerCase().includes(q);
  });

  const toggleRole = (role: string) =>
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );

  const toggleContributor = (id: string) =>
    setContributors((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (selectedRoles.length === 0) {
      setError("กรุณาเลือกตำแหน่งอย่างน้อย 1 อัน");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const url = editEntry
        ? `/api/v1/users/me/competitions/${editEntry.id}`
        : "/api/v1/users/me/competitions";
      const updated = await apiFetch<ApiCompetitionExperience[]>(url, {
        method: editEntry ? "PUT" : "POST",
        body: JSON.stringify({
          competition_name: name,
          detail,
          roles: selectedRoles,
          skills: [],
          contributor_ids: contributors,
          type: type === "competition" ? "team" : "project",
          date: date || null,
          github_url: githubUrl || null,
        }),
      });
      onSaved(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setSaving(false);
    }
  }

  const isProject = type === "project";

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-8 flex flex-col gap-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-xl font-extrabold text-[#1b3168]">{editEntry ? "แก้ไขผลงาน" : "เพิ่มผลงาน"}</h2>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Type toggle */}
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setType("project")}
            className={`flex-1 py-2.5 rounded-lg text-sm font-black transition-all ${isProject ? "bg-[#1b3168] text-white shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            Project
          </button>
          <button
            type="button"
            onClick={() => setType("competition")}
            className={`flex-1 py-2.5 rounded-lg text-sm font-black transition-all ${!isProject ? "bg-[#1b3168] text-white shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            Competition
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#1b3168] uppercase tracking-wide">
              {isProject ? "ชื่อโปรเจค" : "ชื่อการแข่งขัน"} <span className="text-red-500">*</span>
            </label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={isProject ? "เช่น AI Chatbot for Healthcare" : "เช่น LINE Hackathon 2026"}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[#1b3168] text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1b3168]/30 focus:border-[#1b3168]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#1b3168] uppercase tracking-wide">รายละเอียด</label>
            <textarea
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              placeholder={isProject ? "อธิบายสิ่งที่คุณทำในโปรเจคนี้" : "อธิบายบทบาทและผลลัพธ์ของคุณ"}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[#1b3168] text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1b3168]/30 focus:border-[#1b3168] resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-[#1b3168] uppercase tracking-wide">
              ตำแหน่งของคุณ <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {ROLE_OPTIONS.map((role) => {
                const sel = selectedRoles.includes(role);
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => toggleRole(role)}
                    className={`px-4 py-2 rounded-full text-xs font-bold border transition-colors ${sel ? "bg-[#1b3168] text-white border-[#1b3168]" : "bg-white text-gray-600 border-gray-200 hover:border-[#1b3168]"}`}
                  >
                    {role}
                  </button>
                );
              })}
            </div>
          </div>

          {isProject && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#1b3168] uppercase tracking-wide">GitHub URL</label>
              <input
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[#1b3168] text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1b3168]/30 focus:border-[#1b3168]"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#1b3168] uppercase tracking-wide">วันที่</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[#1b3168] text-sm focus:outline-none focus:ring-2 focus:ring-[#1b3168]/30 focus:border-[#1b3168]"
            />
          </div>

          {/* Contributors */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#1b3168] uppercase tracking-wide">เพื่อนร่วมทีม</label>

            {contributors.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {contributors.map((id) => {
                  const u = allUsers.find((u) => u._id === id);
                  return u ? (
                    <span key={id} className="flex items-center gap-1 bg-[#1b3168] text-white text-xs px-2.5 py-1 rounded-full font-semibold">
                      {u.name}
                      <button type="button" onClick={() => toggleContributor(id)} className="opacity-70 hover:opacity-100 leading-none">✕</button>
                    </span>
                  ) : null;
                })}
              </div>
            )}

            <input
              type="text"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              placeholder="ค้นหาชื่อหรือ username..."
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-[#1b3168] text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1b3168]/30 focus:border-[#1b3168]"
            />

            {userSearch && filteredUsers.length > 0 && (
              <div className="max-h-40 overflow-y-auto flex flex-col gap-0.5 border border-gray-100 rounded-xl p-1.5">
                {filteredUsers.map((u) => {
                  const selected = contributors.includes(u._id);
                  return (
                    <button
                      key={u._id}
                      type="button"
                      onClick={() => toggleContributor(u._id)}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left ${selected ? "bg-[#1b3168] text-white" : "hover:bg-gray-50 text-gray-700"}`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={u.avatar_url ?? "/avatar.png"} alt={u.name} className="w-7 h-7 rounded-full object-cover shrink-0 border border-white/20" />
                      <span className="font-semibold truncate">{u.name}</span>
                      <span className={`text-xs ml-auto shrink-0 ${selected ? "text-white/60" : "text-gray-400"}`}>@{u.username}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {userSearch && filteredUsers.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-2">ไม่พบผู้ใช้</p>
            )}
          </div>

          {error && <p className="text-red-500 text-xs font-semibold">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 py-3 rounded-full border-2 border-gray-200 text-gray-600 text-sm font-bold hover:bg-gray-50 disabled:opacity-50"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 rounded-full bg-[#1b3168] text-white text-sm font-bold hover:bg-[#12224f] disabled:opacity-40"
            >
              {saving ? "กำลังบันทึก…" : "บันทึก"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
