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
