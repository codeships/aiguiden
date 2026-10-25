"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { User, UserCredential } from "@/lib/firebase/sdk";
import { loadAuthSdk } from "@/lib/firebase/sdk";
import { firebaseConfigured } from "@/lib/firebase/config";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { identify, track } from "@/lib/analytics";

export interface AuthUser {
  uid: string;
  name: string | null;
  email: string | null;
  photoURL: string | null;
}

interface AuthState {
  configured: boolean;
  loading: boolean;
  user: AuthUser | null;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  /** Fresh Firebase ID token for API calls, or null when signed out. */
  getIdToken: () => Promise<string | null>;
  clearError: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

const toAuthUser = (u: User): AuthUser => ({
  uid: u.uid,
  name: u.displayName,
  email: u.email,
  photoURL: u.photoURL,
});

// Errors that just mean "the person closed the window" — not worth showing.
const SILENT = new Set(["auth/popup-closed-by-user", "auth/cancelled-popup-request", "auth/user-cancelled"]);

function friendly(code: string): string {
  if (code.includes("api-key")) return "Sign-in isn't set up correctly: the Firebase API key is wrong. Check the NEXT_PUBLIC_FIREBASE_* settings.";
  switch (code) {
    case "auth/configuration-not-found":
      return "Google sign-in isn't switched on yet. In the Firebase console open Authentication, press Get started, then enable Google under Sign-in method.";
    case "auth/network-request-failed":
      return "No connection. Check your data or Wi-Fi and try again.";
    case "auth/unauthorized-domain":
      return "This website isn't allowed to use Google sign-in yet. Add it under Firebase → Authentication → Settings → Authorized domains.";
    case "auth/operation-not-allowed":
      return "Google sign-in is switched off. Turn it on in Firebase → Authentication → Sign-in method.";
    case "auth/too-many-requests":
      return "Too many tries. Wait a minute and sign in again.";
    case "auth/user-disabled":
      return "This account has been disabled.";
    default:
      return "Couldn't sign in with Google. Try again.";
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(firebaseConfigured);
  const [error, setError] = useState<string | null>(null);

  // Keep React in sync with Firebase's session (restored from the browser on load).
  useEffect(() => {
    if (!firebaseConfigured) return;
    let unsub: (() => void) | undefined;
    let cancelled = false;

    (async () => {
      try {
        const auth = await getFirebaseAuth();
        const { onAuthStateChanged, getRedirectResult } = await loadAuthSdk();
        if (cancelled) return;
        unsub = onAuthStateChanged(auth, (u) => {
          setUser(u ? toAuthUser(u) : null);
          setLoading(false);
          identify(u?.uid ?? null);
        });
        // Finish a redirect sign-in (used when the popup was blocked).
        const result = await getRedirectResult(auth).catch(() => null);
        if (result) await logSignIn(result);
      } catch {
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      unsub?.();
    };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setError(null);
    try {
      const auth = await getFirebaseAuth();
      const { GoogleAuthProvider, signInWithPopup, signInWithRedirect } = await loadAuthSdk();
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      try {
        const result = await signInWithPopup(auth, provider);
        await logSignIn(result);
      } catch (e) {
        const code = (e as { code?: string }).code ?? "";
        // Some phones and in-app browsers (WhatsApp, Facebook) block popups: use a full-page redirect instead.
        if (code === "auth/popup-blocked" || code === "auth/operation-not-supported-in-environment") {
          await signInWithRedirect(auth, provider);
          return;
        }
        throw e;
      }
    } catch (e) {
      const code = (e as { code?: string }).code ?? "unknown";
      if (SILENT.has(code)) return;
      track("sign_in_error", { code });
      setError(friendly(code));
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      const auth = await getFirebaseAuth();
      const { signOut: fbSignOut } = await loadAuthSdk();
      await fbSignOut(auth);
      track("logout", {});
    } catch {
      setError("Couldn't sign out. Try again.");
    }
  }, []);

  const getIdToken = useCallback(async () => {
    if (!firebaseConfigured) return null;
    try {
      const auth = await getFirebaseAuth();
      return (await auth.currentUser?.getIdToken()) ?? null;
    } catch {
      return null;
    }
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      configured: firebaseConfigured,
      loading,
      user,
      error,
      signInWithGoogle,
      signOut,
      getIdToken,
      clearError: () => setError(null),
    }),
    [loading, user, error, signInWithGoogle, signOut, getIdToken],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

async function logSignIn(result: UserCredential) {
  const { getAdditionalUserInfo } = await loadAuthSdk();
  const isNew = getAdditionalUserInfo(result)?.isNewUser;
  track(isNew ? "sign_up" : "login", { method: "google" });
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
