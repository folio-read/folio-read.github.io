import { Link } from "react-router-dom";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Archive, BookOpen, ChevronDown, Inbox as InboxIcon, Trash2 } from "lucide-react";
import type { Item, ItemStatus } from "../types";
import { extractHostname, formatReadingTime, formatRelativeDate } from "../utils/format";
import { TagChip } from "./TagChip";
import { StatusPill } from "./StatusPill";

interface ItemCardProps {
  item: Item;
  onStatusChange: (status: ItemStatus) => void;
  onDelete: () => void;
}

const STATUS_OPTIONS: Array<{ value: ItemStatus; label: string; icon: typeof InboxIcon }> = [
  { value: "inbox", label: "Move to Inbox", icon: InboxIcon },
  { value: "reading", label: "Mark as Reading", icon: BookOpen },
  { value: "archived", label: "Archive", icon: Archive },
];

export function ItemCard({ item, onStatusChange, onDelete }: ItemCardProps) {
  return (
    <article className="animate-fade-in group flex gap-5 border-b border-[var(--hairline)] py-6">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 font-mono-meta text-[11px] uppercase tracking-wide text-[var(--fg-faint)]">
          <span>{item.siteName ?? extractHostname(item.url)}</span>
          <span aria-hidden="true">·</span>
          <span>{formatReadingTime(item.readingTimeMin)}</span>
          <span aria-hidden="true">·</span>
          <span>{formatRelativeDate(item.createdAt)}</span>
        </div>

        <Link to={`/items/${item.id}`} className="mt-1.5 block">
          <h3 className="font-serif-display text-xl leading-snug text-[var(--fg)] transition-colors group-hover:text-[var(--accent)]">
            {item.title ?? item.url}
          </h3>
        </Link>

        {item.excerpt && (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[var(--fg-muted)]">{item.excerpt}</p>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <StatusPill status={item.status} />
          {item.tags.map((tag) => (
            <TagChip key={tag.id} name={tag.name} color={tag.color} />
          ))}

          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button
                type="button"
                className="ml-auto inline-flex items-center gap-1 font-mono-meta text-[11px] uppercase tracking-wide text-[var(--fg-faint)] transition-colors hover:text-[var(--fg)]"
                aria-label="Change status or manage item"
              >
                Actions <ChevronDown className="h-3 w-3" aria-hidden="true" />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                align="end"
                sideOffset={6}
                className="animate-fade-in z-30 min-w-[180px] border border-[var(--hairline)] bg-[var(--bg)] py-1 shadow-md"
              >
                {STATUS_OPTIONS.filter((option) => option.value !== item.status).map((option) => (
                  <DropdownMenu.Item
                    key={option.value}
                    onSelect={() => onStatusChange(option.value)}
                    className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm text-[var(--fg)] outline-none hover:bg-[var(--bg-raised)]"
                  >
                    <option.icon className="h-3.5 w-3.5" aria-hidden="true" />
                    {option.label}
                  </DropdownMenu.Item>
                ))}
                <DropdownMenu.Separator className="my-1 h-px bg-[var(--hairline)]" />
                <DropdownMenu.Item
                  onSelect={onDelete}
                  className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm text-[var(--accent)] outline-none hover:bg-[var(--bg-raised)]"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  Remove
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </div>

      {item.coverImageUrl && (
        <Link to={`/items/${item.id}`} className="hidden shrink-0 sm:block">
          <img
            src={item.coverImageUrl}
            alt=""
            width={112}
            height={80}
            loading="lazy"
            className="h-20 w-28 object-cover"
          />
        </Link>
      )}
    </article>
  );
}
