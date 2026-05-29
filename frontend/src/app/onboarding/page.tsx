"use client";

import { useState, useEffect } from "react";
import "./onboarding.css";
import FindTeamView from "./FindTeamView";

/* ═══════════════════════════════════════════════════
   Constants
   ═══════════════════════════════════════════════════ */
const USER_NAME = "Somchai";

const CONFETTI_COLORS = ["#FF6B6B","#4ECDC4","#45B7D1","#96CEB4","#FFEAA7","#DDA0DD","#F8B500"];
const CONFETTI = Array.from({ length: 28 }, (_, i) => ({
  left: `${((i * 3.7) % 100).toFixed(1)}%`,
  color: CONFETTI_COLORS[i % 7],
  w: 7 + (i % 5) * 2,
  h: 5 + (i % 4) * 2,
  dur: `${2.5 + (i % 6) * 0.5}s`,
  delay: `${(i * 0.12).toFixed(2)}s`,
}));

/* ═══════════════════════════════════════════════════
   Shared: GrandLine Logo (CSS sailboat)
   ═══════════════════════════════════════════════════ */
export function GrandLineLogo({ variant = "dark", size = "text-2xl" }: { variant?: "dark" | "light"; size?: string }) {
  const c = variant === "light" ? "#fff" : "#182A5C";
  return (
    <div className={`flex items-center font-black tracking-tight select-none ${size}`} style={{ color: c }}>
      <span>GR</span>
      <div className="relative mx-0.5" style={{ width: "0.9em", height: "1em" }}>
        {/* sail */}
        <div className="absolute bottom-[15%] left-1/2 -translate-x-[55%]"
          style={{ width: 0, height: 0, borderLeft: "0.35em solid transparent", borderRight: "0.08em solid transparent", borderBottom: `0.55em solid ${c}` }} />
        {/* hull */}
        <div className="absolute bottom-[8%] left-1/2 -translate-x-1/2 rounded-b-full"
          style={{ width: "0.6em", height: "0.18em", backgroundColor: c }} />
      </div>
      <span>ND LINE</span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   Shared: Mode A Wrapper (gradient + centered card)
   ═══════════════════════════════════════════════════ */
function ModeA({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8"
      style={{ background: "linear-gradient(to bottom, #0f4eb8, #20a7f1)" }}>
      <div className="w-full max-w-[430px] bg-white rounded-[2rem] shadow-2xl shadow-black/20 p-8 sm:p-10 relative overflow-hidden animate-slide-up">
        {children}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   Step 1 — Welcome
   ═══════════════════════════════════════════════════ */
function Step1({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2500);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <ModeA>
      <div className="flex flex-col items-center text-center gap-5 py-4">
        <span className="text-6xl animate-float">🎉</span>
        <div>
          <h1 className="text-2xl font-black text-[#182A5C]">ยินดีต้อนรับ</h1>
          <p className="text-xl font-bold text-[#182A5C] mt-1">คุณ {USER_NAME}</p>
        </div>
        <p className="text-sm text-gray-400">ยืนยันตัวตนสำเร็จแล้ว กำลังเตรียมข้อมูลของคุณ…</p>
        <div className="flex gap-2 mt-2">
          <span className="bounce-dot" /><span className="bounce-dot" /><span className="bounce-dot" />
        </div>
      </div>
    </ModeA>
  );
}

/* ═══════════════════════════════════════════════════
   Step 2 — Profile Setup
   ═══════════════════════════════════════════════════ */
function Step2({ onNext }: { onNext: () => void }) {
  return (
    <ModeA>
      <h2 className="text-xl font-black text-[#182A5C] text-center mb-6">ตั้งค่าโปรไฟล์</h2>

      {/* Cover + Avatar */}
      <div className="relative mb-10">
        <div className="w-full h-32 rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-gray-100 transition-colors">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" /></svg>
          <span className="text-xs text-gray-400 font-medium">อัพโหลดรูปปก</span>
        </div>
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full border-4 border-white bg-gray-100 shadow-lg flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors">
          <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-3 mt-4">
        <button onClick={onNext} className="flex-1 py-3 rounded-full border-2 border-[#182A5C] text-[#182A5C] font-bold text-sm hover:bg-[#182A5C]/5 transition-colors">ข้าม</button>
        <button onClick={onNext} className="flex-1 py-3 rounded-full bg-[#182A5C] text-white font-bold text-sm hover:bg-[#12234b] transition-colors shadow-md">ยืนยัน</button>
      </div>
    </ModeA>
  );
}

/* ═══════════════════════════════════════════════════
   Step 3 — Details Setup
   ═══════════════════════════════════════════════════ */
function Step3({ onNext }: { onNext: () => void }) {
  return (
    <ModeA>
      <h2 className="text-xl font-black text-[#182A5C] text-center mb-1">บอกให้โลกรู้จักคุณ</h2>
      <p className="text-xs text-gray-400 text-center mb-6">เติมข้อมูลเพื่อให้เพื่อนร่วมทีมรู้จักคุณมากขึ้น</p>

      <div className="space-y-4">
        {/* Bio */}
        <div>
          <label className="block text-sm font-semibold text-[#182A5C] mb-1.5">Bio</label>
          <textarea rows={3} placeholder="แนะนำตัวสั้นๆ เช่น ชอบเขียนโค้ด, สนใจ AI..."
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-700 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#182A5C]/30 focus:border-[#182A5C] resize-none transition-all" />
        </div>

        {/* GitHub */}
        <div>
          <label className="block text-sm font-semibold text-[#182A5C] mb-1.5">GitHub URL</label>
          <div className="relative">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" /></svg>
            <input type="url" placeholder="https://github.com/username"
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-700 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#182A5C]/30 focus:border-[#182A5C] transition-all" />
          </div>
        </div>

        {/* LinkedIn */}
        <div>
          <label className="block text-sm font-semibold text-[#182A5C] mb-1.5">LinkedIn URL</label>
          <div className="relative">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#0077B5]" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
            <input type="url" placeholder="https://linkedin.com/in/username"
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-700 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#182A5C]/30 focus:border-[#182A5C] transition-all" />
          </div>
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <button onClick={onNext} className="flex-1 py-3 rounded-full border-2 border-[#182A5C] text-[#182A5C] font-bold text-sm hover:bg-[#182A5C]/5 transition-colors">ข้าม</button>
        <button onClick={onNext} className="flex-1 py-3 rounded-full bg-[#182A5C] text-white font-bold text-sm hover:bg-[#12234b] transition-colors shadow-md">บันทึก</button>
      </div>
    </ModeA>
  );
}

/* ═══════════════════════════════════════════════════
   Step 4 — Setup Complete
   ═══════════════════════════════════════════════════ */
function Step4({ onNext }: { onNext: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 relative overflow-hidden"
      style={{ background: "linear-gradient(to bottom, #0f4eb8, #20a7f1)" }}>

      {/* Confetti */}
      {CONFETTI.map((c, i) => (
        <div key={i} className="confetti-piece" style={{
          left: c.left, width: c.w, height: c.h, backgroundColor: c.color,
          "--fall-dur": c.dur, "--fall-delay": c.delay, borderRadius: i % 3 === 0 ? "50%" : "2px",
        } as React.CSSProperties} />
      ))}

      <div className="w-full max-w-[430px] bg-white rounded-[2rem] shadow-2xl shadow-black/20 p-8 sm:p-10 relative z-10 animate-slide-up">
        <div className="flex flex-col items-center text-center gap-5 py-4">
          <div className="animate-pop-in">
            <svg className="w-24 h-24 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#182A5C]">เสร็จสมบูรณ์!</h1>
            <p className="text-sm text-gray-400 mt-2">โปรไฟล์ของคุณพร้อมแล้ว เริ่มค้นหาทีมในฝันได้เลย</p>
          </div>
          <button onClick={onNext}
            className="w-full py-3.5 rounded-full bg-[#182A5C] text-white font-bold text-sm hover:bg-[#12234b] transition-colors shadow-lg mt-2">
            เข้าสู่ระบบหลัก
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   Main Orchestrator
   ═══════════════════════════════════════════════════ */
export default function OnboardingPage() {
  const [step, setStep] = useState(1);

  if (step === 5) return <FindTeamView />;

  return (
    <>
      {step === 1 && <Step1 onDone={() => setStep(2)} />}
      {step === 2 && <Step2 onNext={() => setStep(3)} />}
      {step === 3 && <Step3 onNext={() => setStep(4)} />}
      {step === 4 && <Step4 onNext={() => setStep(5)} />}
    </>
  );
}
