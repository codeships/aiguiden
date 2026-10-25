// Runs in the browser before the app becomes interactive.
// Starts Firebase Analytics in the background (fire-and-forget, so it never
// delays the first paint). Page views are recorded automatically by Google
// Analytics' enhanced measurement, including client-side navigations.
import { analyticsConfigured } from "@/lib/firebase/config";

if (analyticsConfigured) {
  import("@/lib/firebase/client")
    .then((m) => m.getFirebaseAnalytics())
    .catch(() => {});
}
