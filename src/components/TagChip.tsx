interface TagChipProps {
  name: string;
  color: string;
  active?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
}

export function TagChip({ name, color, active, onClick, onRemove }: TagChipProps) {
  const interactive = Boolean(onClick);

  const content = (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="h-1.5 w-1.5 shrink-0 rounded-full"
        style={{ backgroundColor: color }}
        aria-hidden="true"
      />
      <span className="font-mono-meta text-[11px] uppercase tracking-wide">{name}</span>
      {onRemove && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onRemove();
          }}
          aria-label={`Remove tag ${name}`}
          className="ml-0.5 text-[var(--fg-faint)] hover:text-[var(--fg)]"
        >
          ×
        </button>
      )}
    </span>
  );

  const baseClasses =
    "inline-flex items-center rounded-full border px-2.5 py-1 transition-colors";
  const stateClasses = active
    ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--fg)]"
    : "border-[var(--hairline)] bg-transparent text-[var(--fg-muted)] hover:border-[var(--fg-faint)]";

  if (interactive) {
    return (
      <button type="button" onClick={onClick} className={`${baseClasses} ${stateClasses}`}>
        {content}
      </button>
    );
  }

  return <span className={`${baseClasses} ${stateClasses}`}>{content}</span>;
}
