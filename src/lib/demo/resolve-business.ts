import type { BusinessData } from "./types";
import { businesses } from "./businesses";
import { getDynamicBusiness } from "./dynamic-businesses";

export async function resolveBusiness(
  slug: string,
): Promise<BusinessData | null> {
  // 1. Static businesses first (instant, no I/O)
  if (businesses[slug]) return businesses[slug];
  // 2. Dynamic businesses from Postgres
  return getDynamicBusiness(slug);
}
