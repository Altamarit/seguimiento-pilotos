import { createClient } from "@/lib/supabase/server";
import type { PilotStatus } from "@/lib/types/database";

export interface GlobalKPIs {
  activeAndFinishedPilots: number;
  totalPilots: number;
  pilotsByStatus: Record<PilotStatus, number>;
  totalTrainedPeople: number;
  avgProductivityImprovement: number | null;
}

export interface ParticipantsTimelinePoint {
  date: string;
  count: number;
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

  const pilotsList = (pilots ?? []) as { status?: string }[];
  const activeAndFinishedPilots = pilotsList.filter(
    (p) => p.status === "en_marcha" || p.status === "finalizado"
  ).length;
  const totalPilots = pilotsList.length;

  const pilotsByStatus: Record<PilotStatus, number> = {
    planificado: 0,
    en_marcha: 0,
    finalizado: 0,
    cancelado: 0,
  };
  for (const p of pilotsList) {
    if (p.status && p.status in pilotsByStatus) {
      pilotsByStatus[p.status as PilotStatus]++;
    }
  }

  const fromPilots =
    (pilots as { trained_people_count?: number | null }[])?.reduce(
      (sum: number, p: { trained_people_count?: number | null }) =>
        sum + (p.trained_people_count ?? 0),
      0
    ) ?? 0;
  const fromFormacionEvents =
    (eventsFormacion as { trained_people_event?: number | null }[])?.reduce(
      (sum: number, e: { trained_people_event?: number | null }) =>
        sum + (e.trained_people_event ?? 0),
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

  return {
    activeAndFinishedPilots,
    totalPilots,
    pilotsByStatus,
    totalTrainedPeople,
    avgProductivityImprovement,
  };
}

export async function getParticipantsTimeline(): Promise<ParticipantsTimelinePoint[]> {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: pilots } = await (supabase as any)
    .from("pilots")
    .select("start_date, created_at, trained_people_count");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: eventsFormacion } = await (supabase as any)
    .from("impact_events")
    .select("pilot_id, event_date, trained_people_event")
    .eq("event_type", "formacion");

  type DateDelta = { date: string; delta: number };
  const points: DateDelta[] = [];

  for (const p of (pilots ?? []) as {
    start_date: string | null;
    created_at: string;
    trained_people_count?: number | null;
  }[]) {
    const date = p.start_date ?? p.created_at;
    const count = p.trained_people_count ?? 0;
    if (count > 0) points.push({ date, delta: count });
  }

  for (const e of (eventsFormacion ?? []) as {
    pilot_id: string;
    event_date: string;
    trained_people_event?: number | null;
  }[]) {
    const delta = e.trained_people_event ?? 0;
    if (delta > 0) points.push({ date: e.event_date, delta });
  }

  points.sort((a, b) => a.date.localeCompare(b.date));

  const result: ParticipantsTimelinePoint[] = [];
  let cumulative = 0;
  for (const { date, delta } of points) {
    cumulative += delta;
    result.push({ date, count: cumulative });
  }

  return result;
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
    (eventsFormacion as { trained_people_event?: number | null }[])?.reduce(
      (sum: number, e: { trained_people_event?: number | null }) =>
        sum + (e.trained_people_event ?? 0),
      0
    ) ?? 0;
  const trainedPeopleCount = fromPilot + fromFormacionEvents;

  const base = pilot?.productivity_improvement_base ?? 0;
  const fromProductividadEvents =
    (eventsProductividad as { productivity_improvement_pct?: number | null }[])?.reduce(
      (sum: number, e: { productivity_improvement_pct?: number | null }) =>
        sum + (e.productivity_improvement_pct ?? 0),
      0
    ) ?? 0;
  const productivityImprovementPct = base + fromProductividadEvents;

  return {
    trainedPeopleCount,
    productivityImprovementPct,
  };
}
