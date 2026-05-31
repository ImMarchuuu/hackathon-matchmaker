"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import type { ApiUser } from "@/types/profile";

function ProfilePopup({ onClose, user }: { onClose: () => void; user: ApiUser | null }) {
  return (
    <div className="absolute top-[110%] right-0 mt-1 w-72 bg-white rounded-[2rem] shadow-xl border border-gray-100 p-6 z-50 flex flex-col gap-5 cursor-default origin-top-right animate-in fade-in zoom-in-95 duration-200">
      {/* ── Profile Summary ── */}
      <div className="flex flex-col items-center gap-1">
        <div className="w-20 h-20 rounded-full border-4 border-white shadow-sm overflow-hidden bg-gray-50 shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={user?.avatar_url ?? "/avatar.png"} alt={user?.name ?? "Profile"} className="w-full h-full object-cover" />
        </div>
        <div className="text-center mt-2">
          <h4 className="text-[#1b3168] font-black text-xl leading-none">{user?.name ?? "—"}</h4>
          <p className="text-gray-500 font-semibold text-xs mt-1.5">{user?.email ?? "—"}</p>
        </div>
      </div>

      {/* Divider */}
      <hr className="border-gray-100 -mx-6 mt-1 mb-1" />

      {/* ── Action Buttons ── */}
      <div className="flex flex-col gap-3">
        <Link 
          href="/profile" 
          onClick={onClose} 
          className="w-full bg-[#1b3168] text-white font-bold tracking-wide py-3.5 rounded-full text-center hover:bg-[#12224f] transition-colors text-sm shadow-sm"
        >
          My Profile
        </Link>
        <Link 
          href="/settings" 
          onClick={onClose} 
          className="w-full bg-white text-[#1b3168] border border-gray-200 font-bold tracking-wide py-3.5 rounded-full text-center hover:bg-gray-50 transition-colors text-sm shadow-sm"
        >
          Setting
        </Link>
        <button
          onClick={async () => {
            try {
              await apiFetch("/api/v1/auth/logout", { method: "POST" });
            } catch {
              // even if the request fails, clear the cookie and redirect
            }
            document.cookie = "grandline_auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            onClose?.();
            window.location.href = "/login";
          }}
          className="w-full bg-white text-[#ff4d4f] border border-[#ff4d4f]/30 font-bold tracking-wide py-3.5 rounded-full text-center hover:bg-red-50 transition-colors text-sm shadow-sm mt-1"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

function NotificationPopup({ onUnreadCount }: { onUnreadCount: (n: number) => void }) {
  const [notifications, setNotifications] = React.useState<import("@/types/notification").ApiNotification[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    apiFetch<import("@/types/notification").ApiNotification[]>("/api/v1/notifications")
      .then((data) => {
        setNotifications(data);
        onUnreadCount(data.filter((n) => !n.read).length);
        // Auto-mark all as read in the background once the popup is opened
        if (data.some((n) => !n.read)) {
          apiFetch("/api/v1/notifications/read-all", { method: "PATCH" })
            .then(() => onUnreadCount(0))
            .catch(() => {});
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [onUnreadCount]);

  const [resolvingId, setResolvingId] = React.useState<string | null>(null);
  const [resolvedMap, setResolvedMap] = React.useState<Record<string, "approved" | "rejected" | "error">>({});

  async function clearAll() {
    await apiFetch("/api/v1/notifications", { method: "DELETE" }).catch(() => {});
    setNotifications([]);
    onUnreadCount(0);
  }

  async function resolveRequest(
    notifId: string,
    teamId: string,
    reqId: string,
    status: "approved" | "rejected",
  ) {
    setResolvingId(notifId);
    try {
      await apiFetch(`/api/v1/teams/${teamId}/requests/${reqId}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setResolvedMap((prev) => ({ ...prev, [notifId]: status }));
    } catch {
      setResolvedMap((prev) => ({ ...prev, [notifId]: "error" }));
      setTimeout(() => {
        setResolvedMap((prev) => { const next = { ...prev }; delete next[notifId]; return next; });
      }, 2500);
    } finally {
      setResolvingId(null);
    }
  }

  function fmtTime(iso: string) {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 60) return `${m || 1} นาทีที่แล้ว`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h} ชั่วโมงที่แล้ว`;
    return `${Math.floor(h / 24)} วันที่แล้ว`;
  }

  return (
    <div className="absolute top-[140%] right-[-60px] sm:right-0 mt-1 w-[340px] sm:w-[400px] bg-white rounded-[2rem] shadow-xl border border-gray-100 p-5 z-50 flex flex-col gap-4 cursor-default origin-top-right animate-in fade-in zoom-in-95 duration-200">
      <div className="flex justify-between items-center px-2">
        <h3 className="text-[#1b3168] font-black text-lg">การแจ้งเตือน</h3>
        <button onClick={clearAll} className="text-red-400 font-bold text-sm hover:text-red-600 transition-colors">ล้างทั้งหมด</button>
      </div>

      <div className="flex flex-col gap-2 max-h-[60vh] overflow-y-auto pr-1">
        {loading && (
          <div className="flex justify-center py-6">
            <div className="w-6 h-6 border-2 border-[#1b3168] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && notifications.length === 0 && (
          <p className="text-gray-400 text-sm text-center py-8">ยังไม่มีการแจ้งเตือน</p>
        )}

        {notifications.map((notif) => {
          const p = notif.payload;
          const base = `flex flex-col gap-3 p-4 rounded-2xl border transition-colors ${!notif.read ? "bg-[#f8faff] border-blue-100" : "bg-white border-gray-100"}`;

          // ── join_request ──────────────────────────────────────────────────────
          if (notif.type === "join_request") {
            // resolved_status comes from the backend once the leader has acted
            const persistedStatus = p.resolved_status;
            // resolvedMap covers the in-session optimistic state before the next fetch
            const sessionStatus = resolvedMap[notif.id];
            const resolvedStatus = persistedStatus ?? sessionStatus;
            const canAct = !resolvedStatus && !!p.team_id && !!p.request_id;

            return (
              <div key={notif.id} className={base}>
                <div className="flex gap-3 items-start">
                  <Link href={p.requester_id ? `/profile/${p.requester_id}` : "#"} className="shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.requester_avatar ?? "/avatar.png"} alt="" className="w-10 h-10 rounded-full object-cover border border-blue-100 hover:opacity-80 transition-opacity" />
                  </Link>
                  <div className="flex flex-col min-w-0">
                    <p className="text-sm text-gray-700 leading-relaxed">
                      <Link href={p.requester_id ? `/profile/${p.requester_id}` : "#"} className="font-bold text-[#1b3168] hover:underline">{p.requester_name}</Link>
                      {" "}ขอเข้าร่วมทีม{" "}
                      <Link href={p.team_id ? `/teams/${p.team_id}` : "#"} className="font-bold text-[#1b3168] hover:underline">{p.team_name}</Link>
                    </p>
                    {(p.roles?.length || p.skills?.length) ? (
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {p.roles?.map((r) => (
                          <span key={r} className="bg-blue-50 text-[#2c52ed] text-[10px] font-bold px-2 py-0.5 rounded-full">{r}</span>
                        ))}
                        {p.skills?.map((s) => (
                          <span key={s} className="bg-gray-100 text-gray-600 text-[10px] font-semibold px-2 py-0.5 rounded-full">{s}</span>
                        ))}
                      </div>
                    ) : null}
                    <p className="text-[10px] text-gray-400 font-medium mt-1">{fmtTime(notif.created_at)}</p>
                  </div>
                </div>

                {resolvedStatus === "approved" && (
                  <p className="text-xs font-bold text-green-600 bg-green-50 rounded-xl px-3 py-2">
                    ✓ คุณตอบรับ {p.requester_name} เข้าร่วมทีมแล้ว
                  </p>
                )}
                {resolvedStatus === "rejected" && (
                  <p className="text-xs font-bold text-gray-500 bg-gray-50 rounded-xl px-3 py-2">
                    ✕ คุณปฏิเสธคำขอของ {p.requester_name} แล้ว
                  </p>
                )}
                {sessionStatus === "error" && (
                  <p className="text-xs font-bold text-red-500 text-center py-1">เกิดข้อผิดพลาด ลองใหม่อีกครั้ง</p>
                )}

                {canAct && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => resolveRequest(notif.id, p.team_id!, p.request_id!, "approved")}
                      disabled={resolvingId === notif.id}
                      className="flex-1 bg-[#233876] text-white py-2 rounded-xl text-xs font-bold hover:bg-[#1a2a5c] transition-colors shadow-sm disabled:opacity-50"
                    >
                      {resolvingId === notif.id ? "…" : "ตอบรับ"}
                    </button>
                    <button
                      onClick={() => resolveRequest(notif.id, p.team_id!, p.request_id!, "rejected")}
                      disabled={resolvingId === notif.id}
                      className="flex-1 bg-white border border-gray-200 text-gray-700 py-2 rounded-xl text-xs font-bold hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50"
                    >
                      {resolvingId === notif.id ? "…" : "ปฏิเสธ"}
                    </button>
                  </div>
                )}
              </div>
            );
          }

          // ── request_approved ──────────────────────────────────────────────────
          if (notif.type === "request_approved") {
            return (
              <div key={notif.id} className={base}>
                <div className="flex gap-3 items-start">
                  <div className="w-10 h-10 rounded-full bg-green-100 text-green-500 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <div className="flex flex-col gap-1 min-w-0">
                    <p className="text-sm text-gray-700 leading-relaxed">
                      คำขอเข้าร่วมทีม{" "}
                      <Link href={p.team_id ? `/teams/${p.team_id}` : "#"} className="font-bold text-[#1b3168] hover:underline">{p.team_name}</Link>
                      {" "}<span className="font-bold text-green-500">ได้รับการยอมรับแล้ว ✓</span>
                    </p>
                    <p className="text-[10px] text-gray-400 font-medium">{fmtTime(notif.created_at)}</p>
                    {p.team_id && (
                      <Link href={`/teams/${p.team_id}`} className="mt-1 self-start text-xs font-bold text-[#1b3168] bg-blue-50 px-3 py-1 rounded-full hover:bg-blue-100 transition-colors">
                        ดูทีม →
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          }

          // ── request_rejected ──────────────────────────────────────────────────
          if (notif.type === "request_rejected") {
            return (
              <div key={notif.id} className={base}>
                <div className="flex gap-3 items-start">
                  <div className="w-10 h-10 rounded-full bg-red-100 text-red-400 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  </div>
                  <div className="flex flex-col gap-1 min-w-0">
                    <p className="text-sm text-gray-700 leading-relaxed">
                      คำขอเข้าร่วมทีม{" "}
                      <span className="font-bold text-[#1b3168]">{p.team_name}</span>
                      {" "}<span className="font-bold text-red-400">ถูกปฏิเสธ</span>
                    </p>
                    <p className="text-[10px] text-gray-400 font-medium">{fmtTime(notif.created_at)}</p>
                  </div>
                </div>
              </div>
            );
          }

          // ── team_invite ───────────────────────────────────────────────────────
          if (notif.type === "team_invite") {
            return (
              <div key={notif.id} className={base}>
                <div className="flex gap-3 items-start">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-[#1b3168] flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                  </div>
                  <div className="flex flex-col gap-1 min-w-0">
                    <p className="text-sm text-gray-700 leading-relaxed">
                      คุณถูกเพิ่มเข้าทีม{" "}
                      <Link href={p.team_id ? `/teams/${p.team_id}` : "#"} className="font-bold text-[#1b3168] hover:underline">{p.team_name}</Link>
                    </p>
                    <p className="text-[10px] text-gray-400 font-medium">{fmtTime(notif.created_at)}</p>
                    {p.team_id && (
                      <Link href={`/teams/${p.team_id}`} className="mt-1 self-start text-xs font-bold text-[#1b3168] bg-blue-50 px-3 py-1 rounded-full hover:bg-blue-100 transition-colors">
                        ดูทีม →
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          }

          // ── team_kicked ───────────────────────────────────────────────────────
          if (notif.type === "team_kicked") {
            return (
              <div key={notif.id} className={base}>
                <div className="flex gap-3 items-start">
                  <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                  </div>
                  <div className="flex flex-col gap-1 min-w-0">
                    <p className="text-sm text-gray-700 leading-relaxed">
                      คุณถูกนำออกจากทีม{" "}
                      <span className="font-bold text-[#1b3168]">{p.team_name}</span>
                    </p>
                    <p className="text-[10px] text-gray-400 font-medium">{fmtTime(notif.created_at)}</p>
                  </div>
                </div>
              </div>
            );
          }

          // ── team_cancelled ────────────────────────────────────────────────────
          if (notif.type === "team_cancelled") {
            return (
              <div key={notif.id} className={base}>
                <div className="flex gap-3 items-start">
                  <div className="w-10 h-10 rounded-full bg-red-100 text-red-500 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <div className="flex flex-col gap-1 min-w-0">
                    <p className="text-sm text-gray-700 leading-relaxed">
                      ทีม <span className="font-bold text-[#1b3168]">{p.team_name}</span> ถูกยกเลิกแล้ว
                    </p>
                    <p className="text-[10px] text-gray-400 font-medium">{fmtTime(notif.created_at)}</p>
                  </div>
                </div>
              </div>
            );
          }

          // ── team_completed ────────────────────────────────────────────────────
          if (notif.type === "team_completed") {
            return (
              <div key={notif.id} className={base}>
                <div className="flex gap-3 items-start">
                  <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <div className="flex flex-col gap-1 min-w-0">
                    <p className="text-sm text-gray-700 leading-relaxed">
                      ทีม <span className="font-bold text-[#1b3168]">{p.team_name}</span> จบแล้ว! Skills เข้า Skill Bank ของคุณแล้ว 🎉
                    </p>
                    <p className="text-[10px] text-gray-400 font-medium">{fmtTime(notif.created_at)}</p>
                    <Link href="/active-teams" className="mt-1 self-start text-xs font-bold text-white bg-green-500 px-3 py-1 rounded-full hover:bg-green-600 transition-colors">
                      ให้คะแนนเพื่อนร่วมทีม →
                    </Link>
                  </div>
                </div>
              </div>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
}

export default function Header({ onMenuToggle }: { onMenuToggle?: () => void }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<ApiUser | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    apiFetch<ApiUser>("/api/v1/users/me").then(setCurrentUser).catch(() => null);
    apiFetch<import("@/types/notification").ApiNotification[]>("/api/v1/notifications")
      .then((data) => setUnreadCount(data.filter((n) => !n.read).length))
      .catch(() => null);
  }, []);

  // Handle click outside to close popups
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    }

    if (isProfileOpen || isNotifOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProfileOpen, isNotifOpen]);

  return (
    <header className="sticky top-0 z-50 flex items-center h-16 px-4 sm:px-6 bg-theme-gradient shadow-sm w-full">
      {/* ── ฝั่งซ้าย: Hamburger (Mobile) ── */}
      <button 
        className="lg:hidden mr-4 rounded-lg hover:bg-white/10 text-white transition-colors" 
        onClick={onMenuToggle}
        aria-label="Open menu"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* ── Logo & Nav ── */}
      <div className="flex flex-1 items-center gap-12">
        <Link href="/" className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/Logo.svg" alt="Grand Line Logo" className="h-6 sm:h-7 object-contain" />
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8">
          <Link href="/find-team" className="text-white text-xs font-bold tracking-wider hover:text-white/80 transition-colors uppercase">FIND TEAM</Link>
          <Link href="/skill-bank" className="text-white text-xs font-bold tracking-wider hover:text-white/80 transition-colors uppercase">SKILL BANK</Link>
          <Link href="/active-teams" className="text-white text-xs font-bold tracking-wider hover:text-white/80 transition-colors uppercase">ACTIVE TEAM</Link>
          <Link href="/saved" className="text-white text-xs font-bold tracking-wider hover:text-white/80 transition-colors uppercase">SAVED</Link>
        </nav>
      </div>

      {/* ── ฝั่งขวา: Actions ── */}
      <div className="flex items-center gap-6">
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative text-white hover:text-white/80 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 rounded-full"
            aria-label="Notifications"
            aria-expanded={isNotifOpen}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-black rounded-full border-2 border-transparent flex items-center justify-center px-0.5">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {isNotifOpen && <NotificationPopup onUnreadCount={setUnreadCount} />}
        </div>

        {/* ── Mobile Avatar (Direct Link) ── */}
        <Link
          href="/profile"
          className="w-9 h-9 rounded-full border-2 border-white/80 hover:border-white transition-colors overflow-hidden block lg:hidden"
          aria-label="Go to profile"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={currentUser?.avatar_url ?? "/avatar.png"} alt="Profile" className="w-full h-full object-cover" />
        </Link>

        {/* ── Desktop Avatar (Dropdown Popup) ── */}
        <div className="relative hidden lg:block" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="w-9 h-9 rounded-full border-2 border-white/80 hover:border-white transition-colors overflow-hidden focus:outline-none focus:ring-2 focus:ring-white/50 block"
            aria-label="Toggle profile menu"
            aria-expanded={isProfileOpen}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={currentUser?.avatar_url ?? "/avatar.png"} alt="Profile" className="w-full h-full object-cover" />
          </button>
          
          {/* Profile Dropdown Popup */}
          {isProfileOpen && <ProfilePopup onClose={() => setIsProfileOpen(false)} user={currentUser} />}
        </div>
      </div>
    </header>
  );
}
