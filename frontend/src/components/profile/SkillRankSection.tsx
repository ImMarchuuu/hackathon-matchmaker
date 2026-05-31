import React from "react";

export interface SkillWithRank {
  name: string;
  rank: string; // "bronze", "silver", "gold", "diamond"
  icon?: string;
}

interface SkillRankSectionProps {
  skills?: SkillWithRank[];
}

export default function SkillRankSection({ 
  skills = [] 
}: SkillRankSectionProps) {
  
  return (
    <section className="relative rounded-[2rem] border border-gray-200 bg-white p-8 pt-12 flex-[1.5] shadow-sm mt-8">
      {/* Absolute centered title pill overlapping top border */}
      <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-white border border-gray-200 px-6 py-2 rounded-full flex items-center gap-2 shadow-sm text-[#1b3168] font-bold text-sm tracking-widest uppercase">
        <span className="text-[#1b3168]">💠</span>
        SKILL RANK
      </div>

      {skills.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 justify-items-center mt-2">
          {skills.map((skill) => (
            <div
              key={skill.name}
              className="flex flex-col items-center gap-3 p-2 transition-transform hover:scale-105"
            >
              <div className="w-20 h-20 sm:w-25 sm:h-25 flex items-center justify-center transition-transform hover:scale-110">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={`/${skill.rank}.svg`} 
                  alt={skill.rank} 
                  className="w-full h-full object-contain drop-shadow-md" 
                />
              </div>
              <span className="text-xs sm:text-sm font-extrabold text-[#1b3168] text-center">{skill.name}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full min-h-[150px]">
          <p className="text-sm text-gray-400 italic">
            No skills charted yet.
          </p>
        </div>
      )}
    </section>
  );
}
