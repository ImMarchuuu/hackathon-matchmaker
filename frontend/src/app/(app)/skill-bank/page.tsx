"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import ProjectCompetitionCard from "@/components/skill-bank/ProjectCompetitionCard";
import TeamCompetitionCard from "@/components/skill-bank/TeamCompetitionCard";
import AddProjectModal from "@/components/skill-bank/AddProjectModal";
import type { ApiRankSummary } from "@/types/skill";
import type { ApiUser } from "@/types/profile";
import type { ApiCompetitionExperience } from "@/types/profile";

type TabFilter = "all" | "projects" | "competitions";

const RANK_COLORS: Record<string, { text: string; bar: string }> = {
  Bronze:  { text: "text-[#8B5A2B]",  bar: "bg-[#8B5A2B]" },
  Silver:  { text: "text-[#C0C0C0]",  bar: "bg-[#C0C0C0]" },
  Gold:    { text: "text-[#FFD700]",   bar: "bg-[#FFD700]" },
  Diamond: { text: "text-[#00BFFF]",  bar: "bg-[#00BFFF]" },
};

function overallProgressPercent(rank: string, skills: ApiRankSummary["skills"]): number {
  if (!skills.length) return 0;
  const total = skills.reduce((acc, s) => acc + (s.is_max ? 1 : s.progress_current / s.progress_total), 0);
  return Math.round((total / skills.length) * 100);
}

function fmtDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { month: "short", year: "numeric" });
}

export default function SkillBankPage() {
  const [activeTab, setActiveTab] = useState<TabFilter>("all");
  const [me, setMe] = useState<ApiUser | null>(null);
  const [rankSummary, setRankSummary] = useState<ApiRankSummary | null>(null);
  const [competitions, setCompetitions] = useState<ApiCompetitionExperience[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddProject, setShowAddProject] = useState(false);

  useEffect(() => {
    apiFetch<ApiUser>("/api/v1/users/me")
      .then(async (user) => {
        setMe(user);
        const [summary, comps] = await Promise.all([
          apiFetch<ApiRankSummary>(`/api/v1/users/${user._id}/rank-summary`),
          apiFetch<ApiCompetitionExperience[]>("/api/v1/users/me/competitions"),
        ]);
        setRankSummary(summary);
        setCompetitions(comps);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-[#f5f7fa] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#1b3168] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!me || !rankSummary) {
    return <div className="p-8 text-center text-gray-400">ไม่พบข้อมูล</div>;
  }

  const overall = rankSummary.rank_overall;
  const rankColor = RANK_COLORS[overall] ?? RANK_COLORS.Bronze;
  const progressPct = overallProgressPercent(overall, rankSummary.skills);

  const activeRoles = [...rankSummary.roles]
    .filter((r) => r.project_count > 0)
    .sort((a, b) => b.project_count - a.project_count);

  const visibleComps = competitions.filter((c) => {
    if (activeTab === "projects") return c.type === "project";
    if (activeTab === "competitions") return c.type === "team";
    return true;
  });

  return (
    <div className="w-full min-h-screen bg-[#f5f7fa] py-4 sm:py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-6 pb-12">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── LEFT COLUMN ── */}
          <div className="lg:col-span-1 flex flex-col gap-6">

            {/* Rank Overall */}
            <section className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8 flex flex-col items-center">
              <h2 className="text-[#1b3168] font-extrabold text-3xl w-full text-center mb-6">Rank Overall</h2>
              <div className="w-40 h-40 mb-4 drop-shadow-xl flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/${overall.toLowerCase()}.svg`} alt={overall} className="w-full h-full object-contain" />
              </div>
              <h3 className={`text-3xl font-black mb-6 ${rankColor.text}`}>{overall}</h3>
              <div className="w-full space-y-2">
                <div className="w-full h-4 bg-[#0b1f5c] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#00BFFF] rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>
            </section>

            {/* Soft Skill */}
            <section className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <h2 className="text-[#1b3168] font-extrabold text-xl">Soft skill</h2>
                <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                </svg>
              </div>
              <div className="flex items-center justify-center gap-2">
                <span className="text-6xl font-black text-black leading-none">
                  {rankSummary.behavioral_rates.toFixed(1)}
                </span>
                <svg className="w-12 h-12 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
              </div>
              <p className="text-center text-xs text-gray-400">คะแนนเฉลี่ยจากเพื่อนร่วมทีม</p>
            </section>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="lg:col-span-2 flex flex-col gap-6">

            {/* Role Mastery */}
            <section className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8">
              <div className="flex items-center gap-2 mb-6">
                <h2 className="text-[#1b3168] font-extrabold text-xl">Role mastery</h2>
                <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                </svg>
              </div>
              {activeRoles.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">ยังไม่มีข้อมูล Role</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {activeRoles.map((r) => (
                    <div key={r.name} className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 flex flex-col items-center justify-center min-h-[100px]">
                      <span className="text-gray-800 font-semibold text-sm text-center mb-2">{r.name}</span>
                      <span className="text-black font-black text-3xl leading-none">{r.project_count}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Hard Skills */}
            <section className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8 flex-grow">
              <div className="flex items-center gap-2 mb-6">
                <h2 className="text-[#1b3168] font-extrabold text-xl">Hard skill</h2>
                <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                </svg>
              </div>
              {rankSummary.skills.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">ยังไม่มีข้อมูล Skill</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {rankSummary.skills.map((skill) => {
                    const color = RANK_COLORS[skill.rank_title] ?? RANK_COLORS.Bronze;
                    const progressWidth = skill.is_max ? "100%" : `${(skill.progress_current / skill.progress_total) * 100}%`;
                    return (
                      <div key={skill.name} className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 flex items-center gap-4">
                        <div className="w-14 h-14 shrink-0 drop-shadow-sm">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={`/${skill.rank_title.toLowerCase()}.svg`} alt={skill.rank_title} className="w-full h-full object-contain" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-end mb-2">
                            <span className="font-semibold text-gray-800 text-sm truncate pr-2">{skill.name}</span>
                            <span className="font-black text-black text-lg leading-none">
                              {skill.is_max ? skill.project_count : `${skill.progress_current} / ${skill.progress_total}`}
                            </span>
                          </div>
                          <div className="w-full h-2.5 bg-[#0b1f5c] rounded-full overflow-hidden">
                            <div className={`h-full ${color.bar} rounded-full`} style={{ width: progressWidth }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Competitions & Projects */}
            <section className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8 flex flex-col h-fit">
              <div className="flex flex-col gap-4 mb-6">
                <div className="flex flex-row justify-between items-start w-full">
                  <div>
                    <h2 className="text-[#1b3168] font-extrabold text-xl">Competitions & Projects</h2>
                    <p className="text-gray-500 text-xs mt-0.5">ประวัติผลงานการแข่งขันและโปรเจกต์เด่นของคุณ</p>
                  </div>
                  <button
                    onClick={() => setShowAddProject(true)}
                    className="bg-[#0B1A42] text-white px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm hover:bg-[#06102a] transition-all flex items-center gap-1.5 shadow-sm shrink-0 active:scale-95"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    <span>สร้างโปรเจค</span>
                  </button>
                </div>

                <div className="flex justify-center md:justify-start w-full">
                  <div className="flex bg-gray-100 p-1 rounded-xl shrink-0">
                    {(["all", "projects", "competitions"] as TabFilter[]).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${activeTab === tab ? "bg-[#1b3168] text-white shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                      >
                        {tab.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4 w-full">
                {visibleComps.length === 0 && (
                  <p className="text-gray-400 text-sm text-center py-6">ยังไม่มีข้อมูล</p>
                )}
                {visibleComps.map((comp) =>
                  comp.type === "project" ? (
                    <ProjectCompetitionCard
                      key={comp.id}
                      id={comp.id}
                      title={comp.competition_name}
                      subtitle={comp.roles[0] ?? ""}
                      date={fmtDate(comp.date)}
                      githubUrl={comp.github_url ?? undefined}
                    />
                  ) : (
                    <TeamCompetitionCard
                      key={comp.id}
                      id={comp.team_id ?? comp.id}
                      title={comp.competition_name}
                      subtitle={comp.roles[0] ?? ""}
                      date={fmtDate(comp.date)}
                      status={comp.reviewed ? "Finished" : "Pending"}
                      members={comp.contributor_ids.length + 1}
                    />
                  )
                )}
              </div>
            </section>
          </div>
        </div>
      </div>

      {showAddProject && (
        <AddProjectModal
          onClose={() => setShowAddProject(false)}
          onSaved={(newList) => {
            setCompetitions(newList);
            setShowAddProject(false);
          }}
        />
      )}
    </div>
  );
}
