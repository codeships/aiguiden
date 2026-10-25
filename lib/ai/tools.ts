import "server-only";
import { tool } from "langchain";
import type { StructuredToolInterface } from "@langchain/core/tools";
import { z } from "zod";
import { COUNTRIES, findCountry } from "@/lib/countries";

/* ---------------- calculator ---------------- */

// A small, safe arithmetic parser (no eval). Supports + - * / ^ %, parentheses,
// unary minus and a few functions.
const FUNCS: Record<string, (x: number) => number> = {
  sqrt: Math.sqrt,
  abs: Math.abs,
  round: Math.round,
  floor: Math.floor,
  ceil: Math.ceil,
  ln: Math.log,
  log: Math.log10,
};

export function evaluate(expr: string): number {
  const src = expr.replace(/,/g, "").replace(/\s+/g, "").replace(/×/g, "*").replace(/÷/g, "/");
  let i = 0;
  const peek = () => src[i];
  const eat = (c: string) => {
    if (src[i] === c) {
      i++;
      return true;
    }
    return false;
  };

  function primary(): number {
    if (eat("(")) {
      const v = additive();
      if (!eat(")")) throw new Error("Missing closing bracket");
      return v;
    }
    const fn = /^[a-z]+/.exec(src.slice(i));
    if (fn) {
      const name = fn[0];
      if (!(name in FUNCS)) throw new Error(`Unknown function: ${name}`);
      i += name.length;
      if (!eat("(")) throw new Error(`Expected ( after ${name}`);
      const v = additive();
      if (!eat(")")) throw new Error("Missing closing bracket");
      return FUNCS[name](v);
    }
    const num = /^\d*\.?\d+(e[+-]?\d+)?/i.exec(src.slice(i));
    if (!num) throw new Error(`Unexpected character at position ${i + 1}`);
    i += num[0].length;
    let v = Number(num[0]);
    if (eat("%")) v = v / 100; // 15% -> 0.15
    return v;
  }
  function unary(): number {
    if (eat("-")) return -unary();
    if (eat("+")) return unary();
    return power();
  }
  function power(): number {
    const base = primary();
    if (eat("^")) return Math.pow(base, unary());
    return base;
  }
  function multiplicative(): number {
    let v = unary();
    for (;;) {
      if (eat("*")) v *= unary();
      else if (eat("/")) {
        const d = unary();
        if (d === 0) throw new Error("Division by zero");
        v /= d;
      } else return v;
    }
  }
  function additive(): number {
    let v = multiplicative();
    for (;;) {
      if (eat("+")) v += multiplicative();
      else if (eat("-")) v -= multiplicative();
      else return v;
    }
  }

  const result = additive();
  if (i < src.length) throw new Error(`Unexpected "${peek()}" at position ${i + 1}`);
  if (!Number.isFinite(result)) throw new Error("Result is not a finite number");
  return result;
}

export const calculator = tool(
  async ({ expression }) => {
    try {
      const value = evaluate(expression);
      const pretty = Number.isInteger(value) ? value.toLocaleString("en") : value.toLocaleString("en", { maximumFractionDigits: 6 });
      return `${expression} = ${pretty}`;
    } catch (e) {
      return `Could not calculate "${expression}": ${(e as Error).message}`;
    }
  },
  {
    name: "calculator",
    description:
      "Evaluate an arithmetic expression exactly. Use for prices, margins, profit, interest, loan repayments, unit conversions and any maths. Supports + - * / ^, %, brackets, sqrt(), round(), abs(), floor(), ceil(), ln(), log(). Example: (78000/40)*1.2",
    schema: z.object({ expression: z.string().describe("The arithmetic expression, e.g. 2500*12*(1+0.15)") }),
  },
);

/* ---------------- exchange rate ---------------- */

type RateCache = { base: string; at: number; data: { rates: Record<string, number>; time_last_update_utc?: string } };
const rateCache = new Map<string, RateCache>();

export const exchangeRate = tool(
  async ({ from, to, amount }) => {
    const base = from.toUpperCase().trim();
    const target = to.toUpperCase().trim();
    try {
      let cached = rateCache.get(base);
      if (!cached || Date.now() - cached.at > 60 * 60 * 1000) {
        const res = await fetch(`https://open.er-api.com/v6/latest/${encodeURIComponent(base)}`, {
          signal: AbortSignal.timeout(8000),
        });
        if (!res.ok) throw new Error(`rate service returned ${res.status}`);
        const data = await res.json();
        if (data.result !== "success") throw new Error(data["error-type"] ?? "unknown currency");
        cached = { base, at: Date.now(), data };
        rateCache.set(base, cached);
      }
      const rate = cached.data.rates[target];
      if (!rate) return `No rate found for ${target}. Check the 3-letter currency code.`;
      const amt = amount ?? 1;
      return JSON.stringify({
        from: base,
        to: target,
        rate,
        amount: amt,
        converted: Math.round(amt * rate * 100) / 100,
        updated: cached.data.time_last_update_utc,
        source: "open.er-api.com (mid-market reference rate; bank, bureau and mobile-money rates differ)",
      });
    } catch (e) {
      return `Live exchange rates are unavailable right now (${(e as Error).message}). Tell the user to check their bank, mobile-money app or a bureau de change.`;
    }
  },
  {
    name: "exchange_rate",
    description:
      "Get today's reference exchange rate between two currencies and optionally convert an amount. Use ISO codes: NGN, KES, GHS, ZAR, EGP, XOF, XAF, ETB, UGX, TZS, USD, EUR, GBP, CNY and so on.",
    schema: z.object({
      from: z.string().describe("Currency code to convert from, e.g. USD"),
      to: z.string().describe("Currency code to convert to, e.g. NGN"),
      amount: z.number().optional().describe("Amount to convert (default 1)"),
    }),
  },
);

/* ---------------- country facts ---------------- */

export const countryFacts = tool(
  async ({ country }) => {
    if (country.toLowerCase() === "all") {
      return COUNTRIES.map((c) => `${c.name} (${c.code}) — ${c.capital}, ${c.currency}`).join("\n");
    }
    const c = findCountry(country);
    if (!c) return `No entry for "${country}". This tool covers the 54 African countries. Use your own knowledge carefully for others.`;
    return JSON.stringify(c);
  },
  {
    name: "country_facts",
    description:
      "Reference facts for an African country: capital, currency (code and name), main languages, dialling code, time zone and region. Pass a name or ISO code, or 'all' for a list.",
    schema: z.object({ country: z.string().describe("Country name or ISO code, e.g. 'Ghana' or 'GH'") }),
  },
);

/* ---------------- current time ---------------- */

export const currentTime = tool(
  async ({ place }) => {
    const c = place ? findCountry(place) : undefined;
    const tz = c?.tz ?? (place && place.includes("/") ? place : "UTC");
    try {
      const now = new Date();
      const text = new Intl.DateTimeFormat("en-GB", {
        timeZone: tz,
        dateStyle: "full",
        timeStyle: "short",
      }).format(now);
      return `${text} (${tz}${c ? `, ${c.name}` : ""})`;
    } catch {
      return `Unknown place or time zone "${place}". Current UTC time: ${new Date().toUTCString()}`;
    }
  },
  {
    name: "current_time",
    description: "Get the current date and time for a country name, ISO code or IANA time zone (e.g. 'Kenya', 'NG', 'Europe/London').",
    schema: z.object({ place: z.string().optional().describe("Country or IANA time zone. Leave empty for UTC.") }),
  },
);

/* ---------------- web search (optional) ---------------- */

export const webSearch = tool(
  async ({ query }) => {
    try {
      const res = await fetch("https://api.tavily.com/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.TAVILY_API_KEY}`,
        },
        body: JSON.stringify({ query, max_results: 5, search_depth: "basic" }),
        signal: AbortSignal.timeout(12000),
      });
      if (!res.ok) throw new Error(`search returned ${res.status}`);
      const data = (await res.json()) as { results: { title: string; url: string; content: string }[] };
      if (!data.results?.length) return "No results.";
      return data.results
        .map((r, n) => `[${n + 1}] ${r.title}\n${r.url}\n${r.content.slice(0, 500)}`)
        .join("\n\n");
    } catch (e) {
      return `Search is unavailable right now (${(e as Error).message}).`;
    }
  },
  {
    name: "web_search",
    description:
      "Search the web for current information: news, prices, schedules, new laws, exam dates. Cite the sources you use as markdown links.",
    schema: z.object({ query: z.string().describe("A focused search query") }),
  },
);

export function getTools(): StructuredToolInterface[] {
  const tools: StructuredToolInterface[] = [calculator, exchangeRate, countryFacts, currentTime];
  if (process.env.TAVILY_API_KEY) tools.push(webSearch);
  return tools;
}
