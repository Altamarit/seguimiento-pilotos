import { createClient } from "@/lib/supabase/server";
import type { Pilot, PilotStatus } from "@/lib/types/database";

export interface PilotFilters {
  status?: PilotStatus | "";
  dateFrom?: string;
  dateTo?: string;
}

export async function listPilots(filters?: PilotFilters): Promise<Pilot[]> {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase as any).from("pilots").select("*");

  if (filters?.status) {
    query = query.eq("status", filters.status);
  }
  if (filters?.dateFrom) {
    query = query.gte("start_date", filters.dateFrom);
  }
  if (filters?.dateTo) {
    query = query.lte("start_date", filters.dateTo);
  }

  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Pilot[];
}

export async function getPilotsParticipantesMap(): Promise<Record<string, number>> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: pilots } = await (supabase as any).from("pilots").select("id, trained_people_count");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: eventsFormacion } = await (supabase as any)
    .from("impact_events")
    .select("pilot_id, trained_people_event")
    .eq("event_type", "formacion");

  const map: Record<string, number> = {};
  for (const p of (pilots ?? []) as { id: string; trained_people_count: number }[]) {
    map[p.id] = p.trained_people_count ?? 0;
  }
  for (const e of (eventsFormacion ?? []) as { pilot_id: string; trained_people_event: number | null }[]) {
    if (map[e.pilot_id] !== undefined) {
      map[e.pilot_id] += e.trained_people_event ?? 0;
    }
  }
  return map;
}

export async function getPilotsProductivityMap(): Promise<Record<string, number | null>> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: pilots, error: pilotsError } = await (supabase as any)
    .from("pilots")
    .select("id, productivity_improvement_base");

  if (pilotsError) throw pilotsError;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: eventsProductividad, error: eventsError } = await (supabase as any)
    .from("impact_events")
    .select("pilot_id, productivity_improvement_pct")
    .eq("event_type", "productividad");

  if (eventsError) throw eventsError;

  const map: Record<string, number> = {};
  for (const p of (pilots ?? []) as { id: string; productivity_improvement_base?: number | null }[]) {
    map[p.id] = p.productivity_improvement_base ?? 0;
  }
  for (const e of (eventsProductividad ?? []) as { pilot_id: string; productivity_improvement_pct: number | null }[]) {
    if (map[e.pilot_id] !== undefined) {
      map[e.pilot_id] += e.productivity_improvement_pct ?? 0;
    }
  }
  const result: Record<string, number | null> = {};
  for (const [k, v] of Object.entries(map)) {
    result[k] = v;
  }
  return result;
}

export async function getPilot(id: string): Promise<Pilot | null> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("pilots")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return data as Pilot;
}
