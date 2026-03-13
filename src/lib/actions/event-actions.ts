"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { impactEventSchema } from "@/lib/validations";
import type { ImpactEventType } from "@/lib/types/database";

export interface ActionResult {
  success: boolean;
  error?: string;
}

export async function createImpactEvent(
  pilotId: string,
  formData: {
    event_type: ImpactEventType;
    event_date: string;
    description: string;
    trained_people_event?: number | null;
    productivity_improvement_pct?: number | null;
  }
): Promise<ActionResult> {
  const parsed = impactEventSchema.safeParse(formData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "Datos inválidos",
    };
  }

  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "No autenticado" };

  const description =
    (parsed.data.description ?? "").trim() || "—";

  const { error } = await db.from("impact_events").insert({
    pilot_id: pilotId,
    event_type: parsed.data.event_type,
    event_date: parsed.data.event_date,
    description,
    trained_people_event:
      parsed.data.event_type === "formacion"
        ? (parsed.data.trained_people_event ?? null)
        : null,
    productivity_improvement_pct:
      parsed.data.event_type === "productividad"
        ? (parsed.data.productivity_improvement_pct ?? null)
        : null,
    created_by: user.id,
    updated_by: user.id,
  });

  if (error) return { success: false, error: error.message };

  revalidatePath(`/pilots/${pilotId}`);
  return { success: true };
}

export async function updateImpactEvent(
  eventId: string,
  pilotId: string,
  formData: {
    event_type: ImpactEventType;
    event_date: string;
    description: string;
    trained_people_event?: number | null;
    productivity_improvement_pct?: number | null;
  }
): Promise<ActionResult> {
  const parsed = impactEventSchema.safeParse(formData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "Datos inválidos",
    };
  }

  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "No autenticado" };

  const description =
    (parsed.data.description ?? "").trim() || "—";

  const { error } = await db
    .from("impact_events")
    .update({
      event_type: parsed.data.event_type,
      event_date: parsed.data.event_date,
      description,
      trained_people_event:
        parsed.data.event_type === "formacion"
          ? (parsed.data.trained_people_event ?? null)
          : null,
      productivity_improvement_pct:
        parsed.data.event_type === "productividad"
          ? (parsed.data.productivity_improvement_pct ?? null)
          : null,
      updated_by: user.id,
    })
    .eq("id", eventId);

  if (error) return { success: false, error: error.message };

  revalidatePath(`/pilots/${pilotId}`);
  return { success: true };
}

export async function deleteImpactEvent(
  eventId: string,
  pilotId: string
): Promise<ActionResult> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "No autenticado" };

  const { error } = await db.from("impact_events").delete().eq("id", eventId);
  if (error) return { success: false, error: error.message };

  revalidatePath(`/pilots/${pilotId}`);
  return { success: true };
}
