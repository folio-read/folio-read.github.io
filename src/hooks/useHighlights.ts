import { useCallback, useEffect, useState } from "react";
import * as highlightsData from "../data/highlights";
import type { Highlight } from "../types";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

interface UseHighlightsResult {
  highlights: Highlight[];
  loading: boolean;
  error: string | null;
  addHighlight: (text: string, note: string | null) => Promise<void>;
  removeHighlight: (id: string) => Promise<void>;
}

export function useHighlights(itemId: string): UseHighlightsResult {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { showToast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await highlightsData.listHighlights(itemId);
      setHighlights(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load highlights");
    } finally {
      setLoading(false);
    }
  }, [itemId]);

  useEffect(() => {
    load();
  }, [load]);

  const addHighlight = useCallback(
    async (text: string, note: string | null) => {
      if (!user) return;
      try {
        const highlight = await highlightsData.createHighlight(user.id, itemId, text, note);
        setHighlights((current) => [highlight, ...current]);
      } catch (err) {
        showToast("Couldn't save highlight", {
          description: err instanceof Error ? err.message : "Please try again.",
          variant: "error",
        });
      }
    },
    [user, itemId, showToast],
  );

  const removeHighlight = useCallback(
    async (id: string) => {
      const previous = highlights;
      setHighlights((current) => current.filter((highlight) => highlight.id !== id));
      try {
        await highlightsData.deleteHighlight(id);
      } catch (err) {
        setHighlights(previous);
        showToast("Couldn't delete highlight", {
          description: err instanceof Error ? err.message : "Please try again.",
          variant: "error",
        });
      }
    },
    [highlights, showToast],
  );

  return { highlights, loading, error, addHighlight, removeHighlight };
}
