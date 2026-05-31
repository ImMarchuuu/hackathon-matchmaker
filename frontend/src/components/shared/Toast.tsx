"use client";

import { useEffect } from "react";

interface Props {
  message: string;
  type?: "error" | "success";
  onClose: () => void;
  duration?: number; // ms, default 4000
}

export default function Toast({ message, type = "error", onClose, duration = 4000 }: Props) {
  useEffect(() => {
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [onClose, duration]);

  const isError = type === "error";

  return (
    <div
      role="alert"
      className={`fixed bottom-6 right-6 z-50 flex items-start gap-3 max-w-sm w-full px-4 py-3 rounded-2xl shadow-xl border text-sm font-semibold animate-in slide-in-from-bottom-4 duration-300 ${
        isError
          ? "bg-white border-red-200 text-red-700"
          : "bg-white border-green-200 text-green-700"
      }`}
    >
      {/* Icon */}
      <span className={`mt-0.5 shrink-0 ${isError ? "text-red-500" : "text-green-500"}`}>
        {isError ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
      </span>

      <span className="flex-1 leading-snug">{message}</span>

      <button
        onClick={onClose}
        className="shrink-0 text-gray-400 hover:text-gray-600 transition-colors mt-0.5"
        aria-label="Dismiss"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
