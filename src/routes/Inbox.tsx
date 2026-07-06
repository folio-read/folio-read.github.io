import { useMemo, useState } from "react";
import { Library } from "lucide-react";
import { useItems } from "../hooks/useItems";
import { useTags } from "../hooks/useTags";
import { useDebounce } from "../hooks/useDebounce";
import { ItemCard } from "../components/ItemCard";
import { SearchBox } from "../components/SearchBox";
import { TagChip } from "../components/TagChip";
import { EmptyState } from "../components/EmptyState";
import { ItemListSkeleton } from "../components/Skeletons";
import { ConfirmDialog } from "../components/ConfirmDialog";
import type { ItemStatus } from "../types";

const STATUS_TABS: Array<{ value: ItemStatus | "all"; label: string }> = [
  { value: "all", label: "All" },
  { value: "inbox", label: "Inbox" },
  { value: "reading", label: "Reading" },
  { value: "archived", label: "Archived" },
];

export default function InboxRoute() {
  const [statusFilter, setStatusFilter] = useState<ItemStatus | "all">("all");
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 300);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const filters = useMemo(
    () => ({
      status: statusFilter === "all" ? undefined : statusFilter,
      tagId: tagFilter ?? undefined,
      search: debouncedSearch,
    }),
    [statusFilter, tagFilter, debouncedSearch],
  );

  const { items, loading, error, reload, updateStatus, removeItem } = useItems(filters);
  const { tags } = useTags();

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="font-serif-display text-3xl text-[var(--fg)]">Your queue</h1>
          <div className="w-full sm:w-72">
            <SearchBox value={searchInput} onChange={setSearchInput} />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setStatusFilter(tab.value)}
              className={`font-mono-meta text-[11px] uppercase tracking-wide transition-colors ${
                statusFilter === tab.value
                  ? "text-[var(--accent)]"
                  : "text-[var(--fg-faint)] hover:text-[var(--fg)]"
              } px-2 py-1`}
            >
              {tab.label}
            </button>
          ))}

          {tags.length > 0 && <div className="mx-1 h-4 w-px bg-[var(--hairline)]" aria-hidden="true" />}

          {tags.map((tag) => (
            <TagChip
              key={tag.id}
              name={tag.name}
              color={tag.color}
              active={tagFilter === tag.id}
              onClick={() => setTagFilter((current) => (current === tag.id ? null : tag.id))}
            />
          ))}
        </div>
      </div>

      {loading && <ItemListSkeleton count={5} />}

      {!loading && error && (
        <EmptyState
          icon={Library}
          title="Couldn't load your queue"
          description={error}
          action={
            <button
              type="button"
              onClick={() => reload()}
              className="border border-[var(--hairline)] px-4 py-2 font-mono-meta text-[11px] uppercase tracking-wide text-[var(--fg)] transition-colors hover:border-[var(--accent)]"
            >
              Try again
            </button>
          }
        />
      )}

      {!loading && !error && items.length === 0 && (
        <EmptyState
          icon={Library}
          title={debouncedSearch || tagFilter || statusFilter !== "all" ? "Nothing matches" : "Your queue is empty"}
          description={
            debouncedSearch || tagFilter || statusFilter !== "all"
              ? "Try a different search term, tag, or status filter."
              : "Paste a link from the Add screen to start building your reading queue."
          }
        />
      )}

      {!loading && !error && items.length > 0 && (
        <div>
          {items.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              onStatusChange={(status) => updateStatus(item.id, status)}
              onDelete={() => setPendingDeleteId(item.id)}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={pendingDeleteId !== null}
        onOpenChange={(open) => !open && setPendingDeleteId(null)}
        title="Remove this item?"
        description="This will permanently delete the item along with its highlights and notes."
        confirmLabel="Remove"
        destructive
        onConfirm={() => {
          if (pendingDeleteId) removeItem(pendingDeleteId);
        }}
      />
    </div>
  );
}
