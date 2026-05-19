"use client";

import React from "react";
import { PersonCardSkeleton } from "@/components/Skeletons";

export default function SavedLoading() {
  return (
    <div className="space-y-6 w-full pb-8">
      {/* Header Statically Rendered */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#1b3168] tracking-tight">Saved People</h1>
        <p className="text-sm text-gray-300 font-medium mt-1.5 h-4 w-24 bg-gray-100 rounded animate-pulse" />
      </div>

      {/* Grid Skeletons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <PersonCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
