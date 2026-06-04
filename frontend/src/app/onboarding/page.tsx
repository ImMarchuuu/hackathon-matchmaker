"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import "./onboarding.css";
import FindTeamView from "./FindTeamView";
import { apiFetch, apiUpload } from "@/lib/api";
import type { MeResponse } from "@/types/auth";

/* ═══════════════════════════════════════════════════
   Constants
   ═══════════════════════════════════════════════════ */
const TOTAL_STEPS = 2; // Steps 2 & 3 are the dot-navigation steps
const DEFAULT_AVATAR = "/profile.svg";
const DEFAULT_COVER = "/Bg.svg";
const ACCEPTED_IMAGES = "image/png,image/jpeg,image/webp,image/gif";

/* ═══════════════════════════════════════════════════
   Reusable: Anchor Icon
   ═══════════════════════════════════════════════════ */
function AnchorIcon({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="5" r="3" />
      <line x1="12" y1="22" x2="12" y2="8" />
      <path d="M5 12H2a10 10 0 0 0 20 0h-3" />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════
   Reusable: Step Navigation Header
   ═══════════════════════════════════════════════════ */
function StepHeader({
  currentStep,
  totalSteps,
  onBack,
  onSkip,
}: {
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
  onSkip: () => void;
}) {
  return (
    <div className="flex items-center justify-between w-full mb-8">
      {/* Back Arrow */}
      <button onClick={onBack} className="p-2 -ml-2 text-[#1b3168] hover:bg-gray-100 rounded-full transition-colors" aria-label="ย้อนกลับ">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Step Dots */}
      <div className="flex items-center gap-2">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={`rounded-full transition-all duration-300 ${
              i + 1 === currentStep
                ? "w-8 h-2.5 bg-[#1b3168]"
                : i + 1 < currentStep
                ? "w-2.5 h-2.5 bg-[#1b3168]"
                : "w-2.5 h-2.5 bg-gray-300"
            }`}
          />
        ))}
      </div>

      {/* Skip */}
      <button onClick={onSkip} className="text-sm font-semibold text-gray-400 hover:text-gray-600 transition-colors px-2 py-1">
        ข้าม
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   Reusable: Bottom CTA Button
   ═══════════════════════════════════════════════════ */
function BottomCTA({ label, onClick, disabled = false }: { label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <div className="mt-auto pt-8 sm:pt-12 w-full flex justify-center">
      <button
        onClick={onClick}
        disabled={disabled}
        className="w-full max-w-md py-4 rounded-full bg-[#1b3168] text-white font-bold text-base hover:bg-[#12234b] active:scale-[0.98] transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {label}
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
        </svg>
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   Step 1 — Welcome (Full blue gradient screen)
   ═══════════════════════════════════════════════════ */
function WelcomeStep({ userName, onNext }: { userName: string; onNext: () => void }) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-12 text-center"
      style={{ background: "linear-gradient(180deg, #022DA0 0%, #0F5EC1 40%, #26B1F8 100%)" }}
    >
      <div className="ob-slide-up flex flex-col items-center gap-6 w-full max-w-sm">
        {/* Anchor Icon with pulse ring */}
        <div className="relative flex items-center justify-center">
          <div className="absolute w-24 h-24 rounded-full bg-white/10 ob-pulse-ring" />
          <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
            <AnchorIcon className="w-10 h-10 text-white" />
          </div>
        </div>

        {/* Logo area */}
        <div className="flex flex-col items-center gap-1">
          <p className="text-white/70 text-sm font-medium">ยินดีต้อนรับสู่</p>
          <img src="/Logo.svg" alt="Grand Line" className="h-10 w-auto object-contain invert select-none" />
        </div>

        {/* Greeting */}
        <div className="flex flex-col items-center gap-1">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
            สวัสดี
          </h1>
          {userName && (
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight flex items-center gap-2">
              คุณ {userName}
            </h1>
          )}
        </div>

        {/* Subtitle */}
        <p className="text-white/80 text-sm leading-relaxed max-w-xs">
          ยืนยันตัวตนเรียบร้อยแล้ว มาเริ่มตั้งค่าโปรไฟล์
          <br />เพื่อออกเดินทางหาทีมในฝันกันเลย
        </p>

        {/* CTA Button */}
        <div className="w-full mt-6">
          <button
            onClick={onNext}
            className="w-full py-4 rounded-full bg-white/20 backdrop-blur-sm text-white font-bold text-base border border-white/30 hover:bg-white/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            เริ่มตั้งค่าโปรไฟล์
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   Step 2 — Profile Photo & Cover
   ═══════════════════════════════════════════════════ */
function ProfileStep({
  onNext,
  onBack,
  onSkip,
  avatarPreview,
  coverPreview,
  onAvatarSelect,
  onCoverSelect,
}: {
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
  avatarPreview: string | null;
  coverPreview: string | null;
  onAvatarSelect: (file: File) => void;
  onCoverSelect: (file: File) => void;
}) {
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="w-full max-w-2xl mx-auto px-5 sm:px-8 pt-6 pb-8 flex flex-col flex-1">
        {/* Navigation Header */}
        <StepHeader currentStep={1} totalSteps={TOTAL_STEPS} onBack={onBack} onSkip={onSkip} />

        {/* Hidden file inputs */}
        <input
          ref={avatarInputRef}
          type="file"
          accept={ACCEPTED_IMAGES}
          className="hidden"
          onChange={(e) => e.target.files?.[0] && onAvatarSelect(e.target.files[0])}
        />
        <input
          ref={coverInputRef}
          type="file"
          accept={ACCEPTED_IMAGES}
          className="hidden"
          onChange={(e) => e.target.files?.[0] && onCoverSelect(e.target.files[0])}
        />

        <div className="ob-slide-up flex flex-col flex-1">
          {/* Title */}
          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1b3168] tracking-tight">
              รูปโปรไฟล์ & ปก
            </h2>
            <p className="text-sm text-gray-400 mt-1.5 leading-relaxed">
              เพิ่มรูปให้เพื่อนร่วมทีมจำคุณได้ง่ายขึ้น
              <br />หรือข้ามไปใส่ทีหลังก็ได้
            </p>
          </div>

          {/* Cover Photo Area */}
          <div className="relative mb-16">
            {/* Cover */}
            <div
              onClick={() => coverInputRef.current?.click()}
              className="w-full aspect-[16/7] sm:aspect-[16/6] rounded-2xl overflow-hidden relative cursor-pointer group bg-center bg-cover"
              style={{ backgroundImage: `url(${coverPreview ?? DEFAULT_COVER})` }}
            >
              {/* Upload cover button */}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); coverInputRef.current?.click(); }}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-black/30 hover:bg-black/40 backdrop-blur-sm text-white text-xs sm:text-sm font-semibold rounded-lg transition-colors"
              >
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                </svg>
                เพิ่มรูปปก
              </button>
            </div>

            {/* Profile Avatar — overlapping the cover */}
            <div className="absolute -bottom-10 left-6 sm:left-8">
              <div
                onClick={() => avatarInputRef.current?.click()}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-white bg-white shadow-lg overflow-hidden cursor-pointer group relative"
              >
                <img
                  src={avatarPreview ?? DEFAULT_AVATAR}
                  alt="รูปโปรไฟล์"
                  className="w-full h-full object-cover select-none"
                />
                {/* Camera badge */}
                <div className="absolute -bottom-0.5 -right-0.5 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#1b3168] border-2 border-white flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom CTA */}
          <BottomCTA label="ถัดไป" onClick={onNext} />
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   Step 3 — About You (Bio, GitHub, LinkedIn)
   ═══════════════════════════════════════════════════ */
function AboutStep({
  onNext,
  onBack,
  onSkip,
  saving,
  bio,
  github,
  linkedin,
  setBio,
  setGithub,
  setLinkedin,
}: {
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
  saving: boolean;
  bio: string;
  github: string;
  linkedin: string;
  setBio: (v: string) => void;
  setGithub: (v: string) => void;
  setLinkedin: (v: string) => void;
}) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="w-full max-w-2xl mx-auto px-5 sm:px-8 pt-6 pb-8 flex flex-col flex-1">
        {/* Navigation Header */}
        <StepHeader currentStep={2} totalSteps={TOTAL_STEPS} onBack={onBack} onSkip={onSkip} />

        <div className="ob-slide-up flex flex-col flex-1">
          {/* Title */}
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1b3168] tracking-tight">
              เกี่ยวกับคุณ
            </h2>
            <p className="text-sm text-gray-400 mt-1.5 leading-relaxed">
              บอกทีมหน่อยว่าคุณถนัดอะไร แชร์ลิงก์ผลงานได้เลย
            </p>
          </div>

          {/* Form Fields */}
          <div className="space-y-6 flex-1">
            {/* Bio */}
            <div>
              <label className="block text-sm font-bold text-[#1b3168] mb-2">แนะนำตัวสั้นๆ</label>
              <textarea
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="เช่น เป็น Frontend dev อยากหาทีมแข่ง Hackathon สาย AI..."
                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 text-sm text-gray-700 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1b3168]/20 focus:border-[#1b3168] resize-none transition-all bg-gray-50/50"
              />
            </div>

            {/* GitHub */}
            <div>
              <label className="block text-sm font-bold text-[#1b3168] mb-2">GitHub</label>
              <input
                type="text"
                value={github}
                onChange={(e) => setGithub(e.target.value)}
                placeholder="github.com/ username"
                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 text-sm text-gray-700 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1b3168]/20 focus:border-[#1b3168] transition-all bg-gray-50/50"
              />
            </div>

            {/* LinkedIn */}
            <div>
              <label className="block text-sm font-bold text-[#1b3168] mb-2">LinkedIn</label>
              <input
                type="text"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                placeholder="linkedin.com/in/ your-name"
                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 text-sm text-gray-700 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1b3168]/20 focus:border-[#1b3168] transition-all bg-gray-50/50"
              />
            </div>
          </div>

          {/* Bottom CTA */}
          <BottomCTA label={saving ? "กำลังบันทึก…" : "บันทึกและไปต่อ"} onClick={onNext} disabled={saving} />
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   Step 4 — Completion (Full blue gradient screen)
   ═══════════════════════════════════════════════════ */
function CompleteStep({ userName, onFinish }: { userName: string; onFinish: () => void }) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-12 text-center"
      style={{ background: "linear-gradient(180deg, #0F5EC1 0%, #2B8FE0 50%, #3BA3F0 100%)" }}
    >
      <div className="ob-fade-in flex flex-col items-center gap-6 w-full max-w-sm">
        {/* Checkmark Circle */}
        <div className="relative flex items-center justify-center">
          <div className="absolute w-28 h-28 rounded-full bg-white/10 ob-pulse-ring" />
          <div className="ob-pop-in w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-lg">
            <svg className="w-10 h-10 text-[#1b3168]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        {/* Success Message */}
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white flex items-center gap-2">
            เสร็จสิ้น!
          </h1>
          <p className="text-white/80 text-sm leading-relaxed max-w-xs mt-1">
            โปรไฟล์ของคุณ {userName} พร้อมแล้ว
            <br />ได้เวลาหาทีมในฝันแล้ว!
          </p>
        </div>

        {/* CTA Button */}
        <div className="w-full mt-6">
          <button
            onClick={onFinish}
            className="w-full max-w-xs mx-auto py-4 rounded-full bg-white text-[#1b3168] font-bold text-base hover:bg-gray-50 active:scale-[0.98] transition-all shadow-lg flex items-center justify-center gap-2"
          >
            ไปหน้า FIND TEAM
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
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
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loadingUser, setLoadingUser] = useState(true);

  // ── Profile form state (hydrated from /users/me) ──────────────────────────
  const [userName, setUserName] = useState("");
  const [bio, setBio] = useState("");
  const [github, setGithub] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // ── Load the real user; skip onboarding entirely if already completed ─────
  useEffect(() => {
    let active = true;
    apiFetch<MeResponse>("/api/v1/users/me")
      .then((me) => {
        if (!active) return;
        if (me.onboarding_completed) {
          router.replace("/find-team");
          return;
        }
        setUserName(me.name || "");
        setBio(me.bio ?? "");
        setGithub(me.github ?? "");
        setLinkedin(me.linkedin ?? "");
        if (me.avatar_url) setAvatarPreview(me.avatar_url);
        if (me.cover_image) setCoverPreview(me.cover_image);
        setLoadingUser(false);
      })
      .catch(() => {
        if (active) router.replace("/login");
      });
    return () => {
      active = false;
    };
  }, [router]);

  const handleAvatarSelect = (file: File) => {
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleCoverSelect = (file: File) => {
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  // Persist everything to the backend and mark onboarding as done.
  const persistProfile = async () => {
    if (avatarFile) await apiUpload("/api/v1/users/me/avatar", avatarFile);
    if (coverFile) await apiUpload("/api/v1/users/me/cover", coverFile);

    const payload: Record<string, unknown> = { onboarding_completed: true };
    if (bio.trim()) payload.bio = bio.trim();
    if (github.trim()) payload.github = github.trim();
    if (linkedin.trim()) payload.linkedin = linkedin.trim();

    await apiFetch("/api/v1/users/me", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  };

  // Save (from "บันทึกและไปต่อ" or "ข้าม") then show the completion screen.
  const handleSaveAndComplete = async () => {
    if (saving) return;
    setSaving(true);
    setError("");
    try {
      await persistProfile();
      setStep(4);
    } catch (err) {
      setError(err instanceof Error ? err.message : "บันทึกไม่สำเร็จ ลองอีกครั้ง");
    } finally {
      setSaving(false);
    }
  };

  // Completion screen → show the mock Find Team view + coachmark tour,
  // which navigates to the real /find-team page once the tour finishes.
  const handleFinish = () => {
    setStep(5);
  };

  if (loadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-10 h-10 border-4 border-[#1b3168]/20 border-t-[#1b3168] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      {step === 1 && <WelcomeStep userName={userName} onNext={() => setStep(2)} />}
      {step === 2 && (
        <ProfileStep
          onNext={() => setStep(3)}
          onBack={() => setStep(1)}
          onSkip={handleSaveAndComplete}
          avatarPreview={avatarPreview}
          coverPreview={coverPreview}
          onAvatarSelect={handleAvatarSelect}
          onCoverSelect={handleCoverSelect}
        />
      )}
      {step === 3 && (
        <AboutStep
          onNext={handleSaveAndComplete}
          onBack={() => setStep(2)}
          onSkip={handleSaveAndComplete}
          saving={saving}
          bio={bio}
          github={github}
          linkedin={linkedin}
          setBio={setBio}
          setGithub={setGithub}
          setLinkedin={setLinkedin}
        />
      )}
      {step === 4 && <CompleteStep userName={userName} onFinish={handleFinish} />}
      {step === 5 && <FindTeamView />}

      {error && (
        <div className="fixed bottom-4 inset-x-0 flex justify-center px-4 z-50">
          <p className="bg-red-500 text-white text-sm px-4 py-2 rounded-full shadow-lg">{error}</p>
        </div>
      )}
    </>
  );
}
