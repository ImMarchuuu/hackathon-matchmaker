const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });

  const data = await res.json();

  if (!res.ok) {
    const message = data?.detail ?? `Request failed (${res.status})`;
    throw new Error(Array.isArray(message) ? message[0]?.msg ?? String(message) : String(message));
  }

  return data as T;
}
