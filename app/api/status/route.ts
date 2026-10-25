import { connection } from "next/server";
import { FREE_MODEL_LABEL, resolveModelConfig } from "@/lib/ai/model";
import { signInRequired } from "@/lib/firebase/verify";
import { setting } from "@/lib/env";

// Tells the UI which model is active. No secrets.
export async function GET() {
  await connection(); // read env at request time, not at build time
  const cfg = resolveModelConfig();
  return Response.json({
    ready: cfg.provider !== null,
    provider: cfg.provider,
    model: cfg.provider === "free" ? FREE_MODEL_LABEL : cfg.provider ? cfg.model : null,
    fallback: cfg.provider !== null && cfg.provider !== "free" && setting("FREE_MODEL") !== "false",
    requireSignIn: signInRequired(),
    search: Boolean(process.env.TAVILY_API_KEY),
    tracing: process.env.LANGSMITH_TRACING === "true" && Boolean(process.env.LANGSMITH_API_KEY),
  });
}
