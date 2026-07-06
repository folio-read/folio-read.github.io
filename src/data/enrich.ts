import { invokeFunction } from "../lib/functions";
import type { EnrichedMetadata } from "../types";

export async function enrichUrl(url: string): Promise<EnrichedMetadata> {
  return invokeFunction<EnrichedMetadata>("enrich-url", { url });
}
