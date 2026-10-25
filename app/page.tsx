import Link from "next/link";
import { Logo } from "@/components/Logo";
import { HeaderAuth, HeroCta } from "@/components/HeaderAuth";
import { analyticsConfigured } from "@/lib/firebase/config";
import { GUIDES } from "@/lib/guides";
import { GREETINGS, LANGUAGES } from "@/lib/languages";

// Sizes cycle so the greetings wall reads like printed cloth, not a grid.
const SIZES = [
  "text-4xl sm:text-5xl",
  "text-2xl sm:text-3xl",
  "text-3xl sm:text-4xl",
  "text-xl sm:text-2xl",
  "text-[2.6rem] sm:text-6xl",
  "text-2xl sm:text-3xl",
  "text-3xl sm:text-4xl",
  "text-xl sm:text-2xl",
];

export default function Home() {
  return (
    <div className="flex min-h-full flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Logo />
        <HeaderAuth />
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto grid w-full max-w-6xl gap-8 px-4 pt-6 pb-14 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-12 lg:pt-12">
          <div>
            <h1 className="font-display text-[2.6rem] leading-[1.02] font-extrabold tracking-[-0.02em] sm:text-6xl lg:text-[4.4rem]">
              Ask in your own language. Get answers that fit where you live.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-ink-soft">
              Wiseyarn is an AI guide for farming, health, money, school, jobs and your rights. It knows naira from
              cedis, the rainy season from the harmattan, and M-Pesa from a bank transfer.
            </p>
            <HeroCta />
          </div>

          <div className="adire relative overflow-hidden rounded-[28px] p-6 sm:p-8" aria-label="Greetings in African languages">
            <ul className="flex flex-wrap items-baseline gap-x-4 gap-y-2.5 sm:gap-x-5 sm:gap-y-3">
              {GREETINGS.map((g, i) => (
                <li
                  key={g.word + g.lang}
                  className="greet"
                  style={{ animationDelay: `${120 + i * 70}ms` }}
                  title={g.lang}
                >
                  <span
                    className={`font-display font-bold leading-none ${SIZES[i % SIZES.length]} ${
                      i === 4 ? "text-[var(--gold)]" : ""
                    }`}
                    lang="und"
                  >
                    {g.word}
                  </span>
                  <span className="ml-1.5 align-top text-xs opacity-70">{g.lang}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Guides */}
        <section className="border-t border-line bg-surface">
          <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
            <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Pick a guide</h2>
            <p className="mt-2 max-w-xl text-ink-soft">
              Each guide is tuned for one part of life and knows when to send you to a clinic, a lawyer or the
              extension officer.
            </p>

            <ul className="mt-8 divide-y divide-line border-y border-line">
              {GUIDES.map((g) => (
                <li key={g.id}>
                  <Link
                    href={`/chat?guide=${g.id}`}
                    className="group grid grid-cols-[2.5rem_1fr] items-start gap-x-4 gap-y-1 py-5 sm:grid-cols-[3rem_12rem_1fr_auto] sm:items-center"
                  >
                    <span
                      aria-hidden="true"
                      className="grid h-10 w-10 place-items-center rounded-full text-xl sm:h-12 sm:w-12"
                      style={{ background: g.hue, color: "var(--paper)" }}
                    >
                      {g.glyph}
                    </span>
                    <span className="font-display text-xl font-bold">{g.name}</span>
                    <span className="col-start-2 text-ink-soft sm:col-start-auto">{g.short}</span>
                    <span className="col-start-2 text-sm text-ink-soft italic group-hover:text-ink sm:col-start-auto sm:max-w-[16rem] sm:text-right">
                      “{g.starters[0]}”
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Principles */}
        <section className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-14 sm:px-6 md:grid-cols-3">
          <div>
            <h3 className="font-display text-xl font-bold">Your language, your terms</h3>
            <p className="mt-2 text-ink-soft">
              Answers in {LANGUAGES.length} languages including {LANGUAGES.slice(1, 7).map((l) => l.native).join(", ")}{" "}
              and more. Local words stay local.
            </p>
          </div>
          <div>
            <h3 className="font-display text-xl font-bold">Numbers it works out, not guesses</h3>
            <p className="mt-2 text-ink-soft">
              Prices, margins and loan repayments go through a calculator. Currency uses today’s rate. Country facts
              come from a checked list.
            </p>
          </div>
          <div>
            <h3 className="font-display text-xl font-bold">Made for slow connections</h3>
            <p className="mt-2 text-ink-soft">
              Answers stream in as they’re written, there are no heavy images, and your chats stay on your phone.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-sm text-ink-soft sm:px-6">
          <span>Wiseyarn — for Africa and beyond.</span>
          <span>AI can make mistakes. For health, legal and money decisions, check with a professional.</span>
          {analyticsConfigured && (
            <span className="w-full">
              We use Google Analytics to learn which guides help most. It never records what you type or the answers
              you get.
            </span>
          )}
        </div>
      </footer>
    </div>
  );
}
