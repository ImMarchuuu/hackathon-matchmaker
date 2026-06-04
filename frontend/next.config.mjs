import withPWA from "@ducanh2912/next-pwa";

const pwa = withPWA({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  // SW only on real production: off for local dev and Vercel preview deploys,
  // so previews always serve fresh code without a service worker masking it.
  disable:
    process.env.NODE_ENV === "development" ||
    process.env.VERCEL_ENV === "preview",
  workboxOptions: {
    disableDevLogs: true,
    // New SW takes control immediately and purges precaches from older builds,
    // so a fresh deploy is never masked by a stale service worker.
    skipWaiting: true,
    clientsClaim: true,
    cleanupOutdatedCaches: true,
    runtimeCaching: [
      // ── Next.js static chunks — Cache First (content-hashed) ─────────────
      {
        urlPattern: /^\/_next\/static\/.*/i,
        handler: "CacheFirst",
        options: {
          cacheName: "next-static",
          expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 365 },
        },
      },
      // ── Next.js image optimisation ────────────────────────────────────────
      {
        urlPattern: /^\/_next\/image\?.*/i,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "next-image",
          expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
        },
      },
      // ── Public static assets (SVG, PNG) ──────────────────────────────────
      {
        urlPattern: /\.(?:svg|png|jpg|jpeg|webp|gif|ico)$/i,
        handler: "CacheFirst",
        options: {
          cacheName: "static-assets",
          expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 },
        },
      },
      // ── Google Fonts ──────────────────────────────────────────────────────
      {
        urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "google-fonts",
          expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
        },
      },
      // ── API: rank + competitions (Stale While Revalidate) ─────────────────
      {
        urlPattern: /\/api\/v1\/users\/[^/]+\/rank-summary/i,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "api-rank",
          expiration: { maxEntries: 50, maxAgeSeconds: 60 * 10 },
        },
      },
      {
        urlPattern: /\/api\/v1\/users\/me\/competitions/i,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "api-competitions",
          expiration: { maxEntries: 10, maxAgeSeconds: 60 * 10 },
        },
      },
      // ── API: teams + current user (Network First, 5s timeout) ────────────
      {
        urlPattern: /\/api\/v1\/teams/i,
        handler: "NetworkFirst",
        options: {
          cacheName: "api-teams",
          networkTimeoutSeconds: 5,
          expiration: { maxEntries: 20, maxAgeSeconds: 60 * 5 },
        },
      },
      {
        urlPattern: /\/api\/v1\/users\/me$/i,
        handler: "NetworkFirst",
        options: {
          cacheName: "api-me",
          networkTimeoutSeconds: 5,
          expiration: { maxEntries: 5, maxAgeSeconds: 60 * 5 },
        },
      },
      // ── App pages (Network First with offline fallback) ───────────────────
      {
        urlPattern: /^https?:\/\/[^/]+\/(find-team|skill-bank|active-teams|profile|saved)(\/.*)?$/i,
        handler: "NetworkFirst",
        options: {
          cacheName: "pages",
          networkTimeoutSeconds: 5,
          expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 },
        },
      },
    ],
  },
  fallbacks: {
    document: "/offline.html",
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // standalone is required for Docker; Vercel handles its own output format
  ...(process.env.DOCKER_BUILD === "true" ? { output: "standalone" } : {}),
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.BACKEND_INTERNAL_URL ?? "http://localhost:8000"}/api/:path*`,
      },
      {
        source: "/uploads/:path*",
        destination: `${process.env.BACKEND_INTERNAL_URL ?? "http://localhost:8000"}/uploads/:path*`,
      },
    ];
  },
};

export default pwa(nextConfig);
