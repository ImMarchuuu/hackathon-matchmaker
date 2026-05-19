"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import type { AuthResponse, LoginPayload } from "@/types/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload: LoginPayload = { email, password };
      const res = await apiFetch<AuthResponse>("/api/v1/auth/login", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      document.cookie = `grandline_auth=${res.token}; path=/; max-age=604800; SameSite=Lax`;
      router.push("/find-team");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-navy-100 bg-white p-8 shadow-lg">
      <h1 className="text-2xl font-bold text-navy-700 text-center mb-2">Welcome Back</h1>
      <p className="text-sm text-navy-400 text-center mb-8">
        Log in to your GrandLine account
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="login-email" className="block text-sm font-medium text-navy-600 mb-1">
            Email
          </label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
            className="w-full px-4 py-3 rounded-xl border border-navy-200 text-navy-700 text-sm placeholder:text-navy-300 focus:outline-none focus:ring-2 focus:ring-navy-400"
          />
        </div>

        <div>
          <label htmlFor="login-password" className="block text-sm font-medium text-navy-600 mb-1">
            Password
          </label>
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            className="w-full px-4 py-3 rounded-xl border border-navy-200 text-navy-700 text-sm placeholder:text-navy-300 focus:outline-none focus:ring-2 focus:ring-navy-400"
          />
        </div>

        {error && (
          <p className="text-sm text-red-500 text-center">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-full bg-[#1b3168] text-white font-bold hover:bg-[#12234b] transition-colors shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Logging in…" : "Log In"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-navy-400">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-navy-700 font-semibold hover:underline">
          Sign Up
        </Link>
      </p>
    </div>
  );
}
