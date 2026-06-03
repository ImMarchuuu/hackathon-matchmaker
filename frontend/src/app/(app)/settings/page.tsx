"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import type { ApiUser } from "@/types/profile";

function Toggle({ initialState = false }: { initialState?: boolean }) {
  const [isOn, setIsOn] = useState(initialState);
  return (
    <button
      onClick={() => setIsOn(!isOn)}
      className={`relative inline-flex items-center h-6 w-12 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shrink-0 ${isOn ? "bg-blue-600" : "bg-gray-200"}`}
      aria-pressed={isOn}
    >
      <span className={`inline-block w-5 h-5 bg-white rounded-full transform transition-transform shadow-sm ${isOn ? "translate-x-6" : "translate-x-1"}`} />
    </button>
  );
}

type OtpStep = "idle" | "sending" | "awaiting" | "verifying" | "done";

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<ApiUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Email OTP state — wired up once Resend is configured
  const [otpStep, setOtpStep] = useState<OtpStep>("idle");
  const [otpCode, setOtpCode] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  async function handleSendOtp() {
    setOtpError(null);
    setOtpStep("sending");
    try {
      await apiFetch("/api/v1/users/me/email/send-otp", { method: "POST" });
      setOtpStep("awaiting");
      setCountdown(60);
    } catch (err: unknown) {
      setOtpError(err instanceof Error ? err.message : "ส่งรหัสไม่สำเร็จ กรุณาลองใหม่");
      setOtpStep("idle");
    }
  }

  async function handleVerifyOtp() {
    if (otpCode.length !== 6) return;
    setOtpStep("verifying");
    setOtpError(null);
    try {
      const updated = await apiFetch<ApiUser>("/api/v1/users/me/email/verify-otp", {
        method: "POST",
        body: JSON.stringify({ code: otpCode }),
      });
      setUser(updated);
      setOtpStep("done");
      setOtpCode("");
    } catch (err: unknown) {
      setOtpError(err instanceof Error ? err.message : "รหัสไม่ถูกต้อง กรุณาลองใหม่");
      setOtpStep("awaiting");
    }
  }

  async function handleDeleteAccount() {
    setDeleting(true);
    try {
      await apiFetch("/api/v1/users/me", { method: "DELETE" });
    } catch {
      // account deleted — token may already be revoked
    }
    document.cookie = "grandline_auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.replace("/login");
  }

  useEffect(() => {
    apiFetch<ApiUser>("/api/v1/users/me")
      .then(setUser)
      .catch(() => router.replace("/login"))
      .finally(() => setLoading(false));
  }, [router]);

  return (
    <div className="w-full min-h-screen py-8 px-4 sm:px-6 flex flex-col items-center relative">
      {/* ── Main Container ── */}
      <div className="w-full max-w-3xl bg-white dark:bg-slate-800 rounded-[2rem] shadow-sm p-6 sm:p-10 border border-gray-100 dark:border-slate-700 flex flex-col">

        {/* ── Section 1: บัญชีและการเชื่อมต่อ ── */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-2 text-[#1b3168] dark:text-blue-300">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <h2 className="font-bold text-lg">บัญชีและการเชื่อมต่อ</h2>
          </div>

          <div className="flex flex-col gap-6 pl-2 sm:pl-8">
            {/* Email / Google */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-slate-700 flex items-center justify-center border border-gray-100 dark:border-slate-600 shrink-0">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-gray-800 dark:text-slate-100 font-bold text-sm">Google Account</p>
                  {loading ? (
                    <div className="h-3 w-36 bg-gray-200 rounded animate-pulse mt-1" />
                  ) : (
                    <p className="text-gray-500 dark:text-slate-400 text-xs mt-0.5">{user?.email ?? "—"}</p>
                  )}
                </div>
              </div>
              <button className="bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-300 rounded-full px-5 py-2 font-semibold text-xs hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors shrink-0">
                ยกเลิกการซิงค์
              </button>
            </div>

            {/* GitHub */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-slate-700 flex items-center justify-center border border-gray-100 dark:border-slate-600 shrink-0">
                  <svg className="w-5 h-5 text-gray-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-gray-800 dark:text-slate-100 font-bold text-sm">GitHub Account</p>
                  {loading ? (
                    <div className="h-3 w-28 bg-gray-200 rounded animate-pulse mt-1" />
                  ) : user?.github ? (
                    <p className="text-gray-500 dark:text-slate-400 text-xs mt-0.5 truncate max-w-[200px]">{user.github}</p>
                  ) : (
                    <p className="text-gray-500 dark:text-slate-400 text-xs mt-0.5">สำหรับโชว์พอร์ตใน Skill Bank</p>
                  )}
                </div>
              </div>
              {!loading && (
                user?.github ? (
                  <Link href="/profile/edit" className="bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-300 rounded-full px-5 py-2 font-semibold text-xs hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors shrink-0">
                    แก้ไข
                  </Link>
                ) : (
                  <Link href="/profile/edit" className="bg-[#1b3168] text-white rounded-full px-5 py-2 font-bold text-xs hover:bg-[#12224f] transition-colors shadow-sm shrink-0">
                    เชื่อมต่อ GitHub
                  </Link>
                )
              )}
            </div>
          </div>
        </div>

        <hr className="my-8 border-gray-100 dark:border-slate-700" />

        {/* ── Section: ยืนยันอีเมล ── */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-2 text-[#1b3168] dark:text-blue-300">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h2 className="font-bold text-lg">ยืนยันอีเมล</h2>
          </div>

          <div className="flex flex-col gap-4 pl-2 sm:pl-8">
            {/* Already verified */}
            {(otpStep !== "done" && user?.email_verified) || otpStep === "done" ? (
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-[#1b3168]">{user?.email}</span>
                <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  {otpStep === "done" ? "ยืนยันสำเร็จ" : "ยืนยันแล้ว"}
                </span>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">{user?.email}</span>
                  <button
                    onClick={handleSendOtp}
                    disabled={otpStep === "sending" || otpStep === "awaiting"}
                    className="shrink-0 px-5 py-2.5 rounded-xl bg-[#1b3168] text-white text-sm font-bold hover:bg-[#12224f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {otpStep === "sending" ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : "ส่งรหัสยืนยัน"}
                  </button>
                </div>

                {(otpStep === "awaiting" || otpStep === "verifying") && (
                  <div className="flex flex-col gap-2">
                    <p className="text-xs text-gray-400">ส่งรหัส 6 หลักไปที่ {user?.email} แล้ว</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                        placeholder="รหัส 6 หลัก"
                        className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-[#1b3168] text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1b3168]/30 focus:border-[#1b3168] tracking-widest"
                      />
                      <button
                        onClick={handleVerifyOtp}
                        disabled={otpCode.length !== 6 || otpStep === "verifying"}
                        className="shrink-0 px-5 py-3 rounded-xl bg-green-600 text-white text-sm font-bold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {otpStep === "verifying" ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : "ยืนยัน"}
                      </button>
                    </div>
                    <p className="text-xs text-gray-400">
                      {countdown > 0
                        ? `ส่งรหัสใหม่ได้ใน ${countdown}s`
                        : <button onClick={handleSendOtp} className="text-[#1b3168] font-bold hover:underline">ส่งรหัสใหม่</button>
                      }
                    </p>
                  </div>
                )}
              </div>
            )}

            {otpError && <p className="text-xs font-semibold text-red-500">{otpError}</p>}
          </div>
        </div>

        <hr className="my-8 border-gray-100 dark:border-slate-700" />

        {/* ── Section 2: การแสดงผล ── */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-2 text-[#1b3168] dark:text-blue-300">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            <h2 className="font-bold text-lg">การแสดงผล</h2>
          </div>
          <div className="flex flex-col gap-6 pl-2 sm:pl-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-gray-800 dark:text-slate-100 font-bold text-sm">โหมดกลางคืน (Dark Mode)</p>
                <p className="text-gray-500 dark:text-slate-400 text-xs mt-0.5">เปลี่ยนธีมหน้าเว็บให้เป็นสีมืด สบายตา</p>
              </div>
              <Toggle initialState={false} />
            </div>
          </div>
        </div>

        <hr className="my-8 border-gray-100 dark:border-slate-700" />

        {/* ── Section 3: ความเป็นส่วนตัว & การแจ้งเตือน ── */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-2 text-[#1b3168] dark:text-blue-300">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <h2 className="font-bold text-lg">ความเป็นส่วนตัว & การแจ้งเตือน</h2>
          </div>
          <div className="flex flex-col gap-6 pl-2 sm:pl-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-gray-800 dark:text-slate-100 font-bold text-sm">แสดงโปรไฟล์สาธารณะ</p>
                <p className="text-gray-500 dark:text-slate-400 text-xs mt-0.5">อนุญาตให้คนอื่นค้นหาคุณเจอในหน้า FIND TEAM</p>
              </div>
              <Toggle initialState={true} />
            </div>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-gray-800 dark:text-slate-100 font-bold text-sm">แจ้งเตือนคำขอเข้าร่วมทีมผ่าน Email</p>
                <p className="text-gray-500 dark:text-slate-400 text-xs mt-0.5">ส่งอีเมลเมื่อมีคนกด REQUEST เข้าทีมของคุณ</p>
              </div>
              <Toggle initialState={false} />
            </div>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-gray-800 dark:text-slate-100 font-bold text-sm">ระบบยืนยันตัว 2 ชั้น (2FA)</p>
                <p className="text-gray-500 dark:text-slate-400 text-xs mt-0.5">เพิ่มความปลอดภัยด้วยการยืนยันตัวตนผ่านอีเมลเมื่อเข้าสู่ระบบ</p>
              </div>
              <Toggle initialState={false} />
            </div>
          </div>
        </div>

        <hr className="my-8 border-gray-100 dark:border-slate-700" />

        {/* ── Section 4: ข้อมูลทางกฎหมาย & เกี่ยวกับเรา ── */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-2 text-[#1b3168] dark:text-blue-300">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h2 className="font-bold text-lg">ข้อมูลทางกฎหมาย & เกี่ยวกับเรา</h2>
          </div>
          <div className="flex flex-col gap-4 pl-2 sm:pl-8">
            <Link href="/terms" className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md hover:bg-gray-50/50 dark:hover:bg-slate-700/50 transition-all cursor-pointer group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-50/50 flex items-center justify-center shrink-0 group-hover:bg-blue-50 transition-colors">
                  <svg className="w-5 h-5 text-[#1b3168] dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-gray-800 dark:text-slate-100 font-bold text-sm">ข้อตกลงการใช้งาน (Terms of Service)</p>
                  <p className="text-gray-500 dark:text-slate-400 text-xs mt-0.5">อ่านกฎ กติกา และเงื่อนไขการใช้บริการของ GrandLine</p>
                </div>
              </div>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-[#1b3168] dark:text-blue-300 transform group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <Link href="/privacy" className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md hover:bg-gray-50/50 dark:hover:bg-slate-700/50 transition-all cursor-pointer group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-50/50 flex items-center justify-center shrink-0 group-hover:bg-blue-50 transition-colors">
                  <svg className="w-5 h-5 text-[#1b3168] dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <p className="text-gray-800 dark:text-slate-100 font-bold text-sm">นโยบายความเป็นส่วนตัว (Privacy Policy)</p>
                  <p className="text-gray-500 dark:text-slate-400 text-xs mt-0.5">การเก็บรักษา ป้องกัน และการประมวลผลข้อมูลส่วนบุคคลของคุณ</p>
                </div>
              </div>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-[#1b3168] dark:text-blue-300 transform group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        <hr className="my-8 border-red-100" />

        {/* ── Danger Zone ── */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-red-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            <h2 className="font-bold text-base">Danger Zone</h2>
          </div>
          <div className="flex items-center justify-between gap-4 p-4 rounded-2xl border border-red-100 bg-red-50">
            <div>
              <p className="text-gray-800 font-bold text-sm">ลบบัญชีผู้ใช้</p>
              <p className="text-gray-500 text-xs mt-0.5">ลบบัญชีและข้อมูลทั้งหมดอย่างถาวร ไม่สามารถกู้คืนได้</p>
            </div>
            <button
              onClick={() => setConfirmDelete(true)}
              className="shrink-0 px-4 py-2 rounded-full border border-red-400 text-red-500 text-xs font-bold hover:bg-red-500 hover:text-white transition-colors"
            >
              ลบบัญชี
            </button>
          </div>
        </div>

      </div>

      {/* ── Confirm Delete Modal ── */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => !deleting && setConfirmDelete(false)}>
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm p-8 flex flex-col items-center gap-6" onClick={(e) => e.stopPropagation()}>
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-[#1b3168] font-extrabold text-lg">ยืนยันการลบบัญชี?</h3>
              <p className="text-gray-500 text-sm leading-relaxed">บัญชีและข้อมูลทั้งหมดจะถูกลบถาวร<br />ไม่สามารถกู้คืนได้</p>
            </div>
            <div className="flex gap-3 w-full">
              <button onClick={() => setConfirmDelete(false)} disabled={deleting} className="flex-1 py-3 rounded-full border-2 border-gray-200 text-gray-600 text-sm font-bold hover:bg-gray-50 disabled:opacity-50">
                ยกเลิก
              </button>
              <button onClick={handleDeleteAccount} disabled={deleting} className="flex-1 py-3 rounded-full bg-red-500 text-white text-sm font-bold hover:bg-red-600 disabled:opacity-60">
                {deleting ? "กำลังลบ…" : "ยืนยันลบ"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
