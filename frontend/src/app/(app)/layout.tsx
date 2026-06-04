"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import Footer from "@/components/layout/Footer";

/**
 * Shared layout for all authenticated app pages.
 * Desktop: fixed sidebar left + main content offset. Mobile: hamburger opens drawer overlay.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const isProfilePage = pathname === "/profile" || pathname.startsWith("/profile/") || pathname === "/skill-bank";

  return (
    <div className="light-theme min-h-screen flex flex-col relative isolate" style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}>
      <Header onMenuToggle={() => setSidebarOpen((v) => !v)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content — full-width everywhere since Desktop has no Sidebar */}
      <main className={`flex-grow w-full ${isProfilePage ? "bg-[#f5f7fa]" : ""}`}>
        <div className={isProfilePage ? "w-full" : "max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8"}>
          {children}
        </div>
      </main>

      <Footer />
    </div>
  );
}
