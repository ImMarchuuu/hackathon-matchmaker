"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { resolveOnboardingDest } from "@/lib/onboarding";

function CallbackInner() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const token = params.get("token");
    const error = params.get("error");

    if (error || !token) {
      router.replace("/login?error=oauth_failed");
      return;
    }

    document.cookie = `grandline_auth=${token}; path=/; max-age=604800; SameSite=Lax`;
    // Returning user who already finished onboarding → straight to find-team.
    // Otherwise (incl. first Google sign-in) → run onboarding.
    resolveOnboardingDest().then((dest) => router.replace(dest));
  }, [params, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#f4f6f8]">
      <div className="w-10 h-10 border-4 border-[#1b3168] border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-gray-500 font-medium">Signing you in…</p>
    </div>
  );
}

export default function OAuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#f4f6f8]">
        <div className="w-10 h-10 border-4 border-[#1b3168] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500 font-medium">Signing you in…</p>
      </div>
    }>
      <CallbackInner />
    </Suspense>
  );
}
