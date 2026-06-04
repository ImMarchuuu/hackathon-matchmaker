"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import type { ApiUser } from "@/types/profile";

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<ApiUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

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
      <div className="w-full max-w-3xl bg-white rounded-[2rem] shadow-sm p-6 sm:p-10 border border-gray-100 flex flex-col">

        {/* ── Section 1: บัญชีและการเชื่อมต่อ ── */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-2 text-[#1b3168]">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <h2 className="font-bold text-lg">บัญชีและการเชื่อมต่อ</h2>
          </div>

          <div className="flex flex-col gap-6 pl-2 sm:pl-8">
            {/* Email / Google */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100 shrink-0">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-gray-800 font-bold text-sm">Google Account</p>
                  {loading ? (
                    <div className="h-3 w-36 bg-gray-200 rounded animate-pulse mt-1" />
                  ) : (
                    <p className="text-gray-500 text-xs mt-0.5">{user?.email ?? "—"}</p>
                  )}
                </div>
              </div>
              <button className="bg-gray-100 text-gray-500 rounded-full px-5 py-2 font-semibold text-xs hover:bg-gray-200 transition-colors shrink-0">
                ยกเลิกการซิงค์
              </button>
            </div>
          </div>
        </div>

        <hr className="my-8 border-gray-100" />

        {/* ── Section 3: ข้อมูลทางกฎหมาย & เกี่ยวกับเรา ── */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-2 text-[#1b3168]">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h2 className="font-bold text-lg">ข้อมูลทางกฎหมาย & เกี่ยวกับเรา</h2>
          </div>
          <div className="flex flex-col gap-4 pl-2 sm:pl-8">
            <Link href="/terms" className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md hover:bg-gray-50/50 transition-all cursor-pointer group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-50/50 flex items-center justify-center shrink-0 group-hover:bg-blue-50 transition-colors">
                  <svg className="w-5 h-5 text-[#1b3168]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-gray-800 font-bold text-sm">ข้อตกลงการใช้งาน (Terms of Service)</p>
                  <p className="text-gray-500 text-xs mt-0.5">อ่านกฎ กติกา และเงื่อนไขการใช้บริการของ GrandLine</p>
                </div>
              </div>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-[#1b3168] transform group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <Link href="/privacy" className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md hover:bg-gray-50/50 transition-all cursor-pointer group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-50/50 flex items-center justify-center shrink-0 group-hover:bg-blue-50 transition-colors">
                  <svg className="w-5 h-5 text-[#1b3168]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <p className="text-gray-800 font-bold text-sm">นโยบายความเป็นส่วนตัว (Privacy Policy)</p>
                  <p className="text-gray-500 text-xs mt-0.5">การเก็บรักษา ป้องกัน และการประมวลผลข้อมูลส่วนบุคคลของคุณ</p>
                </div>
              </div>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-[#1b3168] transform group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
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
