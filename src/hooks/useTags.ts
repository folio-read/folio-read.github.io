import { useCallback, useEffect, useState } from "react";
import * as tagsData from "../data/tags";
import type { Tag } from "../types";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

interface UseTagsResult {
  tags: Tag[];
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  createTag: (name: string, color: string) => Promise<Tag | null>;
  updateTag: (id: string, changes: { name?: string; color?: string }) => Promise<void>;
  deleteTag: (id: string) => Promise<void>;
}

export function useTags(): UseTagsResult {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { showToast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await tagsData.listTags();
      setTags(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load tags");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const createTag = useCallback(
    async (name: string, color: string) => {
      if (!user) return null;
      try {
        const tag = await tagsData.createTag(user.id, name, color);
        setTags((current) => [...current, tag].sort((a, b) => a.name.localeCompare(b.name)));
        return tag;
      } catch (err) {
        showToast("Couldn't create tag", {
          description: err instanceof Error ? err.message : "Please try again.",
          variant: "error",
        });
        return null;
      }
    },
    [user, showToast],
  );

  const updateTag = useCallback(
    async (id: string, changes: { name?: string; color?: string }) => {
      const previous = tags;
      setTags((current) => current.map((tag) => (tag.id === id ? { ...tag, ...changes } : tag)));
      try {
        await tagsData.updateTag(id, changes);
      } catch (err) {
        setTags(previous);
        showToast("Couldn't update tag", {
          description: err instanceof Error ? err.message : "Please try again.",
          variant: "error",
        });
      }
    },
    [tags, showToast],
  );

  const deleteTag = useCallback(
    async (id: string) => {
      const previous = tags;
      setTags((current) => current.filter((tag) => tag.id !== id));
      try {
        await tagsData.deleteTag(id);
      } catch (err) {
        setTags(previous);
        showToast("Couldn't delete tag", {
          description: err instanceof Error ? err.message : "Please try again.",
          variant: "error",
        });
      }
    },
    [tags, showToast],
  );

  return { tags, loading, error, reload: load, createTag, updateTag, deleteTag };
}
