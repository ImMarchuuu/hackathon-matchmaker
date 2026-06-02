"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import type { ApiUser } from "@/types/profile";

interface ApiTeamDetail {
  _id: string;
  title: string;
  leader_id: string;
  members: ApiUser[];
  member_ids: string[];
  status: string;
}

interface TeammateState {
  user: ApiUser;
  stars: number;       // 0 = not selected yet
  submitted: boolean;
  submitting: boolean;
  error: string;
}

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          onMouseEnter={() => setHovered(s)}
          onMouseLeave={() => setHovered(0)}
          className="text-2xl transition-transform hover:scale-110 focus:outline-none"
          aria-label={`${s} star`}
        >
          <span className={(hovered || value) >= s ? "text-yellow-400" : "text-gray-200"}>★</span>
        </button>
      ))}
    </div>
  );
}

export default function RateTeamPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [team, setTeam] = useState<ApiTeamDetail | null>(null);
  const [me, setMe] = useState<ApiUser | null>(null);
  const [teammates, setTeammates] = useState<TeammateState[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [t, m, alreadyVoted] = await Promise.all([
        apiFetch<ApiTeamDetail>(`/api/v1/teams/${params.id}`),
        apiFetch<ApiUser>("/api/v1/users/me"),
        apiFetch<string[]>(`/api/v1/reviews/my?team_id=${params.id}`).catch(() => [] as string[]),
      ]);

      if (t.status !== "COMPLETED") {
        router.replace(`/teams/${params.id}`);
        return;
      }

      setTeam(t);
      setMe(m);

      const others = t.members.filter((u) => u._id !== m._id);
      setTeammates(
        others.map((u) => ({
          user: u,
          stars: 0,
          submitted: alreadyVoted.includes(u._id),
          submitting: false,
          error: "",
        }))
      );
    } catch {
      router.replace("/active-teams");
    } finally {
      setLoading(false);
    }
  }, [params.id, router]);

  useEffect(() => { load(); }, [load]);

  function setStars(userId: string, stars: number) {
    setTeammates((prev) =>
      prev.map((t) => (t.user._id === userId ? { ...t, stars } : t))
    );
  }

  async function submitRating(userId: string) {
    const entry = teammates.find((t) => t.user._id === userId);
    if (!entry || entry.stars === 0 || entry.submitting || entry.submitted) return;

    setTeammates((prev) =>
      prev.map((t) => (t.user._id === userId ? { ...t, submitting: true, error: "" } : t))
    );

    try {
      await apiFetch("/api/v1/reviews", {
        method: "POST",
        body: JSON.stringify({
          team_id: params.id,
          target_id: userId,
          stars_rate: entry.stars,
        }),
      });
      setTeammates((prev) =>
        prev.map((t) => (t.user._id === userId ? { ...t, submitted: true, submitting: false } : t))
      );
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "เกิดข้อผิดพลาด ลองใหม่อีกครั้ง";
      setTeammates((prev) =>
        prev.map((t) => (t.user._id === userId ? { ...t, submitting: false, error: msg } : t))
      );
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#1b3168] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!team || !me) return null;

  const allDone = teammates.every((t) => t.submitted);
  const pendingCount = teammates.filter((t) => !t.submitted).length;

  return (
    <div className="w-full min-h-screen bg-[#f4f6f8] py-8 px-4 sm:px-6 flex flex-col items-center gap-6">
      {/* Header */}
      <div className="w-full max-w-2xl flex items-center justify-between relative">
        <button
          onClick={() => router.back()}
          className="absolute left-0 flex items-center gap-1.5 px-4 py-2 rounded-full bg-white shadow-sm text-[#1b3168] font-bold text-sm hover:bg-gray-50"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          ย้อนกลับ
        </button>
        <h1 className="w-full text-center text-[#1b3168] font-black text-xl">ให้คะแนนเพื่อนร่วมทีม</h1>
      </div>

      {/* Team name */}
      <div className="w-full max-w-2xl text-center">
        <p className="text-gray-500 text-sm">ทีม <span className="font-bold text-[#1b3168]">{team.title}</span></p>
        {!allDone && (
          <p className="text-gray-400 text-xs mt-1">เหลืออีก {pendingCount} คนที่ยังไม่ได้ให้คะแนน</p>
        )}
      </div>

      {/* All done state */}
      {allDone ? (
        <div className="w-full max-w-2xl bg-white rounded-[2rem] shadow-sm border border-green-100 p-10 flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-[#1b3168] font-black text-lg">ให้คะแนนครบทุกคนแล้ว!</p>
          <p className="text-gray-500 text-sm text-center">ขอบคุณที่ให้ feedback เพื่อนร่วมทีม คะแนนจะถูกอัปเดตใน Skill Bank ของทุกคน</p>
          <Link href="/active-teams" className="mt-2 px-6 py-2.5 rounded-full bg-[#1b3168] text-white text-sm font-bold hover:bg-[#12224f] transition-colors">
            กลับหน้า Active Teams
          </Link>
        </div>
      ) : (
        /* Teammate cards */
        <div className="w-full max-w-2xl flex flex-col gap-4">
          {teammates.map((entry) => (
            <div
              key={entry.user._id}
              className={`bg-white rounded-[2rem] shadow-sm border p-6 flex flex-col gap-4 transition-colors ${
                entry.submitted ? "border-green-100 bg-green-50/30" : "border-gray-100"
              }`}
            >
              {/* Member info */}
              <div className="flex items-center gap-4">
                <Link href={`/profile/${entry.user.username}`} className="shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={entry.user.avatar_url ?? "/avatar.png"}
                    alt={entry.user.name}
                    className="w-14 h-14 rounded-full object-cover border border-gray-200 hover:opacity-80 transition-opacity"
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link href={`/profile/${entry.user.username}`} className="font-black text-[#1b3168] text-base hover:underline">
                    {entry.user.name}
                  </Link>
                  {entry.user.role[0] && (
                    <p className="text-gray-400 text-xs mt-0.5">{entry.user.role[0].name}</p>
                  )}
                </div>
                {entry.submitted && (
                  <div className="shrink-0 flex items-center gap-1.5 bg-green-100 text-green-600 text-xs font-bold px-3 py-1.5 rounded-full">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    ให้คะแนนแล้ว
                  </div>
                )}
              </div>

              {/* Star picker + submit */}
              {!entry.submitted && (
                <div className="flex flex-col gap-3 pl-1">
                  <div className="flex items-center gap-4">
                    <StarPicker
                      value={entry.stars}
                      onChange={(v) => setStars(entry.user._id, v)}
                    />
                    {entry.stars > 0 && (
                      <span className="text-sm text-gray-500 font-semibold">
                        {["", "แย่มาก", "พอใช้", "ดี", "ดีมาก", "ยอดเยี่ยม"][entry.stars]}
                      </span>
                    )}
                  </div>

                  {entry.error && (
                    <p className="text-red-500 text-xs font-semibold">{entry.error}</p>
                  )}

                  <button
                    onClick={() => submitRating(entry.user._id)}
                    disabled={entry.stars === 0 || entry.submitting}
                    className="self-start px-5 py-2 rounded-full bg-[#1b3168] text-white text-xs font-bold hover:bg-[#12224f] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {entry.submitting ? "กำลังส่ง…" : "ส่งคะแนน"}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
