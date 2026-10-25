import "server-only";

/**
 * Read a Wiseyarn setting from the environment, e.g. setting("MODEL") reads WISEYARN_MODEL.
 * The app used to be called AIGuiden, so the old AIGUIDEN_* names still work as a fallback.
 */
export function setting(name: string): string | undefined {
  return process.env[`WISEYARN_${name}`] ?? process.env[`AIGUIDEN_${name}`];
}
