"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import type { ApiUser } from "@/types/profile";

const ROLE_OPTIONS = [
  "Developer",
  "Business",
  "UI/UX Designer",
  "Marketing",
  "AI / Data",
  "Pitching",
] as const;

interface EditForm {
  name: string;
  bio: string;
  university: string;
  birth_date: string;
  github: string;
  linkedin: string;
  roles: string[];
}

export default function EditProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [form, setForm] = useState<EditForm>({
    name: "",
    bio: "",
    university: "",
    birth_date: "",
    github: "",
    linkedin: "",
    roles: [],
  });

  useEffect(() => {
    apiFetch<ApiUser>("/api/v1/users/me")
      .then((user) => {
        setAvatarUrl(user.avatar_url);
        setCoverUrl(user.cover_image);
        setForm({
          name: user.name ?? "",
          bio: user.bio ?? "",
          university: user.university ?? "",
          birth_date: user.birth_date ?? "",
          github: user.github ?? "",
          linkedin: user.linkedin ?? "",
          roles: user.role.map((r) => r.name),
        });
      })
      .catch(() => router.replace("/login"))
      .finally(() => setLoading(false));
  }, [router]);

  const set = (field: keyof EditForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [field]: e.target.value }));

  const toggleRole = (role: string) =>
    setForm((p) => ({
      ...p,
      roles: p.roles.includes(role) ? p.roles.filter((r) => r !== role) : [...p.roles, role],
    }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    // TODO: call PUT /api/v1/users/me when that endpoint is implemented
    await new Promise((r) => setTimeout(r, 600));
    setSaving(false);
    router.push("/profile");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f6f8]">
        <div className="w-8 h-8 border-4 border-[#1b3168] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#f4f6f8] py-0 px-0 sm:py-8 sm:px-6">
      <div className="flex flex-col w-full max-w-3xl mx-auto bg-white rounded-none sm:rounded-[2rem] border-0 sm:border border-gray-200 shadow-sm overflow-hidden pb-10">

        {/* ── Cover Photo ── */}
        <div className="relative w-full">
          <div className="w-full aspect-[4/1] overflow-hidden relative bg-blue-100 rounded-none sm:rounded-t-[2rem] group cursor-pointer">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={coverUrl ?? "/cover-bg.png"}
              alt="Cover"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white text-sm font-bold">เปลี่ยนรูปปก</span>
            </div>
          </div>

          {/* ── Avatar ── */}
          <div className="absolute -bottom-14 left-6 sm:left-10 group cursor-pointer">
            <div className="w-28 h-28 rounded-full border-4 border-white overflow-hidden bg-white shadow-sm relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={avatarUrl ?? "/avatar.png"}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* ── Form ── */}
        <form onSubmit={handleSubmit} className="px-6 sm:px-10 pt-20 space-y-6">

          {/* Back + Title */}
          <div className="flex items-center gap-3">
            <Link
              href="/profile"
              className="p-2 rounded-full border border-gray-200 text-[#1b3168] hover:bg-gray-50 transition-colors"
              aria-label="ย้อนกลับ"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-2xl font-extrabold text-[#1b3168] tracking-tight">Edit Profile</h1>
          </div>

          <hr className="border-gray-100" />

          {/* Display Name */}
          <div className="space-y-1.5">
            <label htmlFor="name" className="block text-sm font-bold text-[#1b3168]">
              Display Name
            </label>
            <input
              id="name"
              type="text"
              value={form.name}
              onChange={set("name")}
              placeholder="Your name"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[#1b3168] text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1b3168]/30 focus:border-[#1b3168]"
            />
          </div>

          {/* Bio */}
          <div className="space-y-1.5">
            <label htmlFor="bio" className="block text-sm font-bold text-[#1b3168]">
              Bio
            </label>
            <textarea
              id="bio"
              rows={3}
              value={form.bio}
              onChange={set("bio")}
              placeholder="Write something about yourself…"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[#1b3168] text-sm placeholder:text-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-[#1b3168]/30 focus:border-[#1b3168]"
            />
          </div>

          <hr className="border-gray-100" />

          {/* University + Birthday side by side */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="university" className="block text-sm font-bold text-[#1b3168]">
                University
              </label>
              <input
                id="university"
                type="text"
                value={form.university}
                onChange={set("university")}
                placeholder="e.g. Chulalongkorn University"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[#1b3168] text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1b3168]/30 focus:border-[#1b3168]"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="birth_date" className="block text-sm font-bold text-[#1b3168]">
                Birthday
              </label>
              <input
                id="birth_date"
                type="date"
                value={form.birth_date}
                onChange={set("birth_date")}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[#1b3168] text-sm focus:outline-none focus:ring-2 focus:ring-[#1b3168]/30 focus:border-[#1b3168]"
              />
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Contact */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-[#1b3168] uppercase tracking-widest">Contact</h2>

            <div className="space-y-1.5">
              <label htmlFor="github" className="block text-sm font-semibold text-gray-500">
                GitHub
              </label>
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-gray-200 focus-within:ring-2 focus-within:ring-[#1b3168]/30 focus-within:border-[#1b3168]">
                <svg className="w-4 h-4 text-gray-400 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.372.79 1.102.79 2.222v3.293c0 .319.23.57.75.576 4.765-1.589 8.195-6.086 8.195-11.386 0-6.627-5.373-12-12-12" />
                </svg>
                <input
                  id="github"
                  type="text"
                  value={form.github}
                  onChange={set("github")}
                  placeholder="github.com/username"
                  className="flex-1 text-sm text-[#1b3168] placeholder:text-gray-400 bg-transparent focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="linkedin" className="block text-sm font-semibold text-gray-500">
                LinkedIn
              </label>
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-gray-200 focus-within:ring-2 focus-within:ring-[#1b3168]/30 focus-within:border-[#1b3168]">
                <svg className="w-4 h-4 text-gray-400 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
                <input
                  id="linkedin"
                  type="text"
                  value={form.linkedin}
                  onChange={set("linkedin")}
                  placeholder="linkedin.com/in/username"
                  className="flex-1 text-sm text-[#1b3168] placeholder:text-gray-400 bg-transparent focus:outline-none"
                />
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Roles */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-[#1b3168] uppercase tracking-widest">My Roles</h2>
            <div className="flex flex-wrap gap-2">
              {ROLE_OPTIONS.map((role) => {
                const selected = form.roles.includes(role);
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => toggleRole(role)}
                    className={`px-4 py-2 rounded-full text-sm font-bold border transition-all ${
                      selected
                        ? "bg-[#1b3168] text-white border-[#1b3168] shadow-sm"
                        : "bg-white text-[#1b3168] border-gray-200 hover:border-[#1b3168]/50"
                    }`}
                  >
                    {role}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2 pb-2">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 rounded-full bg-[#1b3168] text-white text-sm font-bold hover:bg-[#12224f] transition-colors shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? "กำลังบันทึก…" : "Save Changes"}
            </button>
            <Link
              href="/profile"
              className="px-8 py-3 rounded-full border border-gray-200 text-sm font-bold text-[#1b3168] hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
          </div>

        </form>
      </div>
    </div>
  );
}
