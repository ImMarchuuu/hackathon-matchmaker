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
