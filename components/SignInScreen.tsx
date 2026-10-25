"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/components/AuthProvider";
import { GoogleMark } from "@/components/AuthButton";
import { GREETINGS } from "@/lib/languages";
import { safeNext } from "@/lib/safe-next";

const WALL = GREETINGS.slice(0, 12);
const SIZES = ["text-4xl", "text-2xl", "text-3xl", "text-xl", "text-5xl", "text-2xl"];

export function SignInScreen() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  const { configured, loading, user, error, signInWithGoogle, signOut, clearError } = useAuth();

  // Signed in (now, or already when the page opened): go on to where they were heading.
  useEffect(() => {
    if (user) {
      const t = setTimeout(() => router.replace(next), 900);
      return () => clearTimeout(t);
    }
  }, [user, next, router]);

  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      {/* Indigo cloth panel: the greetings wall, shortened to a band on phones */}
      <aside
        className="adire relative overflow-hidden px-6 pt-5 pb-6 lg:flex lg:w-[46%] lg:flex-col lg:justify-between lg:p-10"
        aria-label="Greetings in African languages"
      >
        <div className="flex items-center justify-between">
          <Logo tone="light" />
          <Link href="/" className="text-sm text-[#f3f5fb]/80 underline underline-offset-2 lg:hidden">
            Home
          </Link>
        </div>
        <ul className="mt-6 hidden flex-wrap items-baseline gap-x-5 gap-y-3 lg:flex">
          {WALL.map((g, i) => (
            <li key={g.word + g.lang} className="greet" style={{ animationDelay: `${100 + i * 60}ms` }}>
              <span
                className={`font-display leading-none font-bold ${SIZES[i % SIZES.length]} ${i === 4 ? "text-[var(--gold)]" : ""}`}
              >
                {g.word}
              </span>
              <span className="ml-1.5 align-top text-xs opacity-70">{g.lang}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 max-w-sm text-[#f3f5fb]/85 lg:mt-0">
          One account for every guide: farming, health, money, school, jobs and your rights.
        </p>
      </aside>

      {/* Sign-in panel */}
      <main className="flex flex-1 items-center justify-center px-6 py-10 sm:px-10">
        <div className="w-full max-w-sm">
          <div className="mb-10 hidden justify-end lg:flex">
            <Link href="/" className="text-sm text-ink-soft underline underline-offset-2">
              Back to home
            </Link>
          </div>

          {user ? (
            <>
              <h1 className="font-display text-4xl leading-tight font-extrabold tracking-tight">
                Welcome{user.name ? `, ${user.name.split(" ")[0]}` : ""}
              </h1>
              <p className="mt-3 text-ink-soft" role="status">
                You’re signed in{user.email ? ` as ${user.email}` : ""}. Taking you to Wiseyarn…
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link href={next} className="btn-gold">
                  Continue
                </Link>
                <button type="button" className="text-sm text-ink-soft underline" onClick={signOut}>
                  Not you? Sign out
                </button>
              </div>
            </>
          ) : (
            <>
              <h1 className="font-display text-4xl leading-tight font-extrabold tracking-tight">Sign in to Wiseyarn</h1>
              <p className="mt-3 text-ink-soft">
                Use your Google account to start asking. It’s free, and there’s no password to remember.
              </p>

              {configured ? (
                <button
                  type="button"
                  onClick={signInWithGoogle}
                  disabled={loading}
                  className="mt-8 inline-flex min-h-13 w-full items-center justify-center gap-3 rounded-full border border-[#dadce0] bg-white px-5 text-base font-semibold text-[#1f1f1f] hover:bg-[#f8faff] disabled:opacity-50"
                >
                  <GoogleMark size={20} />
                  Continue with Google
                </button>
              ) : (
                <p className="mt-8 rounded-2xl border border-line bg-surface p-4 text-sm">
                  Sign-in isn’t set up on this server yet. Add the Firebase settings described in the README.
                </p>
              )}

              {error && (
                <p role="alert" className="mt-4 rounded-2xl border border-line bg-surface p-4 text-sm">
                  {error}{" "}
                  <button type="button" className="underline" onClick={clearError}>
                    Dismiss
                  </button>
                </p>
              )}

              <p className="mt-8 text-sm text-ink-soft">
                Wiseyarn only sees your name, email and profile photo. It never posts to your Google account, and
                your chats stay on your phone.
              </p>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
