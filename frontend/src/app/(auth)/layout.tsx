import Logo from "@/components/shared/Logo";

/**
 * Auth layout — shared wrapper for /login and /signup pages.
 * Centered card on a light gradient background, matching the GRAND LINE theme.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="light-theme min-h-screen flex flex-col items-center justify-center px-4 relative isolate"
      style={{ background: 'var(--login-gradient)', color: 'var(--color-text)' }}
    >
      {/* Logo above the auth card */}
      <div className="mb-8">
        <Logo />
      </div>

      {/* Auth card container */}
      <div className="w-full max-w-md">{children}</div>

      {/* Copyright */}
      <p className="mt-8 text-xs" style={{ color: 'var(--color-muted)' }}>2025 GrandLine. All right reserved.</p>
    </div>
  );
}
