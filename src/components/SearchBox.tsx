import { Search, X } from "lucide-react";

interface SearchBoxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchBox({ value, onChange, placeholder = "Search your queue" }: SearchBoxProps) {
  return (
    <div className="flex items-center gap-2 border border-[var(--hairline)] px-3 py-2">
      <Search className="h-4 w-4 shrink-0 text-[var(--fg-faint)]" aria-hidden="true" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label="Search"
        className="w-full bg-transparent text-sm text-[var(--fg)] placeholder:text-[var(--fg-faint)] focus:outline-none"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="shrink-0 text-[var(--fg-faint)] hover:text-[var(--fg)]"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
