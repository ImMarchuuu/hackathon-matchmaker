"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";

function ProfilePopup({ onClose }: { onClose: () => void }) {
  return (
    <div className="absolute top-[110%] right-0 mt-1 w-72 bg-white rounded-[2rem] shadow-xl border border-gray-100 p-6 z-50 flex flex-col gap-5 cursor-default origin-top-right animate-in fade-in zoom-in-95 duration-200">
      {/* ── Profile Summary ── */}
      <div className="flex flex-col items-center gap-1">
        <div className="w-20 h-20 rounded-full border-4 border-white shadow-sm overflow-hidden bg-gray-50 shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/avatar.png" alt="Murchy D.Luffy" className="w-full h-full object-cover" />
        </div>
        <div className="text-center mt-2">
          <h4 className="text-[#1b3168] font-black text-xl leading-none">Murchy D.Luffy</h4>
          <p className="text-gray-500 font-semibold text-xs mt-1.5">marchydluffy@gmail.com</p>
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
          ดูโปรไฟล์
        </Link>
        <Link 
          href="/settings" 
          onClick={onClose} 
          className="w-full bg-white text-[#1b3168] border border-gray-200 font-bold tracking-wide py-3.5 rounded-full text-center hover:bg-gray-50 transition-colors text-sm shadow-sm"
        >
          การตั้งค่า
        </Link>
        <button 
          onClick={() => {
            document.cookie = "grandline_auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            window.location.href = "/login";
            onClose?.();
          }}
          className="w-full bg-white text-[#ff4d4f] border border-[#ff4d4f]/30 font-bold tracking-wide py-3.5 rounded-full text-center hover:bg-red-50 transition-colors text-sm shadow-sm mt-1"
        >
          ออกจากระบบ
        </button>
      </div>
    </div>
  );
}

function NotificationPopup({ onClose }: { onClose: () => void }) {
  const mockNotifications = [
    {
      id: "1",
      type: "request",
      requesterId: "u2",
      requesterName: "Chanut Sunatho",
      avatarUrl: "https://i.pravatar.cc/150?u=1",
      teamName: "Pirate Hackathon",
      time: "10 นาทีที่แล้ว"
    },
    {
      id: "2",
      type: "accepted",
      teamName: "Superman Engineer",
      time: "2 ชั่วโมงที่แล้ว"
    },
    {
      id: "3",
      type: "complete",
      teamName: "Pirate Hackathon",
      time: "5 ชั่วโมงที่แล้ว"
    },
    {
      id: "4",
      type: "complete_joined",
      teamName: "AI Startup",
      time: "1 วันที่แล้ว"
    },
    {
      id: "5",
      type: "start",
      teamName: "AI",
      time: "2 วันที่แล้ว"
    }
  ];

  return (
    <div className="absolute top-[140%] right-[-60px] sm:right-0 mt-1 w-[340px] sm:w-[400px] bg-white rounded-[2rem] shadow-xl border border-gray-100 p-5 z-50 flex flex-col gap-4 cursor-default origin-top-right animate-in fade-in zoom-in-95 duration-200">
      <div className="flex justify-between items-center px-2">
        <h3 className="text-[#1b3168] font-black text-lg">การแจ้งเตือน</h3>
        <button className="text-blue-600 font-bold text-sm hover:text-blue-800 transition-colors">อ่านทั้งหมด</button>
      </div>

      <div className="flex flex-col gap-2 max-h-[60vh] overflow-y-auto pr-1">
        {mockNotifications.map(notif => {
          if (notif.type === "request") {
            return (
              <div key={notif.id} className="flex flex-col gap-3 p-4 rounded-2xl bg-[#f8faff] border border-blue-100 hover:border-blue-200 transition-colors">
                <Link href={`/profile/${notif.requesterId}`} onClick={onClose} className="flex gap-3 items-start">
                  <div className="w-10 h-10 rounded-full border border-blue-100 overflow-hidden shrink-0 bg-white">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={notif.avatarUrl} alt={notif.requesterName} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col">
                    <p className="text-sm text-gray-700 leading-relaxed">
                      <span className="font-bold text-[#1b3168] hover:underline">{notif.requesterName}</span> ขอเข้าร่วมทีม <span className="font-bold text-[#1b3168]">{notif.teamName}</span> ของคุณ
                    </p>
                    <p className="text-[10px] text-gray-400 font-medium mt-0.5">{notif.time}</p>
                  </div>
                </Link>
                <div className="flex gap-2 ml-13">
                  <button className="flex-1 bg-[#233876] text-white py-2 rounded-xl text-xs font-bold tracking-wide hover:bg-[#1a2a5c] transition-colors shadow-sm">ตอบรับ</button>
                  <button className="flex-1 bg-white border border-gray-200 text-gray-700 py-2 rounded-xl text-xs font-bold tracking-wide hover:bg-gray-50 transition-colors shadow-sm">ปฏิเสธ</button>
                </div>
              </div>
            )
          }

          let icon = null;
          let content = null;

          if (notif.type === "accepted") {
            icon = (
              <div className="w-10 h-10 rounded-full bg-green-100 text-green-500 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              </div>
            );
            content = (
              <p className="text-sm text-gray-700 leading-relaxed">
                คำขอเข้าร่วมทีม <span className="font-bold text-[#1b3168]">{notif.teamName}</span> ของคุณถูก <span className="font-bold text-green-500">ยอมรับแล้ว</span>
              </p>
            );
          } else if (notif.type === "complete" || notif.type === "complete_joined") {
            icon = (
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              </div>
            );
            content = (
              <p className="text-sm text-gray-700 leading-relaxed">
                ทีม <span className="font-bold text-[#1b3168]">{notif.teamName}</span> {notif.type === "complete" ? "ที่คุณสร้างสมาชิกครบแล้ว! ชวนเพื่อนๆ ไปดูโปรไฟล์กันเลย" : "ที่คุณเข้าร่วมสมาชิกครบแล้ว! ไปทักทายเพื่อนๆ กันเถอะ"}
              </p>
            );
          } else if (notif.type === "start") {
            icon = (
              <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
            );
            content = (
              <p className="text-sm text-gray-700 leading-relaxed">
                เตรียมตัวให้พร้อม! การแข่งขันของทีม <span className="font-bold text-[#1b3168]">{notif.teamName}</span>
              </p>
            );
          }

          return (
            <div key={notif.id} className="flex gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors cursor-pointer border border-transparent hover:border-gray-100">
              {icon}
              <div className="flex flex-col gap-1">
                {content}
                <p className="text-[10px] text-gray-400 font-medium">{notif.time}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
}

export default function Header({ onMenuToggle }: { onMenuToggle?: () => void }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

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
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-transparent"></span>
          </button>

          {isNotifOpen && <NotificationPopup onClose={() => setIsNotifOpen(false)} />}
        </div>

        {/* ── Mobile Avatar (Direct Link) ── */}
        <Link 
          href="/profile" 
          className="w-9 h-9 rounded-full border-2 border-white/80 hover:border-white transition-colors overflow-hidden block lg:hidden"
          aria-label="Go to profile"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/avatar.png" alt="Profile" className="w-full h-full object-cover" />
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
            <img src="/avatar.png" alt="Profile" className="w-full h-full object-cover" />
          </button>
          
          {/* Profile Dropdown Popup */}
          {isProfileOpen && <ProfilePopup onClose={() => setIsProfileOpen(false)} />}
        </div>
      </div>
    </header>
  );
}
