import { apiFetch } from "@/lib/api";
import type { MeResponse } from "@/types/auth";

/**
 * Onboarding completion flag — stored in localStorage for now (per-browser).
 * Set to "false" when onboarding starts (register / Google login) and to
 * "true" only after the FindTeamView coachmark tour finishes.
 */
export const ONBOARDING_KEY = "grandline_onboarding_completed";

export function isOnboardingDone(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(ONBOARDING_KEY) === "true";
}

export function setOnboardingDone(done: boolean): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ONBOARDING_KEY, done ? "true" : "false");
}

/**
 * Decide where to send a user right after login.
 * Prefers the per-browser localStorage flag; falls back to the backend
 * `onboarding_completed` (and syncs localStorage) so a returning user on a
 * fresh browser isn't forced through onboarding again.
 */
export async function resolveOnboardingDest(): Promise<string> {
  if (isOnboardingDone()) return "/find-team";
  try {
    const me = await apiFetch<MeResponse>("/api/v1/users/me");
    if (me.onboarding_completed) {
      setOnboardingDone(true);
      return "/find-team";
    }
  } catch {
    // ignore — fall through to onboarding
  }
  return "/onboarding";
}
