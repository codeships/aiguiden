import Link from "next/link";

/** Wordmark: a compass-like adire circle and the name. */
export function Logo({
  href = "/",
  compact = false,
  tone = "default",
}: {
  href?: string;
  compact?: boolean;
  tone?: "default" | "light"; // "light" for use on the indigo adire panel
}) {
  const disc = tone === "light" ? "#f3f5fb" : "var(--indigo)";
  const ring = tone === "light" ? "#1e2a78" : "var(--paper)";
  return (
    <Link href={href} aria-label="Wiseyarn home" className={`inline-flex items-center gap-2 font-display text-xl font-extrabold tracking-tight ${tone === "light" ? "text-[#f3f5fb]" : ""}`}
    >
      <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden="true">
        <circle cx="16" cy="16" r="15" fill={disc} />
        <circle cx="16" cy="16" r="9" fill="none" stroke={ring} strokeWidth="2" strokeDasharray="2.5 3" />
        <path d="M16 6 L19 16 L16 26 L13 16 Z" fill="var(--gold)" />
      </svg>
      <span className={compact ? "hidden sm:inline" : ""}>
        Wise<span className="font-semibold">yarn</span>
      </span>
    </Link>
  );
}
