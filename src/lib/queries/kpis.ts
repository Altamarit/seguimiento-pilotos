import { createClient } from "@/lib/supabase/server";

export interface GlobalKPIs {
  activePilots: number;
  totalTrainedPeople: number;
  avgProductivityImprovement: number | null;
}

export async function getGlobalKPIs(): Promise<GlobalKPIs> {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: pilots, error: pilotsError } = await (supabase as any)
    .from("pilots")
    .select("id, status, trained_people_count, productivity_improvement_base");

  if (pilotsError) throw pilotsError;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: eventsFormacion, error: eventsError } = await (supabase as any)
    .from("impact_events")
    .select("pilot_id, trained_people_event")
    .eq("event_type", "formacion");

  if (eventsError) throw eventsError;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: eventsProductividad, error: prodError } = await (supabase as any)
    .from("impact_events")
    .select("pilot_id, productivity_improvement_pct")
    .eq("event_type", "productividad");

  if (prodError) throw prodError;

  const activePilots =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (pilots as any[])?.filter((p: any) => p.status === "en_marcha").length ?? 0;

  const fromPilots =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (pilots as any[])?.reduce((sum: number, p: any) => sum + (p.trained_people_count ?? 0), 0) ?? 0;
  const fromFormacionEvents =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (eventsFormacion as any[])?.reduce(
      (sum: number, e: any) => sum + (e.trained_people_event ?? 0),
      0
    ) ?? 0;
  const totalTrainedPeople = fromPilots + fromFormacionEvents;

  const prodByPilot: Record<string, number> = {};
  for (const p of (pilots ?? []) as { id: string; productivity_improvement_base?: number | null }[]) {
    prodByPilot[p.id] = p.productivity_improvement_base ?? 0;
  }
  for (const e of (eventsProductividad ?? []) as {
    pilot_id: string;
    productivity_improvement_pct: number | null;
  }[]) {
    if (prodByPilot[e.pilot_id] !== undefined) {
      prodByPilot[e.pilot_id] += e.productivity_improvement_pct ?? 0;
    }
  }
  const prodValues = Object.values(prodByPilot).filter((v) => v !== 0);
  const avgProductivityImprovement =
    prodValues.length > 0 ? Math.max(...prodValues) : null;

  return { activePilots, totalTrainedPeople, avgProductivityImprovement };
}

export interface PilotKPIs {
  trainedPeopleCount: number;
  productivityImprovementPct: number | null;
}

export async function getPilotKPIs(pilotId: string): Promise<PilotKPIs> {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: pilot, error: pilotError } = await (supabase as any)
    .from("pilots")
    .select("trained_people_count, productivity_improvement_base")
    .eq("id", pilotId)
    .single();

  if (pilotError) throw pilotError;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: eventsFormacion, error: eventsError } = await (supabase as any)
    .from("impact_events")
    .select("trained_people_event")
    .eq("pilot_id", pilotId)
    .eq("event_type", "formacion");

  if (eventsError) throw eventsError;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: eventsProductividad, error: prodError } = await (supabase as any)
    .from("impact_events")
    .select("productivity_improvement_pct")
    .eq("pilot_id", pilotId)
    .eq("event_type", "productividad");

  if (prodError) throw prodError;

  const fromPilot = pilot?.trained_people_count ?? 0;
  const fromFormacionEvents =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (eventsFormacion as any[])?.reduce(
      (sum: number, e: any) => sum + (e.trained_people_event ?? 0),
      0
    ) ?? 0;
  const trainedPeopleCount = fromPilot + fromFormacionEvents;

  const base = pilot?.productivity_improvement_base ?? 0;
  const fromProductividadEvents =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (eventsProductividad as any[])?.reduce(
      (sum: number, e: any) => sum + (e.productivity_improvement_pct ?? 0),
      0
    ) ?? 0;
  const productivityImprovementPct = base + fromProductividadEvents;

  return {
    trainedPeopleCount,
    productivityImprovementPct,
  };
}
