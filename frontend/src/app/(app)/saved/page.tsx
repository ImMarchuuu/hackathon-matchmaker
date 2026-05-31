"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import SavedPersonCard from "@/components/saved/SavedPersonCard";
import type { ApiUser } from "@/types/profile";

export default function SavedPage() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<ApiUser | null>(null);
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await apiFetch<ApiUser[]>("/api/v1/users/me/favorites");
        if (!cancelled) setFavorites(data);
      } catch {
        if (!cancelled) router.replace("/login");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [router]);

  async function handleConfirmRemove() {
    if (!selectedUser || removing) return;
    setRemoving(true);
    try {
      await apiFetch(`/api/v1/users/${selectedUser._id}/favorite`, { method: "POST" });
      setFavorites((prev) => prev.filter((u) => u._id !== selectedUser._id));
    } finally {
      setRemoving(false);
      setSelectedUser(null);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 w-full pb-8">
        <div className="h-8 w-40 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden animate-pulse">
              <div className="h-28 bg-gray-200" />
              <div className="p-5 pt-10 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-2/3" />
                <div className="h-3 bg-gray-200 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full pb-8">
      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#1b3168] tracking-tight">Saved People</h1>
        <p className="text-sm text-gray-500 font-medium">{favorites.length} people saved</p>
      </div>

      {/* ── Grid ── */}
      {favorites.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((user) => (
            <SavedPersonCard
              key={user._id}
              user={user}
              onUnsaveClick={() => setSelectedUser(user)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z" />
            </svg>
          </div>
          <p className="text-gray-400 font-semibold text-sm">No saved people yet.</p>
          <Link
            href="/find-team"
            className="px-6 py-2.5 rounded-full bg-[#1b3168] text-white text-sm font-bold hover:bg-[#12224f] transition-colors shadow-sm"
          >
            Discover People
          </Link>
        </div>
      )}

      {/* ── Unsave Confirmation Modal ── */}
      {selectedUser && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => !removing && setSelectedUser(null)}
        >
          <div
            className="bg-white rounded-[2rem] shadow-2xl border border-gray-100 w-full max-w-sm p-8 flex flex-col items-center gap-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-20 h-20 rounded-full border-4 border-gray-100 overflow-hidden shadow-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedUser.avatar_url ?? "/avatar.png"}
                alt={selectedUser.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-[#1b3168] font-extrabold text-lg">Remove from Saved?</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Are you sure you want to remove{" "}
                <span className="font-bold text-[#1b3168]">{selectedUser.name}</span>{" "}
                from your saved list?
              </p>
            </div>

            <div className="flex gap-3 w-full">
              <button
                onClick={() => setSelectedUser(null)}
                disabled={removing}
                className="flex-1 py-3 rounded-full border-2 border-gray-200 bg-white text-gray-600 text-sm font-bold tracking-wide hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRemove}
                disabled={removing}
                className="flex-1 py-3 rounded-full bg-red-500 text-white text-sm font-bold tracking-wide hover:bg-red-600 transition-colors shadow-md disabled:opacity-60"
              >
                {removing ? "Removing…" : "Confirm Remove"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
