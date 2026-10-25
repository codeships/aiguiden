import "server-only";
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { ChatOpenAI } from "@langchain/openai";
import { ChatAnthropic } from "@langchain/anthropic";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { setting } from "@/lib/env";

export type Provider = "langsmith" | "openai" | "anthropic" | "google" | "compatible" | "free";

export const LANGSMITH_GATEWAY_URL = "https://gateway.smith.langchain.com/v1";
// Free, keyless, OpenAI-compatible endpoint (Pollinations.ai, anonymous tier).
// Used when no other provider is set up, and as an automatic fallback.
export const FREE_BASE_URL = "https://text.pollinations.ai/openai";

export interface ModelConfig {
  provider: Provider | null; // null only if every option is switched off
  model: string;
  baseURL?: string;
}

const DEFAULT_MODELS: Record<Provider, string> = {
  // LangSmith LLM Gateway: hosted models use Gateway Credits; "openai/…", "anthropic/…"
  // use a provider key saved as a LangSmith workspace secret.
  langsmith: "moonshotai/Kimi-K2.6",
  openai: "gpt-5-mini",
  anthropic: "claude-haiku-5-5",
  google: "gemini-2.5-flash",
  compatible: "llama-3.3-70b-versatile",
  free: "openai", // Pollinations alias for gpt-oss-20b
};

export const FREE_MODEL_LABEL = "free model (gpt-oss-20b via Pollinations.ai)";

const freeEnabled = () => setting("FREE_MODEL") !== "false";

/**
 * Work out which provider to use from the environment.
 * Order: WISEYARN_PROVIDER → LangSmith gateway (LANGSMITH_API_KEY) → direct provider
 * keys → the free keyless model.
 */
export function resolveModelConfig(): ModelConfig {
  const env = process.env;
  const explicit = setting("PROVIDER")?.toLowerCase() as Provider | undefined;

  let provider: Provider | null = null;
  if (explicit && explicit in DEFAULT_MODELS) provider = explicit;
  else if (env.LANGSMITH_API_KEY) provider = "langsmith";
  else if (env.OPENAI_API_KEY) provider = "openai";
  else if (env.ANTHROPIC_API_KEY) provider = "anthropic";
  else if (env.GOOGLE_API_KEY) provider = "google";
  else if (setting("BASE_URL") && setting("API_KEY")) provider = "compatible";

  if (provider && !hasKey(provider)) provider = null;
  if (!provider && freeEnabled()) provider = "free";

  const usesCustomModel = provider !== "free" || explicit === "free";
  return {
    provider,
    model: (usesCustomModel && setting("MODEL")) || (provider ? DEFAULT_MODELS[provider] : "none"),
    baseURL:
      provider === "compatible"
        ? setting("BASE_URL")
        : provider === "langsmith"
          ? env.LANGSMITH_GATEWAY_URL || LANGSMITH_GATEWAY_URL
          : provider === "free"
            ? FREE_BASE_URL
            : undefined,
  };
}

function hasKey(p: Provider): boolean {
  const env = process.env;
  switch (p) {
    case "langsmith":
      return Boolean(env.LANGSMITH_API_KEY);
    case "openai":
      return Boolean(env.OPENAI_API_KEY);
    case "anthropic":
      return Boolean(env.ANTHROPIC_API_KEY);
    case "google":
      return Boolean(env.GOOGLE_API_KEY);
    case "compatible":
      return Boolean(setting("BASE_URL") && setting("API_KEY"));
    case "free":
      return true;
  }
}

/** Build the LangChain chat model for the configured provider. */
export function createChatModel(cfg = resolveModelConfig()): BaseChatModel {
  const temperature = Number(setting("TEMPERATURE") ?? 0.4);
  const customTemp = setting("TEMPERATURE") ? { temperature } : {};
  switch (cfg.provider) {
    case "langsmith":
      // LangChain's LangSmith LLM Gateway is OpenAI-compatible and authenticates
      // with the same LangSmith API key used for tracing.
      return new ChatOpenAI({
        model: cfg.model,
        apiKey: process.env.LANGSMITH_API_KEY,
        ...customTemp,
        streaming: true,
        maxRetries: 1, // fail fast (e.g. no credits) so the fallback model can answer
        configuration: { baseURL: cfg.baseURL },
      });
    case "openai":
      return new ChatOpenAI({
        model: cfg.model,
        apiKey: process.env.OPENAI_API_KEY,
        // Some reasoning models reject a custom temperature; only send it when asked.
        ...customTemp,
        streaming: true,
        maxRetries: 2,
      });
    case "anthropic":
      return new ChatAnthropic({
        model: cfg.model,
        apiKey: process.env.ANTHROPIC_API_KEY,
        temperature,
        maxTokens: 2048,
        streaming: true,
        maxRetries: 2,
      });
    case "google":
      return new ChatGoogleGenerativeAI({
        model: cfg.model,
        apiKey: process.env.GOOGLE_API_KEY,
        temperature,
        streaming: true,
        maxRetries: 2,
      });
    case "compatible":
      // Groq, OpenRouter, Together, Ollama (http://localhost:11434/v1) and others.
      return new ChatOpenAI({
        model: cfg.model,
        apiKey: setting("API_KEY"),
        temperature,
        streaming: true,
        maxRetries: 2,
        configuration: { baseURL: cfg.baseURL },
      });
    case "free":
      return createFreeModel(cfg.model);
    default:
      throw new Error("No AI provider is configured.");
  }
}

function createFreeModel(model = DEFAULT_MODELS.free): BaseChatModel {
  return new ChatOpenAI({
    model,
    apiKey: "anonymous", // the anonymous tier needs no key
    streaming: true,
    maxRetries: 2,
    timeout: 90_000,
    configuration: { baseURL: FREE_BASE_URL },
  });
}

/** Models to try if the primary one fails (no credits, outage, bad key…). */
export function createFallbackModels(cfg = resolveModelConfig()): BaseChatModel[] {
  if (!freeEnabled() || cfg.provider === "free" || cfg.provider === null) return [];
  return [createFreeModel()];
}
