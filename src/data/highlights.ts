import { supabase } from "../lib/supabase";
import type { Highlight } from "../types";

interface HighlightRow {
  id: string;
  item_id: string;
  text: string;
  note: string | null;
  created_at: string;
}

function mapRow(row: HighlightRow): Highlight {
  return {
    id: row.id,
    itemId: row.item_id,
    text: row.text,
    note: row.note,
    createdAt: row.created_at,
  };
}

const HIGHLIGHT_SELECT = "id, item_id, text, note, created_at";

export async function listHighlights(itemId: string): Promise<Highlight[]> {
  const { data, error } = await supabase
    .from("highlights")
    .select(HIGHLIGHT_SELECT)
    .eq("item_id", itemId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapRow);
}

export async function createHighlight(
  userId: string,
  itemId: string,
  text: string,
  note: string | null,
): Promise<Highlight> {
  const { data, error } = await supabase
    .from("highlights")
    .insert({ user_id: userId, item_id: itemId, text, note })
    .select(HIGHLIGHT_SELECT)
    .single();
  if (error) throw error;
  return mapRow(data);
}

export async function updateHighlight(
  id: string,
  changes: { text?: string; note?: string | null },
): Promise<Highlight> {
  const { data, error } = await supabase
    .from("highlights")
    .update(changes)
    .eq("id", id)
    .select(HIGHLIGHT_SELECT)
    .single();
  if (error) throw error;
  return mapRow(data);
}

export async function deleteHighlight(id: string): Promise<void> {
  const { error } = await supabase.from("highlights").delete().eq("id", id);
  if (error) throw error;
}
