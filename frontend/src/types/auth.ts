export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignupPayload {
  name: string;
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    displayName: string;
    email: string;
    avatarUrl?: string;
  };
}

/** Subset of the `/users/me` response needed by onboarding. */
export interface MeResponse {
  id: string;
  username: string;
  name: string;
  email: string;
  avatar_url?: string | null;
  cover_image?: string | null;
  bio?: string | null;
  github?: string | null;
  linkedin?: string | null;
  onboarding_completed: boolean;
}
