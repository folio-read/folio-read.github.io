import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ExternalLink, Highlighter, Tag as TagIcon, Trash2 } from "lucide-react";
import { getItem, setItemTags, updateItemStatus, deleteItem } from "../data/items";
import { useTags } from "../hooks/useTags";
import { useHighlights } from "../hooks/useHighlights";
import { useToast } from "../context/ToastContext";
import { TagChip } from "../components/TagChip";
import { StatusPill } from "../components/StatusPill";
import { TagEditorDialog } from "../components/TagEditorDialog";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { TextSkeleton } from "../components/Skeletons";
import { EmptyState } from "../components/EmptyState";
import { extractHostname, formatReadingTime, formatRelativeDate } from "../utils/format";
import type { Item, ItemStatus } from "../types";

const STATUS_FLOW: ItemStatus[] = ["inbox", "reading", "archived"];

export default function ItemDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tagDialogOpen, setTagDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [highlightText, setHighlightText] = useState("");
  const [highlightNote, setHighlightNote] = useState("");

  const { tags: allTags, createTag } = useTags();
  const { highlights, loading: highlightsLoading, addHighlight, removeHighlight } = useHighlights(id ?? "");

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const result = await getItem(id);
      setItem(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load this item");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleStatusChange(status: ItemStatus) {
    if (!item) return;
    const previous = item;
    setItem({ ...item, status });
    try {
      await updateItemStatus(item.id, status);
    } catch (err) {
      setItem(previous);
      showToast("Couldn't update status", {
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "error",
      });
    }
  }

  async function handleToggleTag(tagId: string) {
    if (!item) return;
    const hasTag = item.tags.some((tag) => tag.id === tagId);
    const nextTagIds = hasTag
      ? item.tags.filter((tag) => tag.id !== tagId).map((tag) => tag.id)
      : [...item.tags.map((tag) => tag.id), tagId];

    const previous = item;
    const nextTag = allTags.find((tag) => tag.id === tagId);
    setItem({
      ...item,
      tags: hasTag
        ? item.tags.filter((tag) => tag.id !== tagId)
        : nextTag
        ? [...item.tags, nextTag]
        : item.tags,
    });

    try {
      await setItemTags(item.id, nextTagIds);
    } catch (err) {
      setItem(previous);
      showToast("Couldn't update tags", {
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "error",
      });
    }
  }

  async function handleDelete() {
    if (!item) return;
    try {
      await deleteItem(item.id);
      showToast("Item removed", { variant: "success" });
      navigate("/");
    } catch (err) {
      showToast("Couldn't remove item", {
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "error",
      });
    }
  }

  async function handleAddHighlight(event: FormEvent) {
    event.preventDefault();
    if (!highlightText.trim()) return;
    await addHighlight(highlightText.trim(), highlightNote.trim() || null);
    setHighlightText("");
    setHighlightNote("");
  }

  if (loading) {
    return (
      <div className="max-w-2xl space-y-4">
        <TextSkeleton className="h-3 w-32" />
        <TextSkeleton className="h-9 w-full" />
        <TextSkeleton className="h-4 w-2/3" />
      </div>
    );
  }

  if (error || !item) {
    return (
      <EmptyState
        icon={Highlighter}
        title="Couldn't load this item"
        description={error ?? "This item may have been removed."}
        action={
          <Link
            to="/"
            className="border border-[var(--hairline)] px-4 py-2 font-mono-meta text-[11px] uppercase tracking-wide text-[var(--fg)] transition-colors hover:border-[var(--accent)]"
          >
            Back to Inbox
          </Link>
        }
      />
    );
  }

  return (
    <div className="max-w-2xl">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 font-mono-meta text-[11px] uppercase tracking-wide text-[var(--fg-faint)] hover:text-[var(--fg)]"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
        Inbox
      </Link>

      <div className="mt-4 flex items-center gap-2 font-mono-meta text-[11px] uppercase tracking-wide text-[var(--fg-faint)]">
        <span>{item.siteName ?? extractHostname(item.url)}</span>
        <span aria-hidden="true">·</span>
        <span>{formatReadingTime(item.readingTimeMin)}</span>
        <span aria-hidden="true">·</span>
        <span>{formatRelativeDate(item.createdAt)}</span>
      </div>

      <h1 className="mt-2 font-serif-display text-3xl leading-tight text-[var(--fg)]">{item.title ?? item.url}</h1>

      {item.author && <p className="mt-2 text-sm text-[var(--fg-muted)]">By {item.author}</p>}
      {item.excerpt && <p className="mt-4 text-base leading-relaxed text-[var(--fg-muted)]">{item.excerpt}</p>}

      {item.coverImageUrl && (
        <img
          src={item.coverImageUrl}
          alt=""
          width={640}
          height={280}
          loading="lazy"
          className="mt-6 h-56 w-full object-cover"
        />
      )}

      <div className="mt-6 flex flex-wrap items-center gap-3 border-y border-[var(--hairline)] py-4">
        <a
          href={item.url}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex items-center gap-1.5 border border-[var(--hairline)] px-3 py-1.5 text-sm text-[var(--fg)] transition-colors hover:border-[var(--fg-faint)]"
        >
          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          Open original
        </a>

        <div className="flex items-center gap-1">
          {STATUS_FLOW.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => handleStatusChange(status)}
              aria-pressed={item.status === status}
              className={`px-3 py-1.5 font-mono-meta text-[11px] uppercase tracking-wide transition-colors ${
                item.status === status
                  ? "bg-[var(--fg)] text-[var(--bg)]"
                  : "border border-[var(--hairline)] text-[var(--fg-muted)] hover:border-[var(--fg-faint)]"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setDeleteDialogOpen(true)}
          aria-label="Delete item"
          className="ml-auto text-[var(--fg-faint)] hover:text-[var(--accent)]"
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <StatusPill status={item.status} />
        {item.tags.map((tag) => (
          <TagChip key={tag.id} name={tag.name} color={tag.color} onRemove={() => handleToggleTag(tag.id)} />
        ))}
        <button
          type="button"
          onClick={() => setTagDialogOpen(true)}
          className="inline-flex items-center gap-1.5 border border-dashed border-[var(--hairline)] px-2.5 py-1 font-mono-meta text-[11px] uppercase tracking-wide text-[var(--fg-faint)] transition-colors hover:border-[var(--fg-faint)] hover:text-[var(--fg)]"
        >
          <TagIcon className="h-3 w-3" aria-hidden="true" />
          Edit tags
        </button>
      </div>

      <section className="mt-12">
        <h2 className="font-serif-display text-xl text-[var(--fg)]">Highlights &amp; notes</h2>

        <form onSubmit={handleAddHighlight} className="mt-4 space-y-2 border border-[var(--hairline)] p-4">
          <textarea
            value={highlightText}
            onChange={(event) => setHighlightText(event.target.value)}
            placeholder="Paste or type a passage worth remembering…"
            rows={2}
            className="w-full resize-none bg-transparent text-sm leading-relaxed text-[var(--fg)] placeholder:text-[var(--fg-faint)] focus:outline-none"
          />
          <input
            type="text"
            value={highlightNote}
            onChange={(event) => setHighlightNote(event.target.value)}
            placeholder="Add a note (optional)"
            className="w-full border-t border-[var(--hairline)] bg-transparent pt-2 text-sm text-[var(--fg-muted)] placeholder:text-[var(--fg-faint)] focus:outline-none"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={highlightText.trim().length === 0}
              className="bg-[var(--fg)] px-3 py-1.5 text-sm font-medium text-[var(--bg)] transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              Save highlight
            </button>
          </div>
        </form>

        <div className="mt-4">
          {highlightsLoading && (
            <div className="space-y-3">
              <TextSkeleton className="h-16 w-full" />
              <TextSkeleton className="h-16 w-full" />
            </div>
          )}

          {!highlightsLoading && highlights.length === 0 && (
            <EmptyState
              icon={Highlighter}
              title="No highlights yet"
              description="Snippets and notes you save from this article will show up here."
            />
          )}

          {!highlightsLoading &&
            highlights.map((highlight) => (
              <blockquote
                key={highlight.id}
                className="animate-fade-in group relative border-l-2 border-[var(--accent)] py-1 pl-4 pr-8"
              >
                <p className="text-base leading-relaxed text-[var(--fg)]">&ldquo;{highlight.text}&rdquo;</p>
                {highlight.note && <p className="mt-1 text-sm text-[var(--fg-muted)]">{highlight.note}</p>}
                <p className="mt-1 font-mono-meta text-[11px] text-[var(--fg-faint)]">
                  {formatRelativeDate(highlight.createdAt)}
                </p>
                <button
                  type="button"
                  onClick={() => removeHighlight(highlight.id)}
                  aria-label="Delete highlight"
                  className="absolute right-0 top-1 text-[var(--fg-faint)] opacity-0 transition-opacity hover:text-[var(--accent)] group-hover:opacity-100"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </blockquote>
            ))}
        </div>
      </section>

      <TagEditorDialog
        open={tagDialogOpen}
        onOpenChange={setTagDialogOpen}
        allTags={allTags}
        selectedTagIds={item.tags.map((tag) => tag.id)}
        onToggleTag={handleToggleTag}
        onCreateTag={createTag}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Remove this item?"
        description="This will permanently delete the item along with its highlights and notes."
        confirmLabel="Remove"
        destructive
        onConfirm={handleDelete}
      />
    </div>
  );
}
