"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { RoleIcon, SkillIcon } from "@/components/Icons";
import { apiFetch } from "@/lib/api";

export interface PersonCardData {
  id: string;
  username: string;
  name: string;
  bio: string;
  avatarUrl: string;
  roleTags: string[];
  skillTags: string[];
  isFavorited: boolean;
}

interface PersonCardProps {
  data: PersonCardData;
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

        // STRICT 1-ROW LIMIT for PersonCard
        if (lines > 1) break;

        if (!isLast && lines === 1 && currentLineWidth + gap + moreWidth > containerWidth) {
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
    <div ref={containerRef} className="flex flex-wrap gap-2 w-full content-start relative min-h-[28px] overflow-hidden pointer-events-none">
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

export default function PersonCard({ data }: PersonCardProps) {
  const [isFavorited, setIsFavorited] = useState(data.isFavorited);
  const [saving, setSaving] = useState(false);

  return (
    <article className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow h-fit w-full p-6 flex flex-col gap-4">
      {/* ── Top Section (Clickable) ── */}
      <Link
        href={`/profile/${data.username}`}
        className="flex items-start gap-4 p-3 -m-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1b3168]"
        aria-label={`View profile for ${data.name}`}
      >
        {/* Avatar */}
        <div className="w-16 h-16 rounded-full overflow-hidden shrink-0 border border-gray-100 bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={data.avatarUrl || "https://i.pravatar.cc/150"} alt={data.name} className="w-full h-full object-cover" />
        </div>
        {/* Info */}
        <div className="flex flex-col justify-center min-w-0 mt-1">
          <h3 className="font-extrabold text-[#1b3168] text-lg leading-tight truncate">{data.name}</h3>
          <p className="text-gray-500 font-medium text-sm mt-1 line-clamp-2 leading-relaxed">
            {data.bio}
          </p>
        </div>
      </Link>

      {/* Divider */}
      <hr className="border-gray-100 mt-2" />

      {/* ── Tags Section ── */}
      {/* Both rows always render (placeholder when empty) so every card reserves
          the same height and cards stay aligned across a grid row. */}
      <div className="flex flex-col gap-2 w-full min-w-0 mt-1">

        {/* Role Tags (Row layout style matching design) */}
        <div className="flex flex-col lg:flex-row gap-2 lg:gap-4 lg:items-center min-w-0">
          <div className="flex items-center gap-1.5 shrink-0 w-[100px]">
            <RoleIcon className="w-4 h-4 text-[#1b3168]" />
            <span className="text-[#1b3168] font-bold text-xs whitespace-nowrap">Role Tag :</span>
          </div>
          <div className="flex-1 min-w-0">
            {data.roleTags && data.roleTags.length > 0 ? (
              <DynamicTagList tags={data.roleTags.map(abbreviateRole)} textColorClass="text-[#1b3168]" />
            ) : (
              <div className="flex items-center min-h-[28px]">
                <span className="text-gray-300 text-[11px] font-semibold italic">ยังไม่ได้ระบุ</span>
              </div>
            )}
          </div>
        </div>

        {/* Skill Tags */}
        <div className="flex flex-col lg:flex-row gap-2 lg:gap-4 lg:items-center min-w-0">
          <div className="flex items-center gap-1.5 shrink-0 w-[100px]">
            <SkillIcon className="w-4 h-4 text-[#1b3168]" />
            <span className="text-[#1b3168] font-bold text-xs whitespace-nowrap">Skill Tag :</span>
          </div>
          <div className="flex-1 min-w-0">
            {data.skillTags && data.skillTags.length > 0 ? (
              <DynamicTagList tags={data.skillTags} textColorClass="text-[#1b3168]" />
            ) : (
              <div className="flex items-center min-h-[28px]">
                <span className="text-gray-300 text-[11px] font-semibold italic">ยังไม่ได้ระบุ</span>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* ── Bottom Section ── */}
      <div className="flex justify-end mt-2">
        <button
          disabled={saving}
          onClick={async (e) => {
            e.preventDefault();
            setSaving(true);
            const next = !isFavorited;
            setIsFavorited(next);
            try {
              if (next) {
                await apiFetch(`/api/v1/users/${data.id}/favorite`, { method: "POST" });
              } else {
                await apiFetch(`/api/v1/users/${data.id}/favorite`, { method: "DELETE" });
              }
            } catch {
              setIsFavorited(!next);
            } finally {
              setSaving(false);
            }
          }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold tracking-wide transition-all shadow-sm disabled:opacity-60 ${
            isFavorited
              ? "bg-[#1b3168] text-white border-2 border-[#1b3168] hover:bg-[#12224f] hover:border-[#12224f]"
              : "bg-white text-[#1b3168] border-2 border-[#1b3168] hover:bg-gray-50"
          }`}
        >
          <svg
            className="w-4 h-4"
            fill={isFavorited ? "currentColor" : "none"}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
            />
          </svg>
          {isFavorited ? "Favorite" : "Add to Favorite"}
        </button>
      </div>
    </article>
  );
}
