"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function OAuthCallbackPage() {
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
    router.replace("/find-team");
  }, [params, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#f4f6f8]">
      <div className="w-10 h-10 border-4 border-[#1b3168] border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-gray-500 font-medium">Signing you in…</p>
    </div>
  );
}
