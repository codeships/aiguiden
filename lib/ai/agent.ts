import "server-only";
import { createAgent, modelFallbackMiddleware, AIMessage, AIMessageChunk, HumanMessage, ToolMessage, type BaseMessage } from "langchain";
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { createChatModel, createFallbackModels, resolveModelConfig } from "./model";
import { getTools } from "./tools";
import { buildSystemPrompt } from "./prompts";
import { getGuide } from "@/lib/guides";
import { getLanguage } from "@/lib/languages";
import { findCountry } from "@/lib/countries";

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

export interface ChatRequest {
  messages: ChatTurn[];
  guide?: string;
  language?: string;
  country?: string;
  userId?: string; // Firebase uid when signed in (pseudonymous; used for LangSmith filtering)
}

export type StreamEvent =
  | { type: "token"; text: string }
  | { type: "tool"; name: string }
  | { type: "done" }
  | { type: "error"; message: string };

const MAX_TURNS = 20;

/** Pull plain text out of a chunk's content (string or content blocks). */
function chunkText(content: BaseMessage["content"]): string {
  if (typeof content === "string") return content;
  return content
    .map((b) => (typeof b === "string" ? b : b.type === "text" && "text" in b ? String(b.text) : ""))
    .join("");
}

/**
 * Run the Wiseyarn LangChain agent and yield UI events as they happen.
 * The agent is a tool-calling loop (LangGraph under the hood) built with createAgent.
 */
export async function* runGuide(
  req: ChatRequest,
  signal?: AbortSignal,
  modelOverride?: BaseChatModel, // for tests
): AsyncGenerator<StreamEvent> {
  const cfg = resolveModelConfig();
  const guide = getGuide(req.guide);
  const language = getLanguage(req.language);
  const country = findCountry(req.country);
  const tools = getTools();

  const agent = createAgent({
    name: "wiseyarn",
    model: modelOverride ?? createChatModel(cfg),
    tools,
    // If the main model fails before answering (no LangSmith credits, outage, bad key),
    // LangChain retries the same request on the free model so the user still gets an answer.
    middleware: modelOverride ? [] : fallbackMiddleware(cfg),
    systemPrompt: buildSystemPrompt({
      guide,
      language,
      country,
      searchEnabled: tools.some((t) => t.name === "web_search"),
    }),
  });

  const history = req.messages.slice(-MAX_TURNS).map((m) => ({ role: m.role, content: m.content }));

  const stream = await agent.stream(
    { messages: history },
    {
      streamMode: "messages",
      signal,
      recursionLimit: 12,
      // Shows up as metadata on each LangSmith trace, so runs can be filtered by guide/language.
      configurable: { guide: guide.id, language: language.code, country: country?.code ?? "unset", model: cfg.model, user_id: req.userId ?? "anonymous" },
    },
  );

  const announced = new Set<string>();
  for await (const part of stream) {
    const [msg, meta] = part as unknown as [BaseMessage, { langgraph_node?: string }];
    // Only forward what the model writes; skip tool results and other nodes.
    if (meta?.langgraph_node && meta.langgraph_node !== "model_request") continue;
    // Some OpenAI-compatible gateways omit `role` on stream chunks, which LangChain
    // turns into generic ChatMessageChunks — so accept anything that isn't a tool/user message.
    if (ToolMessage.isInstance(msg) || HumanMessage.isInstance(msg)) continue;
    const isChunk = AIMessageChunk.isInstance(msg);
    const calls = isChunk
      ? (msg.tool_call_chunks ?? [])
      : AIMessage.isInstance(msg)
        ? (msg.tool_calls ?? [])
        : [];
    for (const [n, tc] of calls.entries()) {
      const key = tc.id || `${"index" in tc ? tc.index : n}`;
      if (tc.name && !announced.has(key)) {
        announced.add(key);
        yield { type: "tool", name: tc.name };
      }
    }
    const text = chunkText(msg.content);
    if (text) yield { type: "token", text };
  }
  yield { type: "done" };
}

function fallbackMiddleware(cfg: ReturnType<typeof resolveModelConfig>) {
  const fallbacks = createFallbackModels(cfg);
  return fallbacks.length ? [modelFallbackMiddleware(...fallbacks)] : [];
}
