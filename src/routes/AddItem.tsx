import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Link2, Loader2 } from "lucide-react";
import { enrichUrl } from "../data/enrich";
import { createItem } from "../data/items";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { extractHostname, formatReadingTime } from "../utils/format";
import type { EnrichedMetadata } from "../types";

export default function AddItem() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<"idle" | "fetching" | "previewing" | "error" | "saving">("idle");
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<EnrichedMetadata | null>(null);

  async function handleFetchPreview(event: FormEvent) {
    event.preventDefault();
    if (!url.trim()) return;
    setStatus("fetching");
    setError(null);
    setPreview(null);
    try {
      const metadata = await enrichUrl(url.trim());
      setPreview(metadata);
      setStatus("previewing");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Could not fetch this page.");
    }
  }

  async function handleSave() {
    if (!preview || !user) return;
    setStatus("saving");
    try {
      const item = await createItem(user.id, {
        url: preview.url,
        title: preview.title,
        excerpt: preview.excerpt,
        author: preview.author,
        siteName: preview.siteName,
        coverImageUrl: preview.coverImageUrl,
        faviconUrl: preview.faviconUrl,
        readingTimeMin: preview.readingTimeMin,
      });
      showToast("Saved to your queue", { variant: "success" });
      navigate(`/items/${item.id}`);
    } catch (err) {
      setStatus("previewing");
      showToast("Couldn't save this item", {
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "error",
      });
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="font-serif-display text-3xl text-[var(--fg)]">Add to your queue</h1>
      <p className="mt-2 text-sm leading-relaxed text-[var(--fg-muted)]">
        Paste a link. Folio fetches the page, reads its metadata, and gives you a preview before saving.
      </p>

      <form onSubmit={handleFetchPreview} className="mt-6 flex flex-col gap-3 sm:flex-row">
        <div className="flex flex-1 items-center gap-2 border border-[var(--hairline)] px-3 py-2">
          <Link2 className="h-4 w-4 shrink-0 text-[var(--fg-faint)]" aria-hidden="true" />
          <input
            type="url"
            required
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://example.com/an-article"
            className="w-full bg-transparent text-sm text-[var(--fg)] placeholder:text-[var(--fg-faint)] focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={status === "fetching" || url.trim().length === 0}
          className="flex shrink-0 items-center justify-center gap-2 bg-[var(--fg)] px-4 py-2.5 text-sm font-medium text-[var(--bg)] transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {status === "fetching" ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          )}
          Preview
        </button>
      </form>

      {status === "error" && error && (
        <p role="alert" className="mt-4 text-sm text-[var(--accent)]">
          {error}
        </p>
      )}

      {status === "fetching" && (
        <div className="animate-fade-in mt-8 flex gap-4 border border-[var(--hairline)] p-5">
          <div className="flex-1 space-y-3">
            <div className="h-3 w-40 rounded-sm bg-[var(--bg-raised)]" />
            <div className="h-6 w-3/4 rounded-sm bg-[var(--bg-raised)]" />
            <div className="h-4 w-full rounded-sm bg-[var(--bg-raised)]" />
          </div>
          <div className="hidden h-24 w-32 shrink-0 rounded-sm bg-[var(--bg-raised)] sm:block" />
        </div>
      )}

      {preview && (status === "previewing" || status === "saving") && (
        <div className="animate-rise mt-8 border border-[var(--hairline)] p-5">
          <div className="flex gap-5">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 font-mono-meta text-[11px] uppercase tracking-wide text-[var(--fg-faint)]">
                <span>{preview.siteName ?? extractHostname(preview.url)}</span>
                <span aria-hidden="true">·</span>
                <span>{formatReadingTime(preview.readingTimeMin)}</span>
              </div>
              <h2 className="mt-1.5 font-serif-display text-2xl leading-snug text-[var(--fg)]">
                {preview.title ?? preview.url}
              </h2>
              {preview.excerpt && (
                <p className="mt-2 text-sm leading-relaxed text-[var(--fg-muted)]">{preview.excerpt}</p>
              )}
              {preview.author && (
                <p className="mt-2 font-mono-meta text-xs text-[var(--fg-faint)]">By {preview.author}</p>
              )}
            </div>
            {preview.coverImageUrl && (
              <img
                src={preview.coverImageUrl}
                alt=""
                width={128}
                height={96}
                loading="lazy"
                className="hidden h-24 w-32 shrink-0 object-cover sm:block"
              />
            )}
          </div>

          <div className="mt-5 flex items-center gap-3 border-t border-[var(--hairline)] pt-4">
            <button
              type="button"
              onClick={handleSave}
              disabled={status === "saving"}
              className="bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--accent-ink)] transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {status === "saving" ? "Saving…" : "Save to queue"}
            </button>
            <button
              type="button"
              onClick={() => {
                setPreview(null);
                setStatus("idle");
                setUrl("");
              }}
              className="text-sm text-[var(--fg-muted)] hover:text-[var(--fg)]"
            >
              Discard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
