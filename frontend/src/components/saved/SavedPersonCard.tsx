"use client";

import Link from "next/link";
import type { ApiUser } from "@/types/profile";

interface SavedPersonCardProps {
  user: ApiUser;
  onUnsaveClick: () => void;
}

export default function SavedPersonCard({ user, onUnsaveClick }: SavedPersonCardProps) {
  return (
    <Link
      href={`/profile/${user.username}`}
      className="group block bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow h-fit"
    >
      {/* ── Cover Image ── */}
      <div className="relative w-full h-28 bg-gradient-to-r from-[#1b3168] to-[#3b5baa] overflow-hidden">
        {user.cover_image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.cover_image}
            alt=""
            className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500"
          />
        )}
      </div>

      {/* ── Bottom Info Section ── */}
      <div className="relative px-5 pb-5 pt-2">
        {/* Overlapping Avatar */}
        <div className="absolute -top-8 left-5">
          <div className="w-16 h-16 rounded-full border-4 border-white overflow-hidden bg-white shadow-md">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={user.avatar_url ?? "/avatar.png"}
              alt={user.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div className="mt-10">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-extrabold text-[#1b3168] text-base leading-tight truncate">
                {user.name}
              </h3>
              {user.role.length > 0 && (
                <p className="text-gray-500 text-xs font-semibold mt-1">
                  {user.role[0].name}
                </p>
              )}
            </div>

            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onUnsaveClick();
              }}
              className="shrink-0 p-1 mt-0.5 hover:opacity-70 transition-opacity active:scale-90"
              aria-label={`Remove ${user.name} from saved`}
            >
              <svg className="w-6 h-6 text-[#1b3168]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
