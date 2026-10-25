// Loads the Firebase JS SDK straight from Google's CDN (gstatic.com) in the browser,
// so the app needs no `firebase` npm package. The browser caches these files, and they
// load only when sign-in or analytics actually runs — never on the server.
//
// To upgrade, change the version in all three URLs (see https://firebase.google.com/support/release-notes/js).
// The URLs must stay plain string literals: `webpackIgnore` tells Next.js/Turbopack
// to leave the import for the browser instead of bundling it.

/* ---- Minimal types for the parts of the SDK Wiseyarn uses ---- */

export interface FirebaseApp {
  name: string;
  options: Record<string, unknown>;
}

export interface User {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  getIdToken(forceRefresh?: boolean): Promise<string>;
}

export interface Auth {
  currentUser: User | null;
  useDeviceLanguage(): void;
}

export interface UserCredential {
  user: User;
  providerId: string | null;
  operationType: string;
}

export interface AuthProvider {
  setCustomParameters(params: Record<string, string>): unknown;
}

export type Analytics = { app: FirebaseApp };

export interface AppModule {
  initializeApp(options: Record<string, string>): FirebaseApp;
  getApps(): FirebaseApp[];
}

export interface AuthModule {
  getAuth(app: FirebaseApp): Auth;
  onAuthStateChanged(auth: Auth, next: (user: User | null) => void): () => void;
  getRedirectResult(auth: Auth): Promise<UserCredential | null>;
  GoogleAuthProvider: new () => AuthProvider;
  signInWithPopup(auth: Auth, provider: AuthProvider): Promise<UserCredential>;
  signInWithRedirect(auth: Auth, provider: AuthProvider): Promise<never>;
  signOut(auth: Auth): Promise<void>;
  getAdditionalUserInfo(credential: UserCredential): { isNewUser: boolean } | null;
}

export interface AnalyticsModule {
  getAnalytics(app: FirebaseApp): Analytics;
  isSupported(): Promise<boolean>;
  logEvent(analytics: Analytics, name: string, params?: Record<string, unknown>): void;
  setUserId(analytics: Analytics, id: string | null): void;
  setUserProperties(analytics: Analytics, properties: Record<string, unknown>): void;
}

/* ---- Loaders (cached by the browser's module map: each file loads once) ---- */

export const loadAppSdk = () =>
  import(/* webpackIgnore: true */ "https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js") as Promise<AppModule>;

export const loadAuthSdk = () =>
  import(/* webpackIgnore: true */ "https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js") as Promise<AuthModule>;

export const loadAnalyticsSdk = () =>
  import(
    /* webpackIgnore: true */ "https://www.gstatic.com/firebasejs/13.1.0/firebase-analytics.js"
  ) as Promise<AnalyticsModule>;
