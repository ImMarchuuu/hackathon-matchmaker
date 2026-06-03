function getAuthToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)grandline_auth=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  // Always use relative path — Next.js rewrite proxies /api/* to the backend.
  // This keeps all browser requests same-origin and avoids CORS entirely.
  const res = await fetch(path, { ...options, headers });

  let data: unknown = null;
  if (res.status !== 204) {
    const text = await res.text();
    try { data = JSON.parse(text); } catch { data = { detail: text || `Request failed (${res.status})` }; }
  }

  if (!res.ok) {
    const detail = (data as Record<string, unknown>)?.detail ?? `Request failed (${res.status})`;
    throw new Error(Array.isArray(detail) ? (detail[0] as Record<string, unknown>)?.msg as string ?? String(detail) : String(detail));
  }

  return data as T;
}
