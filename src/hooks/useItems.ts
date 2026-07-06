import { useCallback, useEffect, useState } from "react";
import * as itemsData from "../data/items";
import type { Item, ItemFilters, ItemStatus } from "../types";
import { useToast } from "../context/ToastContext";

interface UseItemsResult {
  items: Item[];
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  updateStatus: (id: string, status: ItemStatus) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
}

export function useItems(filters: ItemFilters): UseItemsResult {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  const { status, tagId, search } = filters;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await itemsData.listItems({ status, tagId, search });
      setItems(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load your queue");
    } finally {
      setLoading(false);
    }
  }, [status, tagId, search]);

  useEffect(() => {
    load();
  }, [load]);

  const updateStatus = useCallback(
    async (id: string, status: ItemStatus) => {
      const previous = items;
      setItems((current) => current.map((item) => (item.id === id ? { ...item, status } : item)));
      try {
        await itemsData.updateItemStatus(id, status);
      } catch (err) {
        setItems(previous);
        showToast("Couldn't update status", {
          description: err instanceof Error ? err.message : "Please try again.",
          variant: "error",
        });
      }
    },
    [items, showToast],
  );

  const removeItem = useCallback(
    async (id: string) => {
      const previous = items;
      setItems((current) => current.filter((item) => item.id !== id));
      try {
        await itemsData.deleteItem(id);
      } catch (err) {
        setItems(previous);
        showToast("Couldn't remove item", {
          description: err instanceof Error ? err.message : "Please try again.",
          variant: "error",
        });
      }
    },
    [items, showToast],
  );

  return { items, loading, error, reload: load, updateStatus, removeItem };
}
