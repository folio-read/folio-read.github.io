import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const supabaseUrl = "https://uwuzwtagmlethmklyunu.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3dXp3dGFnbWxldGhta2x5dW51Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMzMzA3ODIsImV4cCI6MjA5ODkwNjc4Mn0.EvNlSPr2KlR7QDrP-AegRWYdQFn0_Bk-dVW4Ek-800M";

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: "pkce",
  },
});
