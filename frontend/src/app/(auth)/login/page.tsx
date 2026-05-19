"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { LoginPayload } from "@/types/auth";

/**
 * Login page — GRAND LINE theme.
 * Form fields: email, password.
 * TODO: Connect to auth API endpoint for actual login.
 */
export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock Auth logic
    document.cookie = "grandline_auth=u1; path=/; max-age=86400";
    router.push("/find-team");
  };

  return (
    <div className="rounded-2xl border border-navy-100 bg-white p-8 shadow-lg">
      <h1 className="text-2xl font-bold text-navy-700 text-center mb-2">Welcome Back</h1>
      <p className="text-sm text-navy-400 text-center mb-8">
        Log in to your GrandLine account
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email */}
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

        {/* Password */}
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

        {/* Submit */}
        <button
          type="submit"
          className="w-full py-3 rounded-full bg-[#1b3168] text-white font-bold hover:bg-[#12234b] transition-colors shadow-md"
        >
          Log In
        </button>
      </form>

      {/* Link to sign up */}
      <p className="mt-6 text-center text-sm text-navy-400">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-navy-700 font-semibold hover:underline">
          Sign Up
        </Link>
      </p>
    </div>
  );
}
