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
    .select("status, trained_people_count");

  if (pilotsError) throw pilotsError;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: productivity, error: prodError } = await (supabase as any)
    .from("pilot_current_productivity")
    .select("productivity_improvement_pct");

  if (prodError) throw prodError;

  const activePilots =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (pilots as any[])?.filter((p: any) => p.status === "en_marcha").length ?? 0;
  const totalTrainedPeople =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (pilots as any[])?.reduce((sum: number, p: any) => sum + (p.trained_people_count ?? 0), 0) ?? 0;

  const prodValues = (productivity as { productivity_improvement_pct: number | null }[])
    ?.map((p) => p.productivity_improvement_pct)
    .filter((v): v is number => v !== null && v !== undefined);

  const avgProductivityImprovement =
    prodValues && prodValues.length > 0
      ? prodValues.reduce((sum, v) => sum + v, 0) / prodValues.length
      : null;

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
    .select("trained_people_count")
    .eq("id", pilotId)
    .single();

  if (pilotError) throw pilotError;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: productivity, error: prodError } = await (supabase as any)
    .from("pilot_current_productivity")
    .select("productivity_improvement_pct")
    .eq("pilot_id", pilotId)
    .single();

  if (prodError && prodError.code !== "PGRST116") throw prodError;

  return {
    trainedPeopleCount: pilot?.trained_people_count ?? 0,
    productivityImprovementPct:
      productivity?.productivity_improvement_pct ?? null,
  };
}
