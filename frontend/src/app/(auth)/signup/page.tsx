"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import type { AuthResponse, SignupPayload } from "@/types/auth";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const payload: SignupPayload = { name, username, email, password };
      const res = await apiFetch<AuthResponse>("/api/v1/auth/register", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      document.cookie = `grandline_auth=${res.token}; path=/; max-age=604800; SameSite=Lax`;
      router.push("/find-team");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-navy-100 bg-white p-8 shadow-lg">
      <h1 className="text-2xl font-bold text-navy-700 text-center mb-2">Create Account</h1>
      <p className="text-sm text-navy-400 text-center mb-8">
        Join GrandLine and find your hackathon team
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="signup-name" className="block text-sm font-medium text-navy-600 mb-1">
            Display Name
          </label>
          <input
            id="signup-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Your name"
            className="w-full px-4 py-3 rounded-xl border border-navy-200 text-navy-700 text-sm placeholder:text-navy-300 focus:outline-none focus:ring-2 focus:ring-navy-400"
          />
        </div>

        <div>
          <label htmlFor="signup-username" className="block text-sm font-medium text-navy-600 mb-1">
            Username
          </label>
          <input
            id="signup-username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
            required
            placeholder="your_username"
            className="w-full px-4 py-3 rounded-xl border border-navy-200 text-navy-700 text-sm placeholder:text-navy-300 focus:outline-none focus:ring-2 focus:ring-navy-400"
          />
          <p className="mt-1 text-xs text-navy-300">Lowercase letters, numbers, and underscores only</p>
        </div>

        <div>
          <label htmlFor="signup-email" className="block text-sm font-medium text-navy-600 mb-1">
            Email
          </label>
          <input
            id="signup-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
            className="w-full px-4 py-3 rounded-xl border border-navy-200 text-navy-700 text-sm placeholder:text-navy-300 focus:outline-none focus:ring-2 focus:ring-navy-400"
          />
        </div>

        <div>
          <label htmlFor="signup-password" className="block text-sm font-medium text-navy-600 mb-1">
            Password
          </label>
          <input
            id="signup-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            placeholder="••••••••"
            className="w-full px-4 py-3 rounded-xl border border-navy-200 text-navy-700 text-sm placeholder:text-navy-300 focus:outline-none focus:ring-2 focus:ring-navy-400"
          />
        </div>

        <div>
          <label htmlFor="signup-confirm" className="block text-sm font-medium text-navy-600 mb-1">
            Confirm Password
          </label>
          <input
            id="signup-confirm"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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
          {loading ? "Creating account…" : "Sign Up"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-navy-400">
        Already have an account?{" "}
        <Link href="/login" className="text-navy-700 font-semibold hover:underline">
          Log In
        </Link>
      </p>
    </div>
  );
}
