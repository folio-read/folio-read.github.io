import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { BarChart2 } from "lucide-react";
import { useStats } from "../hooks/useStats";
import { EmptyState } from "../components/EmptyState";
import { TextSkeleton } from "../components/Skeletons";

function formatTotalReadingTime(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder === 0 ? `${hours}h` : `${hours}h ${remainder}m`;
}

export default function Stats() {
  const { stats, loading, error } = useStats();

  if (loading) {
    return (
      <div className="max-w-3xl space-y-6">
        <TextSkeleton className="h-8 w-48" />
        <TextSkeleton className="h-40 w-full" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <EmptyState
        icon={BarChart2}
        title="Couldn't load stats"
        description={error ?? "Something went wrong while calculating your stats."}
      />
    );
  }

  if (stats.totalItems === 0) {
    return (
      <EmptyState
        icon={BarChart2}
        title="No stats yet"
        description="Save a few articles first — your reading habits will show up here."
      />
    );
  }

  const maxTagCount = stats.tagDistribution[0]?.count ?? 1;

  return (
    <div className="max-w-3xl">
      <h1 className="font-serif-display text-3xl text-[var(--fg)]">Stats</h1>

      <div className="mt-6 grid grid-cols-1 gap-px border border-[var(--hairline)] bg-[var(--hairline)] sm:grid-cols-3">
        <div className="bg-[var(--bg)] p-5">
          <p className="font-mono-meta text-[11px] uppercase tracking-wide text-[var(--fg-faint)]">Saved</p>
          <p className="mt-1 font-serif-display text-3xl text-[var(--fg)]">{stats.totalItems}</p>
        </div>
        <div className="bg-[var(--bg)] p-5">
          <p className="font-mono-meta text-[11px] uppercase tracking-wide text-[var(--fg-faint)]">Archived</p>
          <p className="mt-1 font-serif-display text-3xl text-[var(--fg)]">{stats.archivedCount}</p>
        </div>
        <div className="bg-[var(--bg)] p-5">
          <p className="font-mono-meta text-[11px] uppercase tracking-wide text-[var(--fg-faint)]">
            Total reading time
          </p>
          <p className="mt-1 font-serif-display text-3xl text-[var(--fg)]">
            {formatTotalReadingTime(stats.totalReadingTimeMin)}
          </p>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="font-mono-meta text-[11px] uppercase tracking-wide text-[var(--fg-faint)]">
          Saved vs. read, last 8 weeks
        </h2>
        <div className="mt-3 h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.weeklyActivity} margin={{ top: 8, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="var(--hairline)" vertical={false} />
              <XAxis
                dataKey="weekLabel"
                tick={{ fill: "var(--fg-faint)", fontSize: 11, fontFamily: "var(--font-mono)" }}
                axisLine={{ stroke: "var(--hairline)" }}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: "var(--fg-faint)", fontSize: 11, fontFamily: "var(--font-mono)" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: "var(--bg-raised)" }}
                contentStyle={{
                  background: "var(--bg)",
                  border: "1px solid var(--hairline)",
                  borderRadius: 0,
                  fontSize: 12,
                }}
                labelStyle={{ color: "var(--fg)" }}
              />
              <Bar dataKey="saved" name="Saved" fill="var(--fg-faint)" radius={[2, 2, 0, 0]} maxBarSize={18} />
              <Bar dataKey="read" name="Read" fill="var(--accent)" radius={[2, 2, 0, 0]} maxBarSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {stats.tagDistribution.length > 0 && (
        <div className="mt-10">
          <h2 className="font-mono-meta text-[11px] uppercase tracking-wide text-[var(--fg-faint)]">
            Distribution across tags
          </h2>
          <div className="mt-3 space-y-3">
            {stats.tagDistribution.map((entry) => (
              <div key={entry.tagId} className="flex items-center gap-3">
                <span className="w-24 shrink-0 truncate font-mono-meta text-xs text-[var(--fg-muted)]">
                  {entry.name}
                </span>
                <div className="h-2 flex-1 bg-[var(--bg-raised)]">
                  <div
                    className="h-2"
                    style={{ width: `${(entry.count / maxTagCount) * 100}%`, backgroundColor: entry.color }}
                  />
                </div>
                <span className="w-6 shrink-0 text-right font-mono-meta text-xs text-[var(--fg-faint)]">
                  {entry.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
