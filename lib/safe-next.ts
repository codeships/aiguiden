/**
 * Where to send someone after sign-in. Only same-site paths are allowed, so a
 * crafted link like /signin?next=https://evil.example can't bounce people off-site.
 */
export function safeNext(next: string | null | undefined, fallback = "/chat"): string {
  if (!next) return fallback;
  if (!next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return fallback;
  if (next.startsWith("/signin")) return fallback;
  return next;
}

/** Link to the sign-in page that returns to `path` afterwards. */
export function signInHref(path?: string): string {
  return path && path !== "/" ? `/signin?next=${encodeURIComponent(path)}` : "/signin";
}
