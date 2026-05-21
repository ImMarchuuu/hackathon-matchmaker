"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import type { ApiUser } from "@/types/profile";

export default function ProfileRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    apiFetch<ApiUser>("/api/v1/users/me")
      .then((user) => router.replace(`/profile/${user.username}`))
      .catch(() => router.replace("/login"));
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f6f8]">
      <div className="w-8 h-8 border-4 border-[#1b3168] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
