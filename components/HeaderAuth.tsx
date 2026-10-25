"use client";

import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { AuthButton } from "@/components/AuthButton";

/**
 * Right side of the home-page header.
 * Signed out (and while checking): clear "Sign in" and "Sign up" buttons.
 * Signed in: a way into the app plus the account menu.
 */
export function HeaderAuth() {
  const { configured, user } = useAuth();

  if (!configured) {
    return (
      <Link href="/chat" className="btn-quiet">
        Open the app
      </Link>
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/chat" className="btn-quiet">
          Open the app
        </Link>
        <AuthButton />
      </div>
    );
  }

  return (
    <nav aria-label="Account" className="flex items-center gap-2">
      <Link href="/signin" className="btn-quiet font-semibold">
        Sign in
      </Link>
      <Link href="/signup" className="btn-gold min-h-10 px-4 text-[0.95rem]">
        Sign up
      </Link>
    </nav>
  );
}

/** Hero call to action: sign up first when signed out, straight into the chat when signed in. */
export function HeroCta() {
  const { configured, user } = useAuth();

  if (!configured || user) {
    return (
      <div className="mt-8 flex flex-wrap items-center gap-4">
        <Link href="/chat" className="btn-gold text-lg">
          Start asking
        </Link>
        <span className="text-ink-soft">
          {user?.name ? `Welcome back, ${user.name.split(" ")[0]}.` : "Free to try. Light on data."}
        </span>
      </div>
    );
  }

  return (
    <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
      <Link href="/signup?next=%2Fchat" className="btn-gold text-lg">
        Create a free account
      </Link>
      <Link href="/signin?next=%2Fchat" className="font-semibold underline underline-offset-4">
        I already have an account
      </Link>
      <span className="w-full text-ink-soft">Free, with your Google account. Light on data.</span>
    </div>
  );
}
