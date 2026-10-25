// Firebase web config. These values are public by design (they identify your
// Firebase project, they don't grant access), so they're safe in the browser.
//
// Get them from: Firebase console → Project settings → Your apps → Web app → SDK setup.
// Either set the NEXT_PUBLIC_FIREBASE_* variables in .env.local, or paste the
// values directly into the "" fallbacks below.
//
// NOTE: each process.env.NEXT_PUBLIC_* must be written out in full so Next.js
// can inline it into the browser bundle.

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "",
};

/** True once the minimum needed for Google sign-in is filled in. */
export const firebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId && firebaseConfig.appId,
);

/** Analytics also needs a measurement ID (G-XXXXXXX). */
export const analyticsConfigured = firebaseConfigured && Boolean(firebaseConfig.measurementId);
