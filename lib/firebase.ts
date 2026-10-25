// Firebase is set up in lib/firebase/:
//   config.ts  — your project's web config (aiguiden-afa82)
//   client.ts  — lazy-loaded app, Auth and Analytics for the browser
//   verify.ts  — server-side ID-token checks
// This file only re-exports the config, so older imports of "@/lib/firebase" keep working.
// (Initialising Firebase here at import time would crash on the server and load
// Analytics before the page is interactive.)
export { firebaseConfig, firebaseConfigured, analyticsConfigured } from "./firebase/config";
