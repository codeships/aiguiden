import Link from "next/link";

/** Wordmark: a compass-like adire circle and the name. */
export function Logo({ href = "/", compact = false }: { href?: string; compact?: boolean }) {
  return (
    <Link href={href} aria-label="AIGuiden home" className="inline-flex items-center gap-2 font-display text-xl font-extrabold tracking-tight">
      <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden="true">
        <circle cx="16" cy="16" r="15" fill="var(--indigo)" />
        <circle cx="16" cy="16" r="9" fill="none" stroke="var(--paper)" strokeWidth="2" strokeDasharray="2.5 3" />
        <path d="M16 6 L19 16 L16 26 L13 16 Z" fill="var(--gold)" />
      </svg>
      <span className={compact ? "hidden sm:inline" : ""}>
        AI<span className="font-semibold">Guiden</span>
      </span>
    </Link>
  );
}
