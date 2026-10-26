import { SOCIAL_HANDLE, SOCIALS } from "@/lib/social";

/** Row of social icons linking to @wiseyarnai on each platform. */
export function SocialLinks({ className = "" }: { className?: string }) {
  return (
    <nav aria-label="Wiseyarn on social media" className={`flex flex-wrap items-center gap-2 ${className}`}>
      <span className="mr-1 font-semibold text-ink">@{SOCIAL_HANDLE}</span>
      <ul className="flex flex-wrap items-center gap-1.5">
        {SOCIALS.map((s) => (
          <li key={s.id}>
            <a
              href={s.url}
              target="_blank"
              rel="noopener noreferrer me"
              aria-label={`Wiseyarn on ${s.name}`}
              title={`@${SOCIAL_HANDLE} on ${s.name}`}
              className="grid h-10 w-10 place-items-center rounded-full border border-line text-ink-soft transition-colors hover:border-ink hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
                <path d={s.icon} />
              </svg>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
