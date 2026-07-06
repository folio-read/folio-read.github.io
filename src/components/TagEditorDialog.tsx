import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Check, Plus, X } from "lucide-react";
import type { Tag } from "../types";

const PALETTE = ["#B4432E", "#6E7B5C", "#4A6C8C", "#8A6D3B", "#7A5C7E", "#3E6259"];

interface TagEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  allTags: Tag[];
  selectedTagIds: string[];
  onToggleTag: (tagId: string) => void;
  onCreateTag: (name: string, color: string) => Promise<Tag | null>;
}

export function TagEditorDialog({
  open,
  onOpenChange,
  allTags,
  selectedTagIds,
  onToggleTag,
  onCreateTag,
}: TagEditorDialogProps) {
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState(PALETTE[0]);
  const [creating, setCreating] = useState(false);

  async function handleCreate() {
    const trimmed = newTagName.trim();
    if (!trimmed) return;
    setCreating(true);
    const created = await onCreateTag(trimmed, newTagColor);
    setCreating(false);
    if (created) {
      setNewTagName("");
      onToggleTag(created.id);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="animate-fade-in fixed inset-0 z-40 bg-black/30" />
        <Dialog.Content className="animate-rise fixed left-1/2 top-1/2 z-50 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 border border-[var(--hairline)] bg-[var(--bg)] p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <Dialog.Title className="font-serif-display text-lg text-[var(--fg)]">Tags</Dialog.Title>
            <Dialog.Close aria-label="Close" className="text-[var(--fg-faint)] hover:text-[var(--fg)]">
              <X className="h-4 w-4" aria-hidden="true" />
            </Dialog.Close>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {allTags.length === 0 && (
              <p className="text-sm text-[var(--fg-muted)]">
                No tags yet. Create your first one below.
              </p>
            )}
            {allTags.map((tag) => {
              const selected = selectedTagIds.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => onToggleTag(tag.id)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 transition-colors ${
                    selected
                      ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                      : "border-[var(--hairline)] hover:border-[var(--fg-faint)]"
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: tag.color }} aria-hidden="true" />
                  <span className="font-mono-meta text-[11px] uppercase tracking-wide text-[var(--fg)]">
                    {tag.name}
                  </span>
                  {selected && <Check className="h-3 w-3 text-[var(--accent)]" aria-hidden="true" />}
                </button>
              );
            })}
          </div>

          <div className="mt-6 border-t border-[var(--hairline)] pt-4">
            <label htmlFor="new-tag-name" className="text-xs font-medium text-[var(--fg-muted)]">
              New tag
            </label>
            <div className="mt-2 flex items-center gap-2">
              <input
                id="new-tag-name"
                type="text"
                value={newTagName}
                onChange={(event) => setNewTagName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    handleCreate();
                  }
                }}
                placeholder="Tag name"
                className="flex-1 border border-[var(--hairline)] bg-transparent px-3 py-1.5 text-sm text-[var(--fg)] outline-none focus:border-[var(--accent)]"
              />
              <button
                type="button"
                onClick={handleCreate}
                disabled={creating || newTagName.trim().length === 0}
                aria-label="Add tag"
                className="flex h-8 w-8 shrink-0 items-center justify-center bg-[var(--fg)] text-[var(--bg)] transition-opacity hover:opacity-90 disabled:opacity-40"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            <div className="mt-3 flex gap-2">
              {PALETTE.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setNewTagColor(color)}
                  aria-label={`Use color ${color}`}
                  aria-pressed={newTagColor === color}
                  className={`h-5 w-5 rounded-full transition-transform ${
                    newTagColor === color ? "scale-110 ring-2 ring-[var(--fg)] ring-offset-2 ring-offset-[var(--bg)]" : ""
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
