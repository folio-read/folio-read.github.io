import { supabase } from "../lib/supabase";
import type { Item, ItemFilters, ItemStatus, Tag } from "../types";

interface ItemRow {
  id: string;
  url: string;
  title: string | null;
  excerpt: string | null;
  author: string | null;
  site_name: string | null;
  cover_image_url: string | null;
  favicon_url: string | null;
  reading_time_min: number | null;
  status: ItemStatus;
  created_at: string;
  read_at: string | null;
  item_tags: Array<{
    tags: { id: string; name: string; color: string; created_at: string } | null;
  }> | null;
}

function mapRow(row: ItemRow): Item {
  const tags: Tag[] = (row.item_tags ?? [])
    .map((join) => join.tags)
    .filter((tag): tag is NonNullable<typeof tag> => tag !== null)
    .map((tag) => ({
      id: tag.id,
      name: tag.name,
      color: tag.color,
      createdAt: tag.created_at,
    }));

  return {
    id: row.id,
    url: row.url,
    title: row.title,
    excerpt: row.excerpt,
    author: row.author,
    siteName: row.site_name,
    coverImageUrl: row.cover_image_url,
    faviconUrl: row.favicon_url,
    readingTimeMin: row.reading_time_min,
    status: row.status,
    createdAt: row.created_at,
    readAt: row.read_at,
    tags,
  };
}

const ITEM_SELECT = `
  id, url, title, excerpt, author, site_name, cover_image_url, favicon_url,
  reading_time_min, status, created_at, read_at,
  item_tags ( tags ( id, name, color, created_at ) )
`;

export async function listItems(filters: ItemFilters = {}): Promise<Item[]> {
  let query = supabase.from("items").select(ITEM_SELECT).order("created_at", { ascending: false });

  if (filters.status) {
    query = query.eq("status", filters.status);
  }

  if (filters.search && filters.search.trim().length > 0) {
    const terms = filters.search.trim().split(/\s+/).join(" & ");
    query = query.textSearch("search_vector", terms, { type: "websearch", config: "english" });
  }

  const { data, error } = await query;
  if (error) throw error;

  const rows = (data ?? []) as unknown as ItemRow[];
  const items = rows.map(mapRow);

  if (filters.tagId) {
    return items.filter((item) => item.tags.some((tag) => tag.id === filters.tagId));
  }

  return items;
}

export async function getItem(id: string): Promise<Item | null> {
  const { data, error } = await supabase.from("items").select(ITEM_SELECT).eq("id", id).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return mapRow(data as unknown as ItemRow);
}

export interface CreateItemInput {
  url: string;
  title: string | null;
  excerpt: string | null;
  author: string | null;
  siteName: string | null;
  coverImageUrl: string | null;
  faviconUrl: string | null;
  readingTimeMin: number | null;
}

export async function createItem(userId: string, input: CreateItemInput): Promise<Item> {
  const { data, error } = await supabase
    .from("items")
    .insert({
      user_id: userId,
      url: input.url,
      title: input.title,
      excerpt: input.excerpt,
      author: input.author,
      site_name: input.siteName,
      cover_image_url: input.coverImageUrl,
      favicon_url: input.faviconUrl,
      reading_time_min: input.readingTimeMin,
    })
    .select(ITEM_SELECT)
    .single();

  if (error) throw error;
  return mapRow(data as unknown as ItemRow);
}

export async function updateItemStatus(id: string, status: ItemStatus): Promise<void> {
  const { error } = await supabase
    .from("items")
    .update({ status, read_at: status === "archived" ? new Date().toISOString() : null })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteItem(id: string): Promise<void> {
  const { error } = await supabase.from("items").delete().eq("id", id);
  if (error) throw error;
}

export async function setItemTags(itemId: string, tagIds: string[]): Promise<void> {
  const { error: deleteError } = await supabase.from("item_tags").delete().eq("item_id", itemId);
  if (deleteError) throw deleteError;

  if (tagIds.length === 0) return;

  const { error: insertError } = await supabase
    .from("item_tags")
    .insert(tagIds.map((tagId) => ({ item_id: itemId, tag_id: tagId })));
  if (insertError) throw insertError;
}
