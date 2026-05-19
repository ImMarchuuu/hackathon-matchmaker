"use client";

import React from "react";
import Link from "next/link";
import { CURRENT_USER_ID, mockUsers } from "@/data/mockData";

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

          {/* Section 5: Competitions (Placeholder) */}
          <section className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8 flex flex-col h-fit">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[#1b3168] font-extrabold text-xl">Competitions</h2>
              <button className="bg-[#1b3168] text-white px-5 py-2 rounded-full font-bold text-sm hover:bg-[#12224f] transition-colors flex items-center gap-1 shadow-sm">
                create
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
              </button>
            </div>
            
            <div className="w-full border-2 border-dashed border-gray-200 rounded-2xl py-12 flex flex-col items-center justify-center bg-gray-50/50">
              <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <p className="text-gray-400 font-bold tracking-wide">Coming Soon</p>
            </div>
          </section>
        </div>
      </div>
    </div>
    </div>
  );
}
