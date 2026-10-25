import type { NextRequest } from "next/server";
import { z } from "zod";
import { runGuide, type StreamEvent } from "@/lib/ai/agent";
import { resolveModelConfig } from "@/lib/ai/model";
import { rateLimit } from "@/lib/rate-limit";

export const maxDuration = 60;

const Body = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(8000),
      }),
    )
    .min(1)
    .max(60),
  guide: z.string().max(20).optional(),
  language: z.string().max(10).optional(),
  country: z.string().max(60).optional(),
});

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  const limited = rateLimit(ip);
  if (!limited.ok) {
    return Response.json(
      { error: `Too many messages. Wait ${limited.retryAfter} seconds and try again.` },
      { status: 429, headers: { "Retry-After": String(limited.retryAfter) } },
    );
  }

  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await request.json());
  } catch {
    return Response.json({ error: "The message could not be read. Refresh the page and try again." }, { status: 400 });
  }
  if (body.messages.at(-1)?.role !== "user") {
    return Response.json({ error: "The last message must come from the user." }, { status: 400 });
  }

  const cfg = resolveModelConfig();
  if (!cfg.provider) {
    return Response.json(
      { error: "No AI model is set up. Add LANGSMITH_API_KEY or OPENAI_API_KEY to .env.local, or remove AIGUIDEN_FREE_MODEL=false." },
      { status: 503 },
    );
  }
  const events = runGuide(body, request.signal);
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (e: StreamEvent) => controller.enqueue(encoder.encode(JSON.stringify(e) + "\n"));
      try {
        for await (const e of events) send(e);
      } catch (err) {
        if (!request.signal.aborted) {
          console.error("[aiguiden] chat error:", err);
          send({ type: "error", message: friendlyError(err) });
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}

function friendlyError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  if (/402|credits are unavailable|credits.*exhausted|usage limit exceeded/i.test(msg))
    return "The LangSmith gateway has no credits. Add Gateway Credits in LangSmith, or turn on the gateway, save your OpenAI key as a workspace secret and set AIGUIDEN_MODEL=openai/gpt-4.1-mini.";
  if (/gateway not enabled/i.test(msg))
    return "The LangSmith LLM Gateway isn't turned on for your organization. An admin can enable it in LangSmith settings.";
  if (/organization must be verified/i.test(msg))
    return "OpenAI needs your organization verified to stream this model. Verify it at platform.openai.com, or pick another model with AIGUIDEN_MODEL.";
  if (/401|invalid.*api.*key|incorrect api key|authentication/i.test(msg))
    return "The AI provider rejected the API key. Check the key in .env.local and restart the server.";
  if (/429|rate limit|quota/i.test(msg)) return "The AI provider is busy or the quota is used up. Try again in a minute.";
  if (/model.*not.*found|does not exist|404/i.test(msg))
    return "The model name isn't available on this provider. Set AIGUIDEN_MODEL in .env.local.";
  if (/recursion/i.test(msg)) return "That took too many steps. Try asking a simpler or more specific question.";
  return "Something went wrong while answering. Try again.";
}
