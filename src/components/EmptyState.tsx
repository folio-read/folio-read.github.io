import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-start gap-3 border border-dashed border-[var(--hairline)] px-6 py-12">
      <Icon className="h-6 w-6 text-[var(--fg-faint)]" aria-hidden="true" />
      <h3 className="font-serif-display text-xl text-[var(--fg)]">{title}</h3>
      <p className="max-w-md text-sm leading-relaxed text-[var(--fg-muted)]">{description}</p>
      {action}
    </div>
  );
}
