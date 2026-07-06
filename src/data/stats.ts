import type { Item, Stats, TagDistributionEntry, WeeklyStat } from "../types";

const WEEKS_SHOWN = 8;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

function startOfWeek(date: Date): Date {
  const result = new Date(date);
  const day = result.getDay();
  const diff = (day + 6) % 7;
  result.setHours(0, 0, 0, 0);
  result.setDate(result.getDate() - diff);
  return result;
}

function formatWeekLabel(weekStart: Date): string {
  return weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function computeStats(items: Item[]): Stats {
  const now = new Date();
  const currentWeekStart = startOfWeek(now);

  const weeks: { start: Date; end: Date; label: string }[] = [];
  for (let i = WEEKS_SHOWN - 1; i >= 0; i -= 1) {
    const start = new Date(currentWeekStart.getTime() - i * 7 * MS_PER_DAY);
    const end = new Date(start.getTime() + 7 * MS_PER_DAY);
    weeks.push({ start, end, label: formatWeekLabel(start) });
  }

  const weeklyActivity: WeeklyStat[] = weeks.map((week) => {
    const saved = items.filter((item) => {
      const createdAt = new Date(item.createdAt);
      return createdAt >= week.start && createdAt < week.end;
    }).length;

    const read = items.filter((item) => {
      if (!item.readAt) return false;
      const readAt = new Date(item.readAt);
      return readAt >= week.start && readAt < week.end;
    }).length;

    return { weekLabel: week.label, saved, read };
  });

  const totalReadingTimeMin = items.reduce((sum, item) => sum + (item.readingTimeMin ?? 0), 0);
  const archivedCount = items.filter((item) => item.status === "archived").length;

  const tagCounts = new Map<string, TagDistributionEntry>();
  for (const item of items) {
    for (const tag of item.tags) {
      const existing = tagCounts.get(tag.id);
      if (existing) {
        existing.count += 1;
      } else {
        tagCounts.set(tag.id, { tagId: tag.id, name: tag.name, color: tag.color, count: 1 });
      }
    }
  }

  const tagDistribution = Array.from(tagCounts.values()).sort((a, b) => b.count - a.count);

  return {
    totalItems: items.length,
    totalReadingTimeMin,
    archivedCount,
    weeklyActivity,
    tagDistribution,
  };
}
