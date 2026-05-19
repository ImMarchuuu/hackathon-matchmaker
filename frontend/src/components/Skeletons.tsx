"use client";

import React from "react";

export function TeamCardSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 flex flex-col gap-4 h-fit w-full animate-pulse">
      {/* ── Top Section ── */}
      <div className="flex items-start justify-between">
        <div className="flex gap-4">
          <div className="w-16 h-16 rounded-full shrink-0 bg-gray-200" />
          <div className="flex flex-col justify-center gap-2">
            <div className="h-5 w-40 bg-gray-200 rounded" />
            <div className="h-4 w-24 bg-gray-200 rounded" />
            <div className="h-3.5 w-32 bg-gray-200 rounded" />
          </div>
        </div>
        <div className="h-6 w-14 bg-gray-200 rounded-full" />
      </div>

      {/* ── Tags Section ── */}
      <div className="grid grid-cols-2 gap-4 mt-1 w-full">
        {/* Role Column */}
        <div className="flex flex-col gap-2">
          <div className="h-4 w-20 bg-gray-200 rounded" />
          <div className="flex flex-wrap gap-2">
            <div className="h-6 w-14 bg-gray-200 rounded-full" />
            <div className="h-6 w-16 bg-gray-200 rounded-full" />
          </div>
        </div>
        {/* Skill Column */}
        <div className="flex flex-col gap-2">
          <div className="h-4 w-20 bg-gray-200 rounded" />
          <div className="flex flex-wrap gap-2">
            <div className="h-6 w-16 bg-gray-200 rounded-full" />
            <div className="h-6 w-12 bg-gray-200 rounded-full" />
          </div>
        </div>
      </div>

      {/* ── Bottom Section ── */}
      <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-50">
        <div className="h-8 w-24 bg-gray-200 rounded-full" />
        <div className="h-10 w-32 bg-gray-200 rounded-full" />
      </div>
    </div>
  );
}

export function PersonCardSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 flex flex-col gap-4 h-fit w-full animate-pulse">
      {/* ── Top Section ── */}
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-full shrink-0 bg-gray-200" />
        <div className="flex flex-col justify-center gap-2 flex-1 mt-1">
          <div className="h-5 w-32 bg-gray-200 rounded" />
          <div className="space-y-1.5 mt-1">
            <div className="h-4 w-full bg-gray-200 rounded" />
            <div className="h-4 w-5/6 bg-gray-200 rounded" />
          </div>
        </div>
      </div>

      {/* Divider */}
      <hr className="border-gray-100 mt-2" />

      {/* ── Tags Section ── */}
      <div className="flex flex-col gap-3 w-full mt-1">
        <div className="flex flex-col lg:flex-row gap-2 lg:gap-4 lg:items-center">
          <div className="h-4 w-20 bg-gray-200 rounded shrink-0" />
          <div className="flex flex-wrap gap-2 flex-1">
            <div className="h-6 w-12 bg-gray-200 rounded-full" />
            <div className="h-6 w-14 bg-gray-200 rounded-full" />
          </div>
        </div>
        <div className="flex flex-col lg:flex-row gap-2 lg:gap-4 lg:items-center">
          <div className="h-4 w-20 bg-gray-200 rounded shrink-0" />
          <div className="flex flex-wrap gap-2 flex-1">
            <div className="h-6 w-16 bg-gray-200 rounded-full" />
            <div className="h-6 w-12 bg-gray-200 rounded-full" />
          </div>
        </div>
      </div>

      {/* ── Bottom Section ── */}
      <div className="flex justify-end mt-2">
        <div className="h-10 w-32 bg-gray-200 rounded-full" />
      </div>
    </div>
  );
}

export function ActiveTeamCardSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 flex flex-col gap-4 h-fit w-full animate-pulse">
      <div className="flex items-start justify-between">
        <div className="flex gap-4">
          <div className="w-16 h-16 rounded-full shrink-0 bg-gray-200" />
          <div className="flex flex-col justify-center gap-2">
            <div className="h-5 w-40 bg-gray-200 rounded" />
            <div className="h-4 w-24 bg-gray-200 rounded" />
            <div className="h-3.5 w-32 bg-gray-200 rounded" />
          </div>
        </div>
        <div className="h-6 w-20 bg-gray-200 rounded-full" />
      </div>
      <div className="h-4 w-full bg-gray-200 rounded mt-2" />
      <div className="flex justify-end gap-2 mt-4">
        <div className="h-10 w-28 bg-gray-200 rounded-full" />
        <div className="h-10 w-28 bg-gray-200 rounded-full" />
      </div>
    </div>
  );
}

export function GenericDetailSkeleton() {
  return (
    <div className="w-full max-w-3xl bg-white rounded-3xl shadow-sm p-6 sm:p-8 border border-gray-100 flex flex-col gap-6 animate-pulse">
      {/* Top Banner / Cover */}
      <div className="w-full h-48 bg-gray-200 rounded-2xl" />

      {/* Profile Header */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mt-4">
        <div className="w-24 h-24 rounded-full bg-gray-200 shrink-0 border border-white -mt-12 sm:-mt-16" />
        <div className="flex flex-col gap-2 flex-1 items-center sm:items-start">
          <div className="h-7 w-48 bg-gray-200 rounded" />
          <div className="h-4 w-32 bg-gray-200 rounded" />
        </div>
      </div>

      {/* Description Block */}
      <div className="space-y-3 mt-4">
        <div className="h-4 w-full bg-gray-200 rounded" />
        <div className="h-4 w-full bg-gray-200 rounded" />
        <div className="h-4 w-3/4 bg-gray-200 rounded" />
      </div>

      {/* Subsections */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
        <div className="flex flex-col gap-3">
          <div className="h-5 w-24 bg-gray-200 rounded" />
          <div className="h-12 w-full bg-gray-200 rounded-xl" />
        </div>
        <div className="flex flex-col gap-3">
          <div className="h-5 w-24 bg-gray-200 rounded" />
          <div className="h-12 w-full bg-gray-200 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
