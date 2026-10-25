"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { signInHref } from "@/lib/safe-next";
import { useAuth } from "@/components/AuthProvider";

/** Google's "G" mark, as required next to "Sign in with Google". */
export function GoogleMark({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

/** The standard Google sign-in button. */
export function GoogleSignInButton({ label = "Sign in with Google", compact = false }: { label?: string; compact?: boolean }) {
  const { signInWithGoogle, loading } = useAuth();
  return (
    <button
      type="button"
      onClick={signInWithGoogle}
      disabled={loading}
      aria-label={label}
      className={`inline-flex min-h-10 min-w-10 items-center justify-center gap-2 rounded-full border border-[#dadce0] bg-white text-[0.95rem] font-semibold text-[#1f1f1f] hover:bg-[#f8faff] disabled:opacity-50 ${
        compact ? "px-2.5 sm:px-3.5" : "px-3.5"
      }`}
    >
      <GoogleMark />
      {/* On small phones the compact button is the Google "G" alone, as Google's branding allows. */}
      <span className={compact ? "hidden sm:inline" : ""}>{label}</span>
    </button>
  );
}

function Avatar({ name, photoURL }: { name: string | null; photoURL: string | null }) {
  const initial = (name ?? "?").trim().charAt(0).toUpperCase();
  return photoURL ? (
    // eslint-disable-next-line @next/next/no-img-element -- tiny avatar from Google; next/image would need remotePatterns
    <img src={photoURL} alt="" width={32} height={32} referrerPolicy="no-referrer" className="h-8 w-8 rounded-full" />
  ) : (
    <span className="grid h-8 w-8 place-items-center rounded-full bg-[var(--indigo)] text-sm font-bold text-[var(--paper)]">
      {initial}
    </span>
  );
}

/** Header control: sign-in button when signed out, avatar menu when signed in. */
export function AuthButton() {
  const { configured, loading, user, signOut } = useAuth();
  const router = useRouter();
  const menuRef = useRef<HTMLDetailsElement>(null);

  // Close the account menu when tapping elsewhere.
  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (menuRef.current?.open && !menuRef.current.contains(e.target as Node)) menuRef.current.open = false;
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  if (!configured) return null;
  if (loading) return <span className="inline-block h-8 w-8 rounded-full bg-[var(--line)]" aria-label="Checking sign-in" />;

  if (!user) {
    // Signed out: go to the sign-in page, then come back to this exact page.
    return (
      <button
        type="button"
        className="btn-quiet font-semibold"
        onClick={() => router.push(signInHref(location.pathname + location.search))}
      >
        Sign in
      </button>
    );
  }

  return (
    <details ref={menuRef} className="relative">
      <summary className="list-none rounded-full [&::-webkit-details-marker]:hidden" aria-label="Your account">
        <Avatar name={user.name} photoURL={user.photoURL} />
      </summary>
      <div className="absolute top-full right-0 z-20 mt-2 w-64 rounded-xl border border-line bg-surface p-3 shadow-lg">
        <p className="font-semibold">{user.name ?? "Signed in"}</p>
        {user.email && <p className="truncate text-sm text-ink-soft">{user.email}</p>}
        <button type="button" className="btn-quiet mt-3 w-full justify-center" onClick={signOut}>
          Sign out
        </button>
      </div>
    </details>
  );
}
