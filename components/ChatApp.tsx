"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Logo } from "@/components/Logo";
import { GUIDES, getGuide, type GuideId } from "@/lib/guides";
import { LANGUAGES, getLanguage } from "@/lib/languages";
import { COUNTRIES } from "@/lib/countries";
import { useAuth } from "@/components/AuthProvider";
import { AuthButton } from "@/components/AuthButton";
import Link from "next/link";
import { signInHref } from "@/lib/safe-next";
import { track } from "@/lib/analytics";

type Role = "user" | "assistant";
interface Msg {
  role: Role;
  content: string;
  error?: boolean;
}
interface Prefs {
  language: string;
  country: string;
  lite: boolean;
}
interface Status {
  ready: boolean;
  fallback: boolean;
  provider: string | null;
  model: string | null;
  search: boolean;
  tracing: boolean;
  requireSignIn: boolean;
}

// Storage keys keep the old "aiguiden" prefix so chats saved before the rename aren't lost.
const PREFS_KEY = "aiguiden:v1:prefs";
const chatKey = (g: string) => `aiguiden:v1:chat:${g}`;

const TOOL_LABELS: Record<string, string> = {
  calculator: "Working out the numbers",
  exchange_rate: "Checking today’s exchange rate",
  country_facts: "Looking up country facts",
  current_time: "Checking the date and time",
  web_search: "Searching the web",
};

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function save(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full or blocked — chat still works */
  }
}

export function ChatApp() {
  const router = useRouter();
  const params = useSearchParams();
  const guide = getGuide(params.get("guide"));
  const auth = useAuth();

  const [prefs, setPrefs] = useState<Prefs>({ language: "en", country: "", lite: false });
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [toolNote, setToolNote] = useState<string | null>(null);
  const [status, setStatus] = useState<Status | null>(null);
  const [loaded, setLoaded] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load saved prefs and this guide's chat from the browser.
  useEffect(() => {
    abortRef.current?.abort();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reading browser storage after mount
    setPrefs((p) => ({ ...p, ...load<Partial<Prefs>>(PREFS_KEY, {}) }));
    setMessages(load<Msg[]>(chatKey(guide.id), []));
    setLoaded(true);
  }, [guide.id]);

  useEffect(() => {
    fetch("/api/status")
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => setStatus(null));
  }, []);

  useEffect(() => {
    if (loaded) save(PREFS_KEY, prefs);
  }, [prefs, loaded]);

  useEffect(() => {
    if (loaded && !busy) save(chatKey(guide.id), messages.slice(-60));
  }, [messages, busy, guide.id, loaded]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: prefs.lite ? "auto" : "smooth", block: "end" });
  }, [messages, toolNote, prefs.lite]);

  // When the server requires sign-in, signed-out people see a sign-in prompt instead of the composer.
  const mustSignIn = Boolean(status?.requireSignIn && auth.configured && !auth.user && !auth.loading);

  // Sign-in required and nobody signed in: go to the sign-in page, then come back to this guide.
  useEffect(() => {
    if (mustSignIn) router.replace(signInHref(`/chat?guide=${guide.id}`));
  }, [mustSignIn, guide.id, router]);

  const send = useCallback(
    async (text: string, base?: Msg[], starter = false) => {
      const content = text.trim();
      if (!content || busy) return;
      if (mustSignIn) {
        router.push(signInHref(`/chat?guide=${guide.id}`));
        return;
      }
      const history: Msg[] = [...(base ?? messages).filter((m) => !m.error), { role: "user", content }];
      setMessages([...history, { role: "assistant", content: "" }]);
      setInput("");
      setBusy(true);
      setToolNote(null);

      const ctrl = new AbortController();
      abortRef.current = ctrl;
      let answer = "";
      let toolsUsed = 0;
      const started = performance.now();
      track("ask_question", {
        guide: guide.id,
        language: prefs.language,
        country: prefs.country || "unset",
        signed_in: Boolean(auth.user),
        starter,
      });

      const update = (patch: Partial<Msg>) =>
        setMessages((prev) => {
          const next = prev.slice();
          next[next.length - 1] = { ...next[next.length - 1], ...patch };
          return next;
        });

      try {
        const idToken = await auth.getIdToken();
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
          },
          body: JSON.stringify({
            messages: history.map(({ role, content }) => ({ role, content })),
            guide: guide.id,
            language: prefs.language,
            country: prefs.country || undefined,
          }),
          signal: ctrl.signal,
        });
        if (!res.ok || !res.body) {
          const err = await res
            .json()
            .catch(() => ({ error: "The server didn’t answer. Check your connection and try again." }));
          throw Object.assign(new Error(err.error), { code: err.code ?? `http_${res.status}` });
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buf = "";
        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          const lines = buf.split("\n");
          buf = lines.pop() ?? "";
          for (const line of lines) {
            if (!line.trim()) continue;
            const ev = JSON.parse(line) as { type: string; text?: string; name?: string; message?: string };
            if (ev.type === "token" && ev.text) {
              answer += ev.text;
              setToolNote(null);
              update({ content: answer });
            } else if (ev.type === "tool" && ev.name) {
              toolsUsed++;
              setToolNote(TOOL_LABELS[ev.name] ?? `Using ${ev.name}`);
            } else if (ev.type === "error") {
              throw Object.assign(new Error(ev.message), { code: "model_error" });
            }
          }
        }
        if (!answer) {
          update({ content: "No answer came back. Try asking again.", error: true });
          track("answer_error", { guide: guide.id, reason: "empty" });
        } else {
          track("answer_received", {
            guide: guide.id,
            language: prefs.language,
            duration_ms: Math.round(performance.now() - started),
            tools_used: toolsUsed,
            chars: answer.length,
          });
        }
      } catch (e) {
        if (ctrl.signal.aborted) {
          track("answer_stopped", { guide: guide.id });
          if (!answer) update({ content: "Stopped.", error: true });
        } else {
          track("answer_error", { guide: guide.id, reason: (e as { code?: string }).code ?? "network" });
          const msg = (e as Error).message || "Couldn’t reach Wiseyarn. Check your connection and try again.";
          update({ content: answer ? `${answer}\n\n_${msg}_` : msg, error: true });
        }
      } finally {
        setBusy(false);
        setToolNote(null);
        abortRef.current = null;
        inputRef.current?.focus();
      }
    },
    [busy, messages, guide.id, prefs.language, prefs.country, mustSignIn, auth, router],
  );

  const retry = () => {
    const lastUser = [...messages].reverse().findIndex((m) => m.role === "user");
    if (lastUser < 0) return;
    const idx = messages.length - 1 - lastUser;
    send(messages[idx].content, messages.slice(0, idx));
  };

  const switchGuide = (id: GuideId) => {
    if (busy) abortRef.current?.abort();
    track("select_guide", { guide: id });
    router.replace(`/chat?guide=${id}`, { scroll: false });
  };

  const clearChat = () => {
    abortRef.current?.abort();
    track("clear_chat", { guide: guide.id });
    setMessages([]);
    save(chatKey(guide.id), []);
  };

  const lang = getLanguage(prefs.language);
  const lastIsError = messages.at(-1)?.error;

  return (
    <div className={`flex h-dvh flex-col ${prefs.lite ? "lite" : ""}`}>
      {/* Top bar */}
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-3 sm:px-6">
          <Logo compact />
          <div className="ml-auto flex min-w-0 items-center gap-2">
            <label className="sr-only" htmlFor="lang">
              Answer language
            </label>
            <select
              id="lang"
              className="btn-quiet max-w-[6.5rem] min-w-0 px-2.5 text-sm sm:max-w-none sm:px-3.5"
              value={prefs.language}
              onChange={(e) => {
                setPrefs({ ...prefs, language: e.target.value });
                track("change_language", { language: e.target.value });
              }}
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.native}
                </option>
              ))}
            </select>
            <label className="sr-only" htmlFor="country">
              Your country
            </label>
            <select
              id="country"
              className="btn-quiet max-w-[6.5rem] min-w-0 px-2.5 text-sm sm:max-w-[12rem] sm:px-3.5"
              value={prefs.country}
              onChange={(e) => {
                setPrefs({ ...prefs, country: e.target.value });
                track("change_country", { country: e.target.value || "unset" });
              }}
            >
              <option value="">Country…</option>
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
              <option value="Elsewhere">Outside Africa</option>
            </select>
            <AuthButton />
          </div>
        </div>

        {/* Guide switcher: scrolls sideways on phones */}
        <nav aria-label="Guides" className="mx-auto w-full max-w-6xl px-4 pb-3 sm:px-6">
          <ul className="no-scrollbar flex gap-2 overflow-x-auto">
            {GUIDES.map((g) => {
              const active = g.id === guide.id;
              return (
                <li key={g.id} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => switchGuide(g.id)}
                    aria-current={active ? "page" : undefined}
                    className="inline-flex min-h-10 items-center gap-2 rounded-full border px-3.5 text-[0.95rem] font-semibold"
                    style={
                      active
                        ? { background: g.hue, borderColor: g.hue, color: "var(--paper)" }
                        : { borderColor: "var(--line)", color: "var(--ink)" }
                    }
                  >
                    <span aria-hidden="true">{g.glyph}</span>
                    {g.name}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </header>

      {status && !status.ready && (
        <div className="border-b border-line bg-[color-mix(in_srgb,var(--gold)_22%,var(--surface))] px-4 py-2 text-center text-sm">
          No AI model is set up. Add a key to <code>.env.local</code> and restart the server.
        </div>
      )}

      {/* Thread */}
      <main className="flex-1 overflow-y-auto" aria-live="polite">
        <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
          {messages.length === 0 ? (
            <EmptyState guide={guide} onPick={(q) => send(q, undefined, true)} languageName={lang.native} />
          ) : (
            <ol className="space-y-5">
              {messages.map((m, i) => (
                <li key={i} className={m.role === "user" ? "flex justify-end" : ""}>
                  {m.role === "user" ? (
                    <div
                      className="max-w-[85%] rounded-[20px] rounded-br-md px-4 py-2.5 whitespace-pre-wrap"
                      style={{ background: "var(--indigo)", color: "var(--paper)" }}
                      dir="auto"
                    >
                      {m.content}
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      <span
                        aria-hidden="true"
                        className="mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-full text-sm"
                        style={{ background: guide.hue, color: "var(--paper)" }}
                      >
                        {guide.glyph}
                      </span>
                      <div className="min-w-0 flex-1">
                        {m.content ? (
                          <div
                            className={`prose-guide ${m.error ? "text-[var(--g-health)]" : ""}`}
                            dir={lang.dir ?? "auto"}
                          >
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={{
                                a: (props) => <a {...props} target="_blank" rel="noopener noreferrer" />,
                              }}
                            >
                              {m.content}
                            </ReactMarkdown>
                          </div>
                        ) : (
                          <p className="typing text-ink-soft" aria-label="Writing">
                            {toolNote ? `${toolNote}…` : (
                              <>
                                <span>●</span> <span>●</span> <span>●</span>
                              </>
                            )}
                          </p>
                        )}
                        {m.content && busy && i === messages.length - 1 && toolNote && (
                          <p className="mt-2 text-sm text-ink-soft">{toolNote}…</p>
                        )}
                        {m.content && !(busy && i === messages.length - 1) && !m.error && (
                          <CopyButton text={m.content} onCopy={() => track("copy_answer", { guide: guide.id })} />
                        )}
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ol>
          )}
          <div ref={endRef} />
        </div>
      </main>

      {/* Composer */}
      <footer className="border-t border-line bg-surface">
        {mustSignIn ? (
          <div className="mx-auto flex w-full max-w-3xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
            <p className="text-ink-soft">Sign in to ask Wiseyarn. It’s free.</p>
            <Link href={signInHref(`/chat?guide=${guide.id}`)} className="btn-gold">
              Sign in
            </Link>
          </div>
        ) : (
        <form
          className="mx-auto flex w-full max-w-3xl items-end gap-2 px-4 py-3 sm:px-6"
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
        >
          <label htmlFor="ask" className="sr-only">
            Your question
          </label>
          <textarea
            id="ask"
            ref={inputRef}
            rows={1}
            value={input}
            dir="auto"
            maxLength={4000}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                send(input);
              }
            }}
            placeholder="Type your question…"
            className="max-h-40 min-h-12 flex-1 resize-none rounded-[22px] border border-line bg-paper px-4 py-3 outline-none focus:border-[var(--indigo-2)]"
          />
          {busy ? (
            <button type="button" className="btn-quiet min-h-12" onClick={() => abortRef.current?.abort()}>
              Stop
            </button>
          ) : (
            <button type="submit" className="btn-gold" disabled={!input.trim()}>
              Send
            </button>
          )}
        </form>
        )}
        <div className="mx-auto flex w-full max-w-3xl flex-wrap items-center gap-x-4 gap-y-1 px-4 pb-3 text-xs text-ink-soft sm:px-6">
          {messages.length > 0 && !busy && (
            <>
              {lastIsError && (
                <button type="button" className="underline" onClick={retry}>
                  Try again
                </button>
              )}
              <button type="button" className="underline" onClick={clearChat}>
                Clear this chat
              </button>
            </>
          )}
          <button
            type="button"
            className="underline"
            aria-pressed={prefs.lite}
            onClick={() => {
              setPrefs({ ...prefs, lite: !prefs.lite });
              track("toggle_lite_mode", { on: !prefs.lite });
            }}
            title="Turns off motion to save battery"
          >
            {prefs.lite ? "Lite mode: on" : "Lite mode: off"}
          </button>
          <span className="ml-auto">
            {status?.ready ? `Model: ${status.model}` : null}
            {status?.fallback ? ", free model as backup" : null}
            {status?.search ? ", with web search" : null}
          </span>
        </div>
      </footer>
    </div>
  );
}

function EmptyState({
  guide,
  onPick,
  languageName,
}: {
  guide: ReturnType<typeof getGuide>;
  onPick: (q: string) => void;
  languageName: string;
}) {
  return (
    <div className="pt-6 sm:pt-12">
      <span
        aria-hidden="true"
        className="grid h-14 w-14 place-items-center rounded-full text-2xl"
        style={{ background: guide.hue, color: "var(--paper)" }}
      >
        {guide.glyph}
      </span>
      <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight">{guide.name}</h1>
      <p className="mt-2 max-w-lg text-ink-soft">
        {guide.short} Answers come in {languageName} — change it at the top.
      </p>
      <p className="mt-8 text-sm font-semibold">Try one of these</p>
      <ul className="mt-3 space-y-2">
        {guide.starters.map((q) => (
          <li key={q}>
            <button
              type="button"
              onClick={() => onPick(q)}
              className="w-full rounded-2xl border border-line bg-surface px-4 py-3 text-left hover:border-[var(--indigo-2)]"
            >
              {q}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CopyButton({ text, onCopy }: { text: string; onCopy?: () => void }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className="mt-2 text-xs text-ink-soft underline"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          onCopy?.();
          setDone(true);
          setTimeout(() => setDone(false), 1500);
        } catch {
          /* clipboard blocked */
        }
      }}
    >
      {done ? "Copied" : "Copy"}
    </button>
  );
}
