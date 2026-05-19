"use client";

import React from "react";
import { TeamCardSkeleton } from "@/components/Skeletons";

export default function FindTeamLoading() {
  return (
    <div className="w-full space-y-6 pb-12">
      {/* Header Statically Rendered */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1b3168] tracking-tight">ค้นหาทีม</h1>
          <p className="text-sm text-gray-500 font-medium mt-0.5">ค้นหาหรือสร้างทีมที่ถูกใจ</p>
        </div>
      </div>

      {/* Mock Search Bar & Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 h-12 bg-gray-100 rounded-2xl animate-pulse" />
        <div className="h-12 w-28 bg-gray-100 rounded-2xl animate-pulse" />
      </div>

      {/* Tab Switchers */}
      <div className="flex gap-2 border-b border-gray-100 pb-px">
        <div className="h-10 w-24 bg-gray-100 rounded animate-pulse" />
        <div className="h-10 w-24 bg-gray-100 rounded animate-pulse" />
      </div>

      {/* Card Grid of Skeletons */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full items-start">
        {[1, 2, 3, 4].map((i) => (
          <TeamCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
