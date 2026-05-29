"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";
import SkillAutocomplete from "@/components/shared/SkillAutocomplete";
import type { ApiUser, ApiCompetitionExperience } from "@/types/profile";

const ROLES = ["Developer", "Business", "UI/UX Designer", "Marketing", "AI / Data", "Pitching"] as const;

interface CompetitionModalProps {
  allUsers: ApiUser[];
  onClose: () => void;
  onAdded: (updated: ApiCompetitionExperience[]) => void;
}

export default function CompetitionModal({ allUsers, onClose, onAdded }: CompetitionModalProps) {
  const [name, setName] = useState("");
  const [detail, setDetail] = useState("");
  const [role, setRole] = useState<string>(ROLES[0]);
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [contributorIds, setContributorIds] = useState<string[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const filteredUsers = allUsers.filter(
    (u) =>
      !contributorIds.includes(u._id) &&
      (u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.username.toLowerCase().includes(userSearch.toLowerCase()))
  );

  const addContributor = (u: ApiUser) => {
    setContributorIds((prev) => [...prev, u._id]);
    setUserSearch("");
  };

  const removeContributor = (id: string) => setContributorIds((prev) => prev.filter((c) => c !== id));

  const selectedContributors = allUsers.filter((u) => contributorIds.includes(u._id));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError("Competition name is required"); return; }
    setSaving(true);
    setError("");
    try {
      const updated = await apiFetch<{ competition_experiences: ApiCompetitionExperience[] }>(
        "/api/v1/users/me/competitions",
        {
          method: "POST",
          body: JSON.stringify({ competition_name: name.trim(), detail, role, skills, contributor_ids: contributorIds }),
        }
      );
      onAdded(updated.competition_experiences ?? []);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8 flex flex-col gap-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-[#1b3168]">Add Competition Experience</h2>
            <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Competition Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#1b3168] uppercase tracking-wide">Competition Name *</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Thailand Hackathon 2024"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#1b3168]"
              />
            </div>

            {/* Detail */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#1b3168] uppercase tracking-wide">Detail</label>
              <textarea
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
                rows={3}
                placeholder="What did you build? What was your contribution?"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#1b3168] resize-none"
              />
            </div>

            {/* Role */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#1b3168] uppercase tracking-wide">Your Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#1b3168] bg-white"
              >
                {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            {/* Skills */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#1b3168] uppercase tracking-wide">Skills Used</label>
              <SkillAutocomplete
                value={skillInput}
                onChange={setSkillInput}
                onAdd={(s) => {
                  if (!skills.includes(s)) setSkills((prev) => [...prev, s]);
                  setSkillInput("");
                }}
                placeholder="Type a skill and press +"
              />
              {skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {skills.map((s) => (
                    <span key={s} className="flex items-center gap-1 bg-gray-100 text-gray-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                      {s}
                      <button type="button" onClick={() => setSkills((prev) => prev.filter((x) => x !== s))} className="hover:text-red-500 ml-0.5">×</button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Contributors */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#1b3168] uppercase tracking-wide">Event Contributors</label>

              {/* Selected contributors chips */}
              {selectedContributors.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-1">
                  {selectedContributors.map((u) => (
                    <span key={u._id} className="flex items-center gap-1.5 bg-[#eef1fa] text-[#1b3168] text-xs font-semibold px-3 py-1 rounded-full">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={u.avatar_url ?? "/avatar.png"} alt="" className="w-4 h-4 rounded-full object-cover" />
                      {u.name}
                      <button type="button" onClick={() => removeContributor(u._id)} className="ml-0.5 hover:text-red-500">×</button>
                    </span>
                  ))}
                </div>
              )}

              {/* Search input */}
              <div className="relative">
                <input
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search by name or username…"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#1b3168]"
                />
                {userSearch.length > 0 && filteredUsers.length > 0 && (
                  <ul className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10 max-h-44 overflow-y-auto">
                    {filteredUsers.slice(0, 6).map((u) => (
                      <li key={u._id}>
                        <button
                          type="button"
                          onMouseDown={() => addContributor(u)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-left"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={u.avatar_url ?? "/avatar.png"} alt="" className="w-7 h-7 rounded-full object-cover shrink-0" />
                          <div>
                            <p className="text-sm font-semibold text-gray-800">{u.name}</p>
                            <p className="text-xs text-gray-400">@{u.username}</p>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {error && <p className="text-red-500 text-xs font-semibold">{error}</p>}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 rounded-full border-2 border-gray-200 text-gray-600 text-sm font-bold hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-3 rounded-full bg-[#1b3168] text-white text-sm font-bold hover:bg-[#12224f] disabled:opacity-60"
              >
                {saving ? "Saving…" : "Add Experience"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
