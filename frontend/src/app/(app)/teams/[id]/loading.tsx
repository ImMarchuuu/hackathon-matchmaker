"use client";

import React from "react";
import { GenericDetailSkeleton } from "@/components/Skeletons";

export default function TeamDetailLoading() {
  return (
    <div className="w-full flex justify-center py-6 sm:py-8">
      <GenericDetailSkeleton />
    </div>
  );
}
