# AIGuiden — build prompt

This is the prompt the app was built from. Hand it to any coding model (or a
developer) to rebuild, extend, or audit AIGuiden. The runtime system prompt
the AI itself uses lives in `lib/ai/prompts.ts` and is reproduced at the end.

---

## 1. Product

**AIGuiden** is an AI guide for Africa and beyond. A person opens it on a
phone, picks a guide (farming, health, money and business, learning, jobs,
everyday rights), picks their language, and asks a question in plain words.
They get a short, practical answer that fits where they live — local crops
and seasons, mobile money instead of credit cards, naira and shillings
instead of dollars, clinics and hotlines instead of "call your GP".

"Beyond" means the diaspora and anyone else: the same guides work anywhere,
and the AI adapts to the country the user names.

### Who it is for

- A smallholder farmer in Kano asking when to plant sorghum and how to deal
  with fall armyworm.
- A trader in Nairobi working out the margin on a bale of second-hand clothes
  and how to price M-Pesa fees in.
- A secondary school student in Accra revising for WASSCE chemistry.
- A nurse's aide in Kampala checking the danger signs of malaria in a child.
- A graduate in Lagos rewriting a CV for a remote job abroad.
- A Senegalese student in Lyon who wants answers in French and Wolof terms.

### What success looks like

1. Useful answer in under 10 seconds, even on a slow 3G connection.
2. The answer is in the language the user chose, with local terms kept.
3. Numbers are computed with tools, not guessed.
4. Health, legal and money answers are careful: they say when to see a
   professional, and never invent laws, prices or phone numbers.

## 2. Features (v1)

| Area | Requirement |
| --- | --- |
| Guides | Six personas, each with its own system prompt, starter questions and colour: **Farm**, **Health**, **Money & Business**, **Learn**, **Jobs & Skills**, **Rights & Civic**. Plus a general guide. |
| Languages | English, Nigerian Pidgin, Hausa, Yorùbá, Igbo, Swahili, Amharic, Zulu, Somali, French, Arabic, Portuguese. The model is told to answer in the chosen language and to fall back to English with a short note if it cannot. |
| Country | Optional country picker (all 54 African countries + "Elsewhere"). Feeds currency, seasons and institutions into the prompt. |
| Chat | Streaming answers, markdown rendering, stop button, retry, copy, clear chat. History kept in the browser (localStorage), never on the server. |
| Tools (LangChain) | `calculator` (safe arithmetic), `exchange_rate` (live rates, open.er-api.com), `country_facts` (capital, currency, languages, dialling code for African countries), `current_time` (by country/time zone), `web_search` (Tavily, only when `TAVILY_API_KEY` is set). |
| Models | Provider-agnostic through LangChain: OpenAI, Anthropic, Google Gemini, or any OpenAI-compatible endpoint (Groq, OpenRouter, Together, a local Ollama). Chosen by env vars. |
| Demo mode | With no API key the app still runs and tells the user how to add one. |
| Low bandwidth | One page of JS for the chat, no images in the core flow, system-font fallback, "Lite mode" toggle that turns off motion. |
| Safety | Per-IP rate limit, input length cap, history trimmed to the last 20 turns, no keys in the browser. |

### Out of scope for v1 (next steps)

Accounts and sync, voice in/out, WhatsApp/USSD channels, RAG over local
documents (extension ministry bulletins, school syllabuses), offline PWA.

## 3. Architecture

```
Browser (Next.js client component)
  └─ POST /api/chat  {messages, guide, language, country}
       └─ lib/ai/agent.ts   createAgent({ model, tools, systemPrompt })
            ├─ lib/ai/model.ts   provider factory (OpenAI / Anthropic / Gemini / compatible)
            ├─ lib/ai/tools.ts   LangChain tools (zod schemas)
            └─ lib/ai/prompts.ts system prompt built from guide + language + country
       ⇠ NDJSON stream: {"type":"token"} {"type":"tool"} {"type":"done"} {"type":"error"}
GET /api/status → which provider/model is active, whether search is on
```

- **Stack:** Next.js 16 App Router (TypeScript, Tailwind v4), LangChain JS v1
  (`langchain`, `@langchain/core`, provider packages), zod.
- **Streaming:** `agent.stream(..., { streamMode: "messages" })`, AI message
  chunks forwarded as tokens; tool calls surfaced as status events.
- **Config:** `.env.local` — see `.env.example`.

## 4. Design direction

- Audience is mostly on mid-range Android phones in bright light. High
  contrast, large tap targets, legible type (Atkinson Hyperlegible for body),
  an expressive display face (Bricolage Grotesque) for headlines.
- Palette taken from adire (Yoruba indigo resist-dyed cloth) and kente gold:
  indigo ink, pale indigo paper, gold for the one call to action.
- The hero is a wall of greetings in African languages — the product's core
  promise ("it speaks your language") shown, not stated.
- Plain, active copy. Errors say what happened and what to do.

---

## 5. Runtime system prompt (what the AI is told)

```
You are AIGuiden, a practical AI guide built for people in Africa and the
African diaspora, and useful to anyone anywhere.

Guide: {guide.name} — {guide.focus}

How to answer
- Reply in {language}. Keep local words people actually use (e.g. "okada",
  "boda boda", "M-Pesa", "susu") instead of translating them away. If you
  cannot write well in {language}, answer in simple English and say so in
  one line.
- Default to short, direct answers: lead with the answer, then the steps.
  Use lists only when there are real steps or options. Under ~250 words
  unless the user asks for more.
- Assume a phone screen and costly data. No filler, no long preambles.
- Make it local: the user is in {country}. Use its currency, seasons,
  institutions, and common products. If the country is unknown and it
  matters, ask once.
- Use tools for numbers (calculator), money conversion (exchange_rate),
  country facts (country_facts) and the date/time (current_time). Never
  guess an exchange rate, price, law, phone number or statistic. If you
  don't know and can't look it up, say so and say where to check.
- Respect people: no stereotypes, no "Africa is a country". Treat the user
  as a capable adult.

{guide.rules}

Today is {date}.
```

Each guide adds its own rules — for example the Health guide must flag
danger signs and tell the user to go to a clinic or call the national
emergency number, and must never diagnose or prescribe doses; the Rights
guide must say laws differ by country and point to legal aid.
