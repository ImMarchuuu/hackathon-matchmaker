import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Grand Line — Find Your Team",
  description: "Connect builders, designers, and innovators. Find your perfect hackathon team.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#1b3168",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}