"use client";

import React, { useRef, useState, useEffect } from "react";
import { RoleIcon, SkillIcon } from "@/components/Icons";

export interface DetailedMember {
  name: string;
  avatar: string;
  role: string;
  score: number;
}

export interface TeamCardData {
  id: string;
  avatarUrl: string;
  title: string;
  authorName: string;
  dateRange: string;
  daysLeft: number;
  roles: string[];
  skills: string[];
  currentMembers: number;
  maxMembers: number;
  memberAvatars: string[];
  description?: string;
  detailedMembers?: DetailedMember[];
  joinStatus?: "leader" | "member" | "pending" | "rejected" | "open";
  myRequestId?: string;
}

interface TeamCardProps {
  data: TeamCardData;
  onRequest?: () => void;
  onCancel?: () => void;
}

const abbreviateRole = (role: string) => {
  const map: Record<string, string> = {
    "Developer": "Dev",
    "Business": "Biz",
    "UI/UX Designer": "UX",
    "Marketing": "Mktg",
    "AI / Data": "AI",
    "Pitching": "Pitch"
  };
  return map[role] || role;
};

function DynamicTagList({ tags, textColorClass }: { tags: string[], textColorClass: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(tags.length);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    const resizeObserver = new ResizeObserver(() => {
      const children = Array.from(container.children) as HTMLElement[];
      const containerWidth = container.clientWidth;
      const tagElements = children.filter(c => c.dataset.tag === "true");

      if (tagElements.length === 0) return;

      let currentLineWidth = 0;
      let lines = 1;
      let count = 0;
      const gap = 8;
      const moreWidth = 45; // Approx width of the "+N" badge
      
      for (let i = 0; i < tagElements.length; i++) {
        const childWidth = tagElements[i].offsetWidth;
        const isLast = (i === tagElements.length - 1);

        if (currentLineWidth > 0 && currentLineWidth + gap + childWidth > containerWidth) {
          lines++;
          currentLineWidth = childWidth;
        } else {
          currentLineWidth += (currentLineWidth > 0 ? gap : 0) + childWidth;
        }

        if (lines > 2) break;

        if (!isLast && lines === 2 && currentLineWidth + gap + moreWidth > containerWidth) {
          break;
        }

        count++;
      }
      
      setVisibleCount(count === 0 ? 1 : count);
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, [tags]);

  return (
    <div ref={containerRef} className="flex flex-wrap gap-2 w-full content-start relative min-h-[60px] overflow-hidden">
      {tags.map((tag, idx) => {
        const isVisible = idx < visibleCount;
        return (
          <span 
            key={idx} 
            data-tag="true"
            className={`bg-white border border-gray-100 shadow-sm ${textColorClass} text-[11px] font-semibold px-3 py-1 rounded-full items-center justify-center whitespace-nowrap
              ${isVisible ? 'flex' : 'absolute opacity-0 pointer-events-none -z-10'}
            `}
          >
            {tag}
          </span>
        );
      })}
      {tags.length > visibleCount && (
        <span className="bg-white border border-gray-100 shadow-sm text-gray-500 text-[11px] font-semibold px-2 py-1 rounded-full flex items-center justify-center whitespace-nowrap shrink-0">
          +{tags.length - visibleCount}
        </span>
      )}
    </div>
  );
}

export default function TeamCard({ data, onRequest, onCancel }: TeamCardProps) {
  const isUrgent = data.daysLeft <= 1;
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <article className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 flex flex-col gap-4 hover:shadow-md transition-shadow h-fit w-full">
      {/* ── Top Section ── */}
      <div className="flex items-start justify-between">
        <div className="flex gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden shrink-0 border border-gray-100 bg-gray-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={data.avatarUrl || "https://i.pravatar.cc/150"} alt={data.authorName} className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col justify-center">
            <h3 className="font-extrabold text-[#1b3168] text-lg leading-tight">{data.title}</h3>
            <p className="text-gray-600 font-medium text-sm mt-0.5">{data.authorName}</p>
            <p className="text-[#608bba] text-xs font-semibold mt-0.5">{data.dateRange}</p>
          </div>
        </div>

        <div className={`flex items-center gap-1.5 font-bold shrink-0 ${isUrgent ? 'text-red-500' : 'text-[#1b3168]'}`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-base">{data.daysLeft} วัน</span>
        </div>
      </div>

      {/* ── Tags Section ── */}
      <div className={`grid grid-cols-2 gap-4 mt-1 w-full min-w-0 transition-all duration-300`}>
        {/* Role Tag Column */}
        <div className="flex flex-col gap-2 min-w-0">
          <div className="flex items-center gap-1.5">
            <RoleIcon className="w-4 h-4 text-[#1b3168]" />
            <span className="text-[#1b3168] font-bold text-xs">Role Tag</span>
          </div>
          {isExpanded ? (
            <div className="flex flex-wrap content-start gap-2 min-h-[60px]">
              {data.roles.map((role, idx) => (
                <span key={idx} className="bg-white border border-gray-100 shadow-sm text-[#1b3168] text-[11px] font-semibold px-3 py-1 rounded-full flex items-center justify-center whitespace-nowrap">
                  {abbreviateRole(role)}
                </span>
              ))}
            </div>
          ) : (
            <DynamicTagList tags={data.roles.map(abbreviateRole)} textColorClass="text-[#1b3168]" />
          )}
        </div>

        {/* Skill Tag Column */}
        <div className="flex flex-col gap-2 min-w-0">
          <div className="flex items-center gap-1.5">
            <SkillIcon className="w-4 h-4 text-[#1b3168]" />
            <span className="text-[#1b3168] font-bold text-xs">Skill Tag</span>
          </div>
          {isExpanded ? (
            <div className="flex flex-wrap content-start gap-2 min-h-[60px]">
              {data.skills.map((skill, idx) => (
                <span key={idx} className="bg-white border border-gray-100 shadow-sm text-[#1b3168] text-[11px] font-semibold px-3 py-1 rounded-full flex items-center justify-center whitespace-nowrap">
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <DynamicTagList tags={data.skills} textColorClass="text-[#1b3168]" />
          )}
        </div>
      </div>

      {/* ── Expanded Content (Animated) ── */}
      <div className={`grid transition-all duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden flex flex-col gap-6">
          
          {/* Description Section */}
          {data.description && (
            <div className="flex flex-col gap-2 mt-4">
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-[#1b3168]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
                </svg>
                <span className="text-[#1b3168] font-bold text-xs">Description</span>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                {data.description}
              </p>
            </div>
          )}

          {/* Detailed Member List */}
          {data.detailedMembers && data.detailedMembers.length > 0 && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-[#1b3168]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="text-[#1b3168] font-bold text-xs">Current Members</span>
              </div>
              <div className="flex flex-col gap-2 pb-4">
                {data.detailedMembers.map((member, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-gray-200">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[#1b3168] font-bold text-sm leading-none">{member.name}</span>
                        <span className="text-gray-500 text-xs font-semibold mt-1">{member.role}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-[#1b3168] text-sm">{Number(member.score).toFixed(1)}</span>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/star-icon.svg" alt="star" className="w-4 h-4" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Divider */}
      <hr className="border-gray-200 -mt-4" />

      {/* ── Footer ── */}
      <div className="flex items-center justify-between mt-1">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[#1b3168] font-black text-sm">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            {data.currentMembers}/{data.maxMembers}
          </div>
          <div className="flex -space-x-2">
            {data.memberAvatars.map((url, i) => (
              <div key={i} className="w-7 h-7 rounded-full border border-white overflow-hidden bg-gray-200 shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`Member ${i+1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-8 h-8 rounded-full border-2 border-gray-200 text-[#1b3168] flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <svg className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {(!data.joinStatus || data.joinStatus === "open" || data.joinStatus === "rejected") && (
            <button
              onClick={onRequest}
              className="bg-[#1b3168] text-white text-xs font-bold tracking-widest px-6 py-2 rounded-full hover:bg-[#12224f] transition-colors"
            >
              REQUEST
            </button>
          )}
          {data.joinStatus === "pending" && (
            <button
              onClick={onCancel}
              className="bg-orange-50 text-orange-500 border border-orange-300 text-xs font-bold px-6 py-2 rounded-full hover:bg-orange-100 transition-colors"
            >
              PENDING ✕
            </button>
          )}
          {data.joinStatus === "member" && (
            <span className="bg-green-50 text-green-600 border border-green-200 text-xs font-bold px-6 py-2 rounded-full">
              JOINED ✓
            </span>
          )}
          {data.joinStatus === "leader" && (
            <span className="bg-[#eef1fa] text-[#1b3168] text-xs font-bold px-6 py-2 rounded-full">
              YOUR TEAM
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
