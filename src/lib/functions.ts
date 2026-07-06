import { FunctionsHttpError } from "@supabase/supabase-js";
import { supabase } from "./supabase";

export async function invokeFunction<T>(name: string, body: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke<T>(name, { body });

  if (error) {
    if (error instanceof FunctionsHttpError) {
      const parsed = await error.context.json().catch(() => null);
      const message = parsed && typeof parsed.error === "string" ? parsed.error : error.message;
      throw new Error(message);
    }
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("Received an empty response");
  }

  return data;
}
