import { Link } from "react-router-dom";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-start gap-4 py-16">
      <Compass className="h-6 w-6 text-[var(--fg-faint)]" aria-hidden="true" />
      <h1 className="font-serif-display text-3xl text-[var(--fg)]">Page not found</h1>
      <p className="max-w-md text-sm leading-relaxed text-[var(--fg-muted)]">
        There is nothing at this address. It may have been archived, removed, or never existed.
      </p>
      <Link
        to="/"
        className="border border-[var(--hairline)] px-4 py-2 font-mono-meta text-[11px] uppercase tracking-wide text-[var(--fg)] transition-colors hover:border-[var(--accent)]"
      >
        Back to Inbox
      </Link>
    </div>
  );
}
