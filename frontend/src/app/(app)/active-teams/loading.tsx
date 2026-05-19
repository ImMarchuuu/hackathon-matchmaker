"use client";

import React from "react";
import { ActiveTeamCardSkeleton } from "@/components/Skeletons";

export default function ActiveTeamsLoading() {
  return (
    <div className="w-full space-y-8 pb-12 animate-pulse">
      {/* Header Statically Rendered */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#1b3168] tracking-tight">ทีมที่เข้าร่วม</h1>
        <p className="text-sm text-gray-300 font-medium mt-1.5 h-4 w-16 bg-gray-200 rounded" />
      </div>

      {/* Status Summary Pills */}
      <div className="flex gap-3 flex-wrap">
        <div className="h-8 w-28 bg-gray-200 rounded-full" />
        <div className="h-8 w-24 bg-gray-200 rounded-full" />
      </div>

      {/* Grid Skeletons */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full items-start">
        {[1, 2].map((i) => (
          <ActiveTeamCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
