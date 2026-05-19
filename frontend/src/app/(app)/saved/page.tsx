"use client";

import { useState } from "react";
import Link from "next/link";
import SavedPersonCard from "@/components/saved/SavedPersonCard";
import { mockUsers, savedUserIds, User } from "@/data/mockData";

export default function SavedPage() {
  const [savedIds, setSavedIds] = useState<string[]>(savedUserIds);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const savedUsers = savedIds
    .map((id) => mockUsers[id])
    .filter(Boolean);

  const handleUnsaveClick = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleConfirmRemove = () => {
    if (selectedUser) {
      setSavedIds((prev) => prev.filter((id) => id !== selectedUser.id));
    }
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  return (
    <div className="space-y-6 w-full pb-8">
      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#1b3168] tracking-tight">Saved People</h1>
        <p className="text-sm text-gray-500 font-medium">{savedUsers.length} people saved</p>
      </div>

      {/* ── Grid ── */}
      {savedUsers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedUsers.map((user, idx) => (
            <SavedPersonCard
              key={user.id}
              user={user}
              teammateCount={10 + idx * 5}
              onUnsaveClick={() => handleUnsaveClick(user)}
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

      {/* ═══════════════════════════════════════════
          Unsave Confirmation Modal
          ═══════════════════════════════════════════ */}
      {isModalOpen && selectedUser && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={handleCancel}
        >
          <div
            className="bg-white rounded-[2rem] shadow-2xl border border-gray-100 w-full max-w-sm p-8 flex flex-col items-center gap-6 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full border-4 border-gray-100 overflow-hidden shadow-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedUser.avatarUrl}
                alt={selectedUser.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Message */}
            <div className="text-center space-y-2">
              <h3 className="text-[#1b3168] font-extrabold text-lg">Remove from Saved?</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Are you sure you want to remove{" "}
                <span className="font-bold text-[#1b3168]">{selectedUser.name}</span>{" "}
                from your saved list?
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 w-full">
              <button
                onClick={handleCancel}
                className="flex-1 py-3 rounded-full border-2 border-gray-200 bg-white text-gray-600 text-sm font-bold tracking-wide hover:bg-gray-50 transition-colors shadow-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRemove}
                className="flex-1 py-3 rounded-full bg-red-500 text-white text-sm font-bold tracking-wide hover:bg-red-600 transition-colors shadow-md"
              >
                Confirm Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
