/**
 * Lightweight cross-component signal for "the current user's profile changed"
 * (avatar, cover, name, etc.). Header and Sidebar listen for this and refetch
 * `/users/me` so their avatar/name update immediately without a full reload.
 */
export const PROFILE_UPDATED_EVENT = "profile:updated";

export function notifyProfileUpdated(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(PROFILE_UPDATED_EVENT));
  }
}
