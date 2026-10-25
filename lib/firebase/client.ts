// Browser-only Firebase setup. The SDK is loaded on demand from Google's CDN
// (see sdk.ts), so the first page paint never waits for Firebase.
import { analyticsConfigured, firebaseConfig, firebaseConfigured } from "./config";
import {
  loadAnalyticsSdk,
  loadAppSdk,
  loadAuthSdk,
  type Analytics,
  type Auth,
  type FirebaseApp,
} from "./sdk";

let appPromise: Promise<FirebaseApp> | null = null;
let authPromise: Promise<Auth> | null = null;
let analyticsPromise: Promise<Analytics | null> | null = null;

export function getFirebaseApp(): Promise<FirebaseApp> {
  if (!firebaseConfigured) return Promise.reject(new Error("Firebase is not configured."));
  appPromise ??= loadAppSdk().then(({ getApps, initializeApp }) => getApps()[0] ?? initializeApp(firebaseConfig));
  // If the CDN can't be reached (offline), let a later call try again.
  appPromise.catch(() => (appPromise = null));
  return appPromise;
}

export function getFirebaseAuth(): Promise<Auth> {
  authPromise ??= Promise.all([getFirebaseApp(), loadAuthSdk()]).then(([app, { getAuth }]) => {
    const auth = getAuth(app);
    auth.useDeviceLanguage(); // Google's sign-in screen in the phone's language
    return auth;
  });
  authPromise.catch(() => (authPromise = null));
  return authPromise;
}

/** Firebase Analytics, or null when not configured / not supported (e.g. some in-app browsers). */
export function getFirebaseAnalytics(): Promise<Analytics | null> {
  if (!analyticsConfigured || typeof window === "undefined") return Promise.resolve(null);
  analyticsPromise ??= Promise.all([getFirebaseApp(), loadAnalyticsSdk()])
    .then(async ([app, { getAnalytics, isSupported }]) => ((await isSupported()) ? getAnalytics(app) : null))
    .catch(() => null);
  return analyticsPromise;
}
