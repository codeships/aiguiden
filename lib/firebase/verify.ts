import "server-only";
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";
import { firebaseConfig } from "./config";
import { setting } from "@/lib/env";

// Firebase ID tokens are JWTs signed by Google. We check them against Google's
// public keys, so the server needs no service-account file — only the project ID.
// https://firebase.google.com/docs/auth/admin/verify-id-tokens#verify_id_tokens_using_a_third-party_jwt_library
const JWKS = createRemoteJWKSet(
  new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"),
  { cacheMaxAge: 6 * 60 * 60 * 1000, timeoutDuration: 5000 },
);

export interface VerifiedUser {
  uid: string;
  email?: string;
  name?: string;
  provider?: string;
}

const projectId = () => process.env.FIREBASE_PROJECT_ID || firebaseConfig.projectId;

export const authEnabled = () => Boolean(projectId());

/** Sign-in is required to chat whenever Firebase is set up. Set WISEYARN_REQUIRE_SIGN_IN=false to make it optional. */
export const signInRequired = () => authEnabled() && setting("REQUIRE_SIGN_IN") !== "false";

/** Verify a Firebase ID token. Returns null if it's missing, expired, forged or for another project. */
export async function verifyIdToken(token: string | null | undefined): Promise<VerifiedUser | null> {
  const pid = projectId();
  if (!token || !pid) return null;
  try {
    const { payload } = await jwtVerify<JWTPayload & { email?: string; name?: string; firebase?: { sign_in_provider?: string } }>(
      token,
      JWKS,
      {
        issuer: `https://securetoken.google.com/${pid}`,
        audience: pid,
        algorithms: ["RS256"],
        clockTolerance: 30,
      },
    );
    if (!payload.sub) return null;
    return {
      uid: payload.sub,
      email: payload.email,
      name: payload.name,
      provider: payload.firebase?.sign_in_provider,
    };
  } catch {
    return null;
  }
}

export function bearerToken(header: string | null): string | null {
  const m = header?.match(/^Bearer\s+(.+)$/i);
  return m ? m[1].trim() : null;
}
