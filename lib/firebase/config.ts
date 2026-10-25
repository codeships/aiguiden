// Firebase web config. These values are public by design (they identify your
// Firebase project, they don't grant access), so they're safe in the browser.
//
// Get them from: Firebase console → Project settings → Your apps → Web app → SDK setup.
// The values below are the aiguiden-afa82 project. NEXT_PUBLIC_FIREBASE_* variables
// in .env.local override them (e.g. for a separate staging project).
//
// NOTE: each process.env.NEXT_PUBLIC_* must be written out in full so Next.js
// can inline it into the browser bundle.

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBvNYcf7Rk7WVIsRN6A1odG8Mfa-gVAaYE",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "aiguiden-afa82.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "aiguiden-afa82",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "aiguiden-afa82.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "777703826375",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:777703826375:web:8da0407e52b376bf056fe2",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-5RSTD8GETQ",
};

/** True once the minimum needed for Google sign-in is filled in. */
export const firebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId && firebaseConfig.appId,
);

/** Analytics also needs a measurement ID (G-XXXXXXX). */
export const analyticsConfigured = firebaseConfigured && Boolean(firebaseConfig.measurementId);
