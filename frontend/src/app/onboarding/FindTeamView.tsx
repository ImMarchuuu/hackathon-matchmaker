"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import "./onboarding.css";
import FindTeamContent from "@/components/team/FindTeamContent";
import { MOCK_TEAMS, MOCK_PEOPLE } from "./mockData";

/* ═══════════════════════════════════════════════════
   Coachmark Tutorial Overlay
   ═══════════════════════════════════════════════════ */
const COACH_STEPS = [
  {
    targetAttr: "first-card",
    text: "นี่คือการ์ดทีม! ดูรายละเอียดและกด REQUEST เพื่อขอเข้าร่วม",
    btn: "เข้าใจแล้ว",
  },
  {
    targetAttr: "tab-toggle",
    text: "สลับโหมดการค้นหาทีม หรือค้นหาบุคคล",
    btn: "ถัดไป",
  },
  {
    targetAttr: "create-btn",
    text: "สร้างทีมของคุณ กดตรงนี้เพื่อตั้งปาร์ตี้",
    btn: "เสร็จสิ้น",
  },
];

function Coachmark({ onFinish }: { onFinish: () => void }) {
  const [idx, setIdx] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);

  const measure = useCallback(() => {
    const el = document.querySelector(`[data-tour="${COACH_STEPS[idx].targetAttr}"]`);
    if (el) {
      setRect(el.getBoundingClientRect());
    }
  }, [idx]);

  useEffect(() => {
    // Small delay to ensure the real components have rendered
    const timer = setTimeout(measure, 300);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [measure]);

  if (!rect) return null;

  const step = COACH_STEPS[idx];
  const pad = 10;

  // Tooltip position: try below target, clamp within viewport
  const spaceBelow = window.innerHeight - rect.bottom;
  const placeAbove = spaceBelow < 200;
  const tooltipTop = placeAbove ? rect.top - 16 : rect.bottom + 16;
  const tooltipLeft = Math.max(16, Math.min(rect.left, window.innerWidth - 320));

  return (
    <div className="fixed inset-0 z-[100]" style={{ pointerEvents: "auto" }}>
      {/* Dark overlay using SVG mask to cut out the target */}
      <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: "none" }}>
        <defs>
          <mask id="coachmark-mask">
            <rect width="100%" height="100%" fill="white" />
            <rect
              x={rect.left - pad}
              y={rect.top - pad}
              width={rect.width + pad * 2}
              height={rect.height + pad * 2}
              rx="16"
              fill="black"
            />
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(0,0,0,0.6)"
          mask="url(#coachmark-mask)"
        />
      </svg>

      {/* Spotlight ring */}
      <div
        className="absolute pointer-events-none spotlight-ring rounded-2xl border-[3px] border-white"
        style={{
          top: rect.top - pad,
          left: rect.left - pad,
          width: rect.width + pad * 2,
          height: rect.height + pad * 2,
        }}
      />

      {/* Tooltip card */}
      <div
        className="absolute z-[110] bg-white rounded-2xl p-5 shadow-2xl w-[300px] animate-slide-up"
        style={{
          top: placeAbove ? undefined : tooltipTop,
          bottom: placeAbove ? window.innerHeight - tooltipTop : undefined,
          left: tooltipLeft,
        }}
      >
        <p className="text-sm text-gray-700 leading-relaxed mb-4">{step.text}</p>
        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            {COACH_STEPS.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === idx ? "bg-[#182A5C]" : "bg-gray-200"
                }`}
              />
            ))}
          </div>
          <button
            onClick={() =>
              idx === COACH_STEPS.length - 1 ? onFinish() : setIdx(idx + 1)
            }
            className="px-5 py-2 rounded-full bg-[#182A5C] text-white text-xs font-bold hover:bg-[#12234b] transition-colors"
          >
            {step.btn}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   Step 5 — Real Find Team Page + Coachmark
   ═══════════════════════════════════════════════════ */
export default function FindTeamView() {
  const router = useRouter();
  const [showCoach, setShowCoach] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  const handleCoachFinish = useCallback(() => {
    // Start a smooth fade-out, then navigate to the real page
    setIsFadingOut(true);
    setTimeout(() => {
      router.replace("/find-team");
    }, 400);
  }, [router]);

  return (
    <div className="light-theme min-h-screen flex flex-col relative isolate" style={{ backgroundColor: "var(--color-bg)", color: "var(--color-text)" }}>
      {/* Real production Header */}
      <Header />

      {/* Main content area matching the real (app) layout */}
      <main className="flex-grow w-full">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <FindTeamContent
            teams={MOCK_TEAMS}
            people={MOCK_PEOPLE}
            isLoading={false}
          />
        </div>
      </main>

      <Footer />

      {/* Coachmark Tutorial Overlay — fades out then navigates */}
      {showCoach && (
        <div
          className="transition-opacity duration-400"
          style={{
            opacity: isFadingOut ? 0 : 1,
            transitionDuration: "400ms",
            pointerEvents: isFadingOut ? "none" : "auto",
          }}
        >
          <Coachmark onFinish={handleCoachFinish} />
        </div>
      )}
    </div>
  );
}
