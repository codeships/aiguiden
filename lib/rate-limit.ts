import "server-only";
import { setting } from "@/lib/env";

// Simple in-memory sliding-window limiter, per IP. Good enough for one server.
// For multiple instances, swap in Redis/Upstash.
const hits = new Map<string, number[]>();

export function rateLimit(key: string, limit = Number(setting("RATE_LIMIT") ?? 20), windowMs = 60_000) {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    hits.set(key, recent);
    return { ok: false, retryAfter: Math.ceil((windowMs - (now - recent[0])) / 1000) };
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) {
    for (const [k, v] of hits) if (!v.some((t) => now - t < windowMs)) hits.delete(k);
  }
  return { ok: true, retryAfter: 0 };
}
