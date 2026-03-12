import { createClient } from "@/lib/supabase/server";
import type { ImpactEvent } from "@/lib/types/database";

export async function listImpactEvents(
  pilotId: string,
  limit?: number
): Promise<ImpactEvent[]> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase as any)
    .from("impact_events")
    .select("*")
    .eq("pilot_id", pilotId)
    .order("event_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (limit) query = query.limit(limit);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as ImpactEvent[];
}

export async function countImpactEvents(pilotId: string): Promise<number> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { count, error } = await (supabase as any)
    .from("impact_events")
    .select("*", { count: "exact", head: true })
    .eq("pilot_id", pilotId);

  if (error) throw error;
  return count ?? 0;
}
