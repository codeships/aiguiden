// Product analytics through Firebase (Google Analytics 4).
// Rule: never send what people type or what the AI says — only counts and labels.
import { getFirebaseAnalytics } from "@/lib/firebase/client";
import { loadAnalyticsSdk } from "@/lib/firebase/sdk";

export type AnalyticsEvent =
  | { name: "select_guide"; params: { guide: string } }
  | { name: "ask_question"; params: { guide: string; language: string; country: string; signed_in: boolean; starter: boolean } }
  | { name: "answer_received"; params: { guide: string; language: string; duration_ms: number; tools_used: number; chars: number } }
  | { name: "answer_error"; params: { guide: string; reason: string } }
  | { name: "answer_stopped"; params: { guide: string } }
  | { name: "change_language"; params: { language: string } }
  | { name: "change_country"; params: { country: string } }
  | { name: "copy_answer"; params: { guide: string } }
  | { name: "clear_chat"; params: { guide: string } }
  | { name: "toggle_lite_mode"; params: { on: boolean } }
  | { name: "login"; params: { method: string } }
  | { name: "sign_up"; params: { method: string } }
  | { name: "logout"; params: Record<string, never> }
  | { name: "sign_in_error"; params: { code: string } };

/** Fire-and-forget. Safe to call anywhere on the client; does nothing if analytics is off. */
export function track<E extends AnalyticsEvent>(name: E["name"], params: E["params"]): void {
  getFirebaseAnalytics()
    .then(async (analytics) => {
      if (!analytics) return;
      const { logEvent } = await loadAnalyticsSdk();
      logEvent(analytics, name as string, params as unknown as Record<string, unknown>);
    })
    .catch(() => {});
}

/** Link analytics to the signed-in user (Firebase uid only — no email or name). */
export function identify(uid: string | null): void {
  getFirebaseAnalytics()
    .then(async (analytics) => {
      if (!analytics) return;
      const { setUserId, setUserProperties } = await loadAnalyticsSdk();
      setUserId(analytics, uid);
      setUserProperties(analytics, { signed_in: uid ? "yes" : "no" });
    })
    .catch(() => {});
}
