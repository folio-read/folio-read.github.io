import { supabase } from "../lib/supabase";
import type { Tag } from "../types";

interface TagRow {
  id: string;
  name: string;
  color: string;
  created_at: string;
}

function mapRow(row: TagRow): Tag {
  return { id: row.id, name: row.name, color: row.color, createdAt: row.created_at };
}

export async function listTags(): Promise<Tag[]> {
  const { data, error } = await supabase.from("tags").select("id, name, color, created_at").order("name");
  if (error) throw error;
  return (data ?? []).map(mapRow);
}

export async function createTag(userId: string, name: string, color: string): Promise<Tag> {
  const { data, error } = await supabase
    .from("tags")
    .insert({ user_id: userId, name, color })
    .select("id, name, color, created_at")
    .single();
  if (error) throw error;
  return mapRow(data);
}

export async function updateTag(id: string, changes: { name?: string; color?: string }): Promise<Tag> {
  const { data, error } = await supabase
    .from("tags")
    .update(changes)
    .eq("id", id)
    .select("id, name, color, created_at")
    .single();
  if (error) throw error;
  return mapRow(data);
}

export async function deleteTag(id: string): Promise<void> {
  const { error } = await supabase.from("tags").delete().eq("id", id);
  if (error) throw error;
}
