export function ItemCardSkeleton() {
  return (
    <div className="animate-fade-in flex gap-4 border-b border-[var(--hairline)] py-6">
      <div className="flex-1 space-y-3">
        <div className="h-3 w-40 rounded-sm bg-[var(--bg-raised)]" />
        <div className="h-5 w-3/4 rounded-sm bg-[var(--bg-raised)]" />
        <div className="h-4 w-full rounded-sm bg-[var(--bg-raised)]" />
        <div className="h-4 w-2/3 rounded-sm bg-[var(--bg-raised)]" />
      </div>
      <div className="hidden h-20 w-28 shrink-0 rounded-sm bg-[var(--bg-raised)] sm:block" />
    </div>
  );
}

export function ItemListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div>
      {Array.from({ length: count }).map((_, index) => (
        <ItemCardSkeleton key={index} />
      ))}
    </div>
  );
}

export function TextSkeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-fade-in rounded-sm bg-[var(--bg-raised)] ${className}`} />;
}
