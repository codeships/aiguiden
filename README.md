# AIGuiden

An AI guide for Africa and beyond. Pick a guide — Farm, Health, Money & Business, Learn, Jobs & Skills, Rights & Civic, or Everyday — choose your language, and ask in plain words. Built with **Next.js 16** and **LangChain JS v1**, traced in **LangSmith**.

The full product brief and the AI's system prompt are in [`PROMPT.md`](./PROMPT.md).

## Run it

```bash
npm install
cp .env.example .env.local   # then paste your LangSmith key into LANGSMITH_API_KEY
npm run dev
```

Open http://localhost:3000. It answers straight away: with no key at all it uses a free model (gpt-oss-20b via [Pollinations.ai](https://pollinations.ai), no sign-up). Add a LangSmith or OpenAI key for stronger answers, especially in Hausa, Yorùbá, Igbo and other African languages.

### The AI: LangChain's LangSmith LLM Gateway

By default AIGuiden sends every model call through the [LangSmith LLM Gateway](https://docs.langchain.com/langsmith/llm-gateway-quickstart) (`https://gateway.smith.langchain.com/v1`, OpenAI-compatible), using the same `LANGSMITH_API_KEY` as tracing. One key does both. The gateway needs one of:

- **Gateway Credits** in your LangSmith account (paid plans) — then hosted models like `moonshotai/Kimi-K2.6` (default) or `moonshotai/Kimi-K3` work, or
- **Your own provider key**: an admin enables the gateway for the organization, saves your OpenAI key as a workspace secret, and you set `AIGUIDEN_MODEL=openai/gpt-4.1-mini`.

If neither is set up, LangChain's `modelFallbackMiddleware` automatically answers with the free model instead, so the chat never stops working. Set `AIGUIDEN_FREE_MODEL=false` to turn the free model off (questions sent to it go to Pollinations.ai).

### Other providers (direct)

Set `AIGUIDEN_PROVIDER` to skip the gateway.

| Provider | Env vars | Default model |
| --- | --- | --- |
| LangSmith gateway (default) | `LANGSMITH_API_KEY` | `moonshotai/Kimi-K2.6` |
| Free, no key (automatic) | none | `gpt-oss-20b` via Pollinations.ai |
| OpenAI | `OPENAI_API_KEY` | `gpt-5-mini` |
| Anthropic | `ANTHROPIC_API_KEY` | `claude-haiku-5-5` |
| Google Gemini | `GOOGLE_API_KEY` | `gemini-2.5-flash` |
| Groq / OpenRouter / Together / Ollama | `AIGUIDEN_PROVIDER=compatible`, `AIGUIDEN_BASE_URL`, `AIGUIDEN_API_KEY`, `AIGUIDEN_MODEL` | `llama-3.3-70b-versatile` |

Override the model with `AIGUIDEN_MODEL`. See `.env.example` for everything.

### LangSmith

With `LANGSMITH_TRACING=true`, `LANGSMITH_API_KEY` and `LANGSMITH_PROJECT=aiguiden`, every chat shows up at smith.langchain.com under the **aiguiden** project: the system prompt, each model call, each tool call and its result. Runs carry the guide, language, country and model as metadata so you can filter them.

## How it works

```
components/ChatApp.tsx  ── POST /api/chat ──▶ app/api/chat/route.ts
                                               └─ lib/ai/agent.ts  createAgent({ model, tools, systemPrompt })
                                                    ├─ lib/ai/model.ts    LangSmith gateway / provider factory
                                                    ├─ lib/ai/tools.ts    calculator, exchange_rate, country_facts,
                                                    │                     current_time, web_search (if TAVILY_API_KEY)
                                                    └─ lib/ai/prompts.ts  system prompt from guide + language + country
                        ◀── NDJSON stream: token / tool / done / error
```

- **Agent:** `createAgent` from `langchain` (a LangGraph tool-calling loop), streamed with `streamMode: "messages"` so tokens reach the phone as they're written.
- **Guides:** `lib/guides.ts` — add a guide by adding an entry (name, focus, rules, starter questions, colour).
- **Languages:** `lib/languages.ts`. **Countries:** `lib/countries.ts` (54 African countries).
- **Privacy:** chats are stored only in the browser (localStorage). The server keeps nothing.
- **Limits:** 20 messages per minute per IP (in-memory), last 20 turns sent to the model, 8,000 characters per message.

## Deploy

Works on Vercel or any Node host (`npm run build && npm start`). Set the same env vars in the host's settings. For more than one server instance, replace `lib/rate-limit.ts` with Redis/Upstash.

## Next steps

Voice in and out, WhatsApp and USSD channels, RAG over local documents (extension bulletins, syllabuses), accounts and sync, offline PWA.
