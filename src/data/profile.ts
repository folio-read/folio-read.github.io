import { supabase } from "../lib/supabase";
import type { Profile, ThemePreference } from "../types";

interface ProfileRow {
  id: string;
  display_name: string | null;
  theme: ThemePreference;
  created_at: string;
}

function mapRow(row: ProfileRow): Profile {
  return {
    id: row.id,
    displayName: row.display_name,
    theme: row.theme,
    createdAt: row.created_at,
  };
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, theme, created_at")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  return data ? mapRow(data) : null;
}

export async function updateProfile(
  userId: string,
  changes: { displayName?: string; theme?: ThemePreference },
): Promise<Profile> {
  const { data, error } = await supabase
    .from("profiles")
    .update({
      ...(changes.displayName !== undefined ? { display_name: changes.displayName } : {}),
      ...(changes.theme !== undefined ? { theme: changes.theme } : {}),
    })
    .eq("id", userId)
    .select("id, display_name, theme, created_at")
    .single();
  if (error) throw error;
  return mapRow(data);
}
