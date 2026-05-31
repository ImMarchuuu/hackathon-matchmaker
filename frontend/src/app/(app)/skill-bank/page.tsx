"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CURRENT_USER_ID, mockUsers } from "@/data/mockData";
import ProjectCompetitionCard from "@/components/skill-bank/ProjectCompetitionCard";
import TeamCompetitionCard from "@/components/skill-bank/TeamCompetitionCard";

export type SkillRank = "Bronze" | "Silver" | "Gold" | "Diamond";

export interface SkillProgress {
  rank: SkillRank;
  current: number;
  total: number;
  isMax: boolean;
  color: string;
  textColor: string;
}

export function calculateSkillLevel(count: number): SkillProgress {
  if (count <= 2) {
    return { rank: "Bronze", current: count, total: 2, isMax: false, color: "bg-[#8B5A2B]", textColor: "text-[#8B5A2B]" };
  } else if (count <= 4) {
    return { rank: "Silver", current: count - 2, total: 2, isMax: false, color: "bg-[#C0C0C0]", textColor: "text-[#C0C0C0]" };
  } else if (count <= 7) {
    return { rank: "Gold", current: count - 4, total: 3, isMax: false, color: "bg-[#FFD700]", textColor: "text-[#FFD700]" };
  } else if (count <= 10) {
    return { rank: "Diamond", current: count - 7, total: 3, isMax: false, color: "bg-[#00BFFF]", textColor: "text-[#00BFFF]" };
  } else {
    return { rank: "Diamond", current: count, total: count, isMax: true, color: "bg-[#00BFFF]", textColor: "text-[#00BFFF]" };
  }
}

export function calculateOverallRank(skills: { count: number }[]): SkillProgress {
  if (skills.length === 0) return calculateSkillLevel(0);
  
  const rankValues: Record<SkillRank, number> = {
    "Bronze": 1,
    "Silver": 2,
    "Gold": 3,
    "Diamond": 4
  };
  
  const totalValue = skills.reduce((acc, skill) => {
    return acc + rankValues[calculateSkillLevel(skill.count).rank];
  }, 0);
  
  const avg = Math.round(totalValue / skills.length);
  
  // Create a synthetic progress for overall rank based on the average
  let overallRank: SkillRank = "Bronze";
  let color = "bg-[#8B5A2B]";
  let textColor = "text-[#8B5A2B]";
  
  if (avg === 1) { overallRank = "Bronze"; color = "bg-[#8B5A2B]"; textColor = "text-[#8B5A2B]"; }
  else if (avg === 2) { overallRank = "Silver"; color = "bg-[#C0C0C0]"; textColor = "text-[#C0C0C0]"; }
  else if (avg === 3) { overallRank = "Gold"; color = "bg-[#FFD700]"; textColor = "text-[#FFD700]"; }
  else if (avg >= 4) { overallRank = "Diamond"; color = "bg-[#00BFFF]"; textColor = "text-[#00BFFF]"; }
  
  // Calculate average progress fraction
  const totalProgressFraction = skills.reduce((acc, skill) => {
    const lvl = calculateSkillLevel(skill.count);
    return acc + (lvl.isMax ? 1 : lvl.current / lvl.total);
  }, 0);
  const avgProgress = totalProgressFraction / skills.length;
  
  return {
    rank: overallRank,
    current: Math.round(avgProgress * 100),
    total: 100,
    isMax: avg >= 4 && avgProgress >= 0.99,
    color,
    textColor
  };
}

export default function SkillBankPage() {
  const [activeTab, setActiveTab] = useState<"all" | "projects" | "teams">("all");
  const user = mockUsers[CURRENT_USER_ID];
  
  if (!user) {
    return <div className="p-8 text-center">User not found</div>;
  }

  const hardSkills = user.skillBank.hardSkills;
  const overallSkill = calculateOverallRank(hardSkills);

  // Filter out roles that have 0 mastery count
  const activeRoles = Object.entries(user.skillBank.roleMastery)
    .filter(([_, count]) => count > 0)
    .sort((a, b) => b[1] - a[1]);

  return (
    <div className="w-full min-h-screen bg-[#f5f7fa] py-4 sm:py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-6 pb-12">
        

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ── LEFT COLUMN ── */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          
          {/* Section 1: Rank Overall */}
          <section className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8 flex flex-col items-center">
            <h2 className="text-[#1b3168] font-extrabold text-3xl w-full text-center mb-6">Rank Overall</h2>
            
            <div className="w-40 h-40 mb-4 drop-shadow-xl relative flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={`/${overallSkill.rank.toLowerCase()}.svg`} 
                alt={`${overallSkill.rank} Medal`} 
                className="w-full h-full object-contain"
              />
            </div>
            
            <h3 className={`text-3xl font-black mb-6 ${overallSkill.textColor}`}>
              {overallSkill.rank}
            </h3>
            
            <div className="w-full space-y-2">
              <div className="w-full h-4 bg-[#0b1f5c] rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-[#00BFFF] rounded-full transition-all duration-1000 ease-out`}
                  style={{ width: `${overallSkill.isMax ? 100 : overallSkill.current}%` }}
                />
              </div>
            </div>
          </section>

          {/* Section 4: Soft Skill Score */}
          <section className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8 flex flex-col gap-6">
            <div className="flex items-center gap-2">
              <h2 className="text-[#1b3168] font-extrabold text-xl">Soft skill</h2>
              <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
            </div>
            
            <div className="flex flex-row items-center justify-center gap-6 lg:gap-0">
              {/* Left: Overall Numeric */}
              <div className="flex items-end gap-1">
                <span className="text-5xl font-black text-black leading-none">{user.skillBank.softSkillScore}</span>
                <svg className="w-10 h-10 text-yellow-400 mb-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                </svg>
              </div>
              
              {/* Right: Role Specific */}
              <div className="flex flex-col gap-3">
                {user.skillBank.roleSoftSkills.map((rs, idx) => (
                  <div key={idx} className="bg-white border border-gray-100 rounded-xl px-4 py-2 shadow-sm flex flex-col items-center min-w-[140px]">
                    <span className="text-gray-600 font-semibold text-xs mb-1">{rs.role}</span>
                    <div className="flex items-center gap-1">
                      <span className="text-black font-extrabold text-lg">{rs.score} / 5</span>
                      <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Section 2: Role Mastery */}
          <section className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8">
            <div className="flex items-center gap-2 mb-6">
              <h2 className="text-[#1b3168] font-extrabold text-xl">Role mastery</h2>
              <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {activeRoles.map(([role, count]) => (
                <div key={role} className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 flex flex-col items-center justify-center min-h-[100px]">
                  <span className="text-gray-800 font-semibold text-sm text-center mb-2">{role}</span>
                  <span className="text-black font-black text-3xl leading-none">{count}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Section 3: Hard Skill List */}
          <section className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8 flex-grow">
            <div className="flex items-center gap-2 mb-6">
              <h2 className="text-[#1b3168] font-extrabold text-xl">Hard skill</h2>
              <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {hardSkills.map((skill, idx) => {
                const level = calculateSkillLevel(skill.count);
                const progressWidth = level.isMax ? "100%" : `${(level.current / level.total) * 100}%`;
                
                return (
                  <div key={idx} className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 flex items-center gap-4">
                    <div className="w-14 h-14 shrink-0 drop-shadow-sm flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={`/${level.rank.toLowerCase()}.svg`} alt={level.rank} className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-end mb-2">
                        <span className="font-semibold text-gray-800 text-sm truncate pr-2">{skill.name}</span>
                        <span className="font-black text-black text-lg leading-none">
                          {level.isMax ? skill.count : `${level.current} / ${level.total}`}
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-[#0b1f5c] rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${level.color} rounded-full`} 
                          style={{ width: progressWidth }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Section 5: Competitions & Projects */}
          <section className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8 flex flex-col h-fit">
            {/* Header Structure (Flexbox Layout) */}
            <div className="flex flex-col gap-4 mb-6">
              {/* Row 1 (Titles & Action) */}
              <div className="flex flex-row justify-between items-start w-full">
                <div>
                  <h2 className="text-[#1b3168] font-extrabold text-xl">Competitions & Projects</h2>
                  <p className="text-gray-500 text-xs mt-0.5">ประวัติผลงานการแข่งขันและโปรเจกต์เด่นของคุณ</p>
                </div>
                {/* Create Button */}
                <button className="bg-[#0B1A42] text-white px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm hover:bg-[#06102a] transition-all flex items-center gap-1.5 shadow-sm shrink-0 active:scale-95">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  <span>สร้างโปรเจค</span>
                </button>
              </div>
              
              {/* Row 2 (Filter Toggle) */}
              <div className="flex justify-center md:justify-start w-full">
                <div className="flex bg-gray-100 p-1 rounded-xl shrink-0">
                  <button
                    onClick={() => setActiveTab("all")}
                    className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${
                      activeTab === "all" ? "bg-[#1b3168] text-white shadow-sm" : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    ALL
                  </button>
                  <button
                    onClick={() => setActiveTab("projects")}
                    className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${
                      activeTab === "projects" ? "bg-[#1b3168] text-white shadow-sm" : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    PROJECTS
                  </button>
                  <button
                    onClick={() => setActiveTab("teams")}
                    className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${
                      activeTab === "teams" ? "bg-[#1b3168] text-white shadow-sm" : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    TEAMS
                  </button>
                </div>
              </div>
            </div>

            {/* Vertical Stack Layout */}
            <div className="flex flex-col gap-4 w-full">
              {(activeTab === "all" || activeTab === "projects") && (
                <>
                  <ProjectCompetitionCard
                    id="mod-pao"
                    title="Mod Pao - Smart Vending Machine"
                    subtitle="Frontend (Next.js)"
                    date="May 2026"
                  />
                  <ProjectCompetitionCard
                    id="heart-disease"
                    title="Heart Disease Predictive Model"
                    subtitle="Data Scientist"
                    date="April 2026"
                  />
                </>
              )}

              {(activeTab === "all" || activeTab === "teams") && (
                <>
                  <TeamCompetitionCard
                    id="line-innovators"
                    title="LINE Innovators"
                    subtitle="Strategist"
                    date="Feb 2026"
                    status="Pending"
                    members={4}
                  />
                  <TeamCompetitionCard
                    id="ai-hackathon"
                    title="AI Engineering Hackathon"
                    subtitle="AI Engineer"
                    date="March 2026"
                    status="Finished"
                    members={5}
                  />
                </>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
    </div>
  );
}
