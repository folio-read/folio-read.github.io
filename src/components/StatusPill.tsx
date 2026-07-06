import type { ItemStatus } from "../types";

const STATUS_LABEL: Record<ItemStatus, string> = {
  inbox: "Inbox",
  reading: "Reading",
  archived: "Archived",
};

const STATUS_COLOR: Record<ItemStatus, string> = {
  inbox: "var(--color-status-inbox)",
  reading: "var(--color-status-reading)",
  archived: "var(--color-status-archived)",
};

export function StatusPill({ status }: { status: ItemStatus }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 font-mono-meta text-[11px] uppercase tracking-wide"
      style={{ color: STATUS_COLOR[status] }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: STATUS_COLOR[status] }} aria-hidden="true" />
      {STATUS_LABEL[status]}
    </span>
  );
}
