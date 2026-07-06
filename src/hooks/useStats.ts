import { useEffect, useState } from "react";
import { listItems } from "../data/items";
import { computeStats } from "../data/stats";
import type { Stats } from "../types";

interface UseStatsResult {
  stats: Stats | null;
  loading: boolean;
  error: string | null;
}

export function useStats(): UseStatsResult {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const items = await listItems({});
        if (!cancelled) setStats(computeStats(items));
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Could not load stats");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { stats, loading, error };
}
