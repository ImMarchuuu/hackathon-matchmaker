"use client";

import { useState } from "react";
import type { ApiCompetitionExperience } from "@/types/profile";
import type { ApiUser } from "@/types/profile";
import { apiFetch } from "@/lib/api";
import CompetitionModal from "./CompetitionModal";

const ROLE_COLORS: Record<string, string> = {
  "Developer":     "bg-blue-100 text-blue-700",
  "Business":      "bg-green-100 text-green-700",
  "UI/UX Designer":"bg-purple-100 text-purple-700",
  "Marketing":     "bg-orange-100 text-orange-700",
  "AI / Data":     "bg-yellow-100 text-yellow-700",
  "Pitching":      "bg-red-100 text-red-700",
};

interface CompetitionSectionProps {
  competitions: ApiCompetitionExperience[];
  allUsers: ApiUser[];
  isCurrentUser: boolean;
  onUpdated: (updatedList: ApiCompetitionExperience[]) => void;
}

export default function CompetitionSection({
  competitions,
  allUsers,
  isCurrentUser,
  onUpdated,
}: CompetitionSectionProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingComp, setEditingComp] = useState<ApiCompetitionExperience | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const userMap = Object.fromEntries(allUsers.map((u) => [u._id, u]));

  async function handleDelete(comp_id: string) {
    setDeletingId(comp_id);
    try {
      const updatedList = await apiFetch<ApiCompetitionExperience[]>(
        `/api/v1/users/me/competitions/${comp_id}`,
        { method: "DELETE" }
      );
      onUpdated(updatedList);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="w-full">
      {/* Section header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-[#1b3168]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
          <h2 className="text-lg font-extrabold text-[#1b3168] tracking-tight">Competition Experience</h2>
        </div>
        {isCurrentUser && (
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-[#1b3168] text-white text-xs font-bold hover:bg-[#12224f] transition-colors shadow-sm"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Experience
          </button>
        )}
      </div>

      {/* Cards */}
      {competitions.length > 0 ? (
        <div className="flex flex-col gap-4">
          {competitions.map((comp) => (
            <div
              key={comp.id}
              className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 flex flex-col gap-3"
            >
              {/* Top row: name + role badges + delete */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col gap-1.5 min-w-0">
                  <h3 className="font-extrabold text-[#1b3168] text-base leading-tight">{comp.competition_name}</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {(comp.roles ?? []).map((r) => (
                      <span key={r} className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${ROLE_COLORS[r] ?? "bg-gray-100 text-gray-600"}`}>
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
                {isCurrentUser && (
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => { setEditingComp(comp); setModalOpen(true); }}
                      className="p-1.5 rounded-full hover:bg-blue-50 text-gray-300 hover:text-[#1b3168] transition-colors"
                      aria-label="Edit"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(comp.id)}
                      disabled={deletingId === comp.id}
                      className="p-1.5 rounded-full hover:bg-red-50 text-gray-300 hover:text-red-400 transition-colors disabled:opacity-40"
                      aria-label="Delete"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>

              {/* Detail */}
              {comp.detail && (
                <p className="text-sm text-gray-500 leading-relaxed">{comp.detail}</p>
              )}

              {/* Skills */}
              {comp.skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {comp.skills.map((skill) => (
                    <span key={skill} className="px-2.5 py-0.5 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
              )}

              {/* Contributors */}
              {comp.contributor_ids.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 font-semibold shrink-0">Team:</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {comp.contributor_ids.map((id) => {
                      const u = userMap[id];
                      if (!u) return null;
                      return (
                        <div key={id} className="flex items-center gap-1 bg-gray-50 border border-gray-100 rounded-full px-2 py-0.5">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={u.avatar_url ?? "/avatar.png"} alt={u.name} className="w-4 h-4 rounded-full object-cover" />
                          <span className="text-xs font-semibold text-gray-700">{u.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 border border-dashed border-gray-200 rounded-2xl bg-gray-50">
          <p className="text-sm text-gray-400 italic">No competition experience yet.</p>
          {isCurrentUser && (
            <button
              onClick={() => setModalOpen(true)}
              className="mt-3 px-5 py-2 rounded-full bg-[#1b3168] text-white text-xs font-bold hover:bg-[#12224f]"
            >
              Add your first experience
            </button>
          )}
        </div>
      )}

      {modalOpen && (
        <CompetitionModal
          allUsers={allUsers}
          existing={editingComp ?? undefined}
          onClose={() => { setModalOpen(false); setEditingComp(null); }}
          onSaved={onUpdated}
        />
      )}
    </section>
  );
}
