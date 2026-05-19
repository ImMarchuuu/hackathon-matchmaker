"use client";

import React, { useState } from "react";
import Link from "next/link";

// Mock Toggle Component
interface ToggleProps {
  initialState?: boolean;
  onChange?: (state: boolean) => void;
}

function Toggle({ initialState = false, onChange }: ToggleProps) {
  const [isOn, setIsOn] = useState(initialState);

  const handleToggle = () => {
    const newState = !isOn;
    setIsOn(newState);
    onChange?.(newState);
  };

  return (
    <button
      onClick={handleToggle}
      className={`relative inline-flex items-center h-6 w-12 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shrink-0 ${isOn ? "bg-blue-600" : "bg-gray-200"
        }`}
      aria-pressed={isOn}
    >
      <span
        className={`inline-block w-5 h-5 bg-white rounded-full transform transition-transform shadow-sm ${isOn ? "translate-x-6" : "translate-x-1"
          }`}
      />
    </button>
  );
}

export default function SettingsPage() {
  return (
    <div className="w-full min-h-screen py-8 px-4 sm:px-6 flex flex-col items-center relative">
      {/* ── Header ── */}
      


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
            {/* Row 1 (Google) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100 shrink-0">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-gray-800 font-bold text-sm">Google Account</p>
                  <p className="text-gray-500 text-xs mt-0.5">marchydluffy@gmail.com</p>
                </div>
              </div>
              <button className="bg-gray-100 text-gray-500 rounded-full px-5 py-2 font-semibold text-xs hover:bg-gray-200 transition-colors shrink-0">
                ยกเลิกการซิงค์
              </button>
            </div>

            {/* Row 2 (GitHub) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100 shrink-0">
                  <svg className="w-5 h-5 text-gray-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-gray-800 font-bold text-sm">GitHub Account</p>
                  <p className="text-gray-500 text-xs mt-0.5">สำหรับโชว์พอร์ตใน Skill Bank</p>
                </div>
              </div>
              <button className="bg-[#1b3168] text-white rounded-full px-5 py-2 font-bold text-xs hover:bg-[#12224f] transition-colors shadow-sm shrink-0">
                เชื่อมต่อ GitHub
              </button>
            </div>
          </div>
        </div>

        <hr className="my-8 border-gray-100" />

        {/* ── Section 2: การแสดงผล ── */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-2 text-[#1b3168]">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            <h2 className="font-bold text-lg">การแสดงผล</h2>
          </div>

          <div className="flex flex-col gap-6 pl-2 sm:pl-8">
            {/* Row 1 (Dark Mode) */}
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-gray-800 font-bold text-sm">โหมดกลางคืน (Dark Mode)</p>
                <p className="text-gray-500 text-xs mt-0.5">เปลี่ยนธีมหน้าเว็บให้เป็นสีมืด สบายตา</p>
              </div>
              <Toggle initialState={false} />
            </div>
          </div>
        </div>

        <hr className="my-8 border-gray-100" />

        {/* ── Section 3: ความเป็นส่วนตัว & การแจ้งเตือน ── */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-2 text-[#1b3168]">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <h2 className="font-bold text-lg">ความเป็นส่วนตัว & การแจ้งเตือน</h2>
          </div>

          <div className="flex flex-col gap-6 pl-2 sm:pl-8">
            {/* Row 1 (Public Profile) */}
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-gray-800 font-bold text-sm">แสดงโปรไฟล์สาธารณะ</p>
                <p className="text-gray-500 text-xs mt-0.5">อนุญาตให้คนอื่นค้นหาคุณเจอในหน้า FIND TEAM</p>
              </div>
              <Toggle initialState={true} />
            </div>

            {/* Row 2 (Email Notifications) */}
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-gray-800 font-bold text-sm">แจ้งเตือนคำขอเข้าร่วมทีมผ่าน Email</p>
                <p className="text-gray-500 text-xs mt-0.5">ส่งอีเมลเมื่อมีคนกด REQUEST เข้าทีมของคุณ</p>
              </div>
              <Toggle initialState={false} />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
