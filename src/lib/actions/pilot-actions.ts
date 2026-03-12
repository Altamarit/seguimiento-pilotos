"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { pilotSchema } from "@/lib/validations";
import type { PilotStatus } from "@/lib/types/database";

export interface ActionResult {
  success: boolean;
  error?: string;
}

export async function createPilot(): Promise<void> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data, error } = await db
    .from("pilots")
    .insert({
      name: "Nuevo piloto",
      status: "planificado",
      trained_people_count: 0,
      created_by: user.id,
      updated_by: user.id,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/");
  redirect(`/pilots/${data.id}`);
}

export async function updatePilot(
  id: string,
  formData: {
    name: string;
    objective?: string;
    status: PilotStatus;
    start_date?: string | null;
    end_date?: string | null;
    trained_people_count: number;
  }
): Promise<ActionResult> {
  const parsed = pilotSchema.safeParse(formData);
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

  const { error } = await db
    .from("pilots")
    .update({ ...parsed.data, updated_by: user.id })
    .eq("id", id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/");
  revalidatePath(`/pilots/${id}`);
  return { success: true };
}

export async function deletePilot(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "No autenticado" };

  const { error } = await db.from("pilots").delete().eq("id", id);
  if (error) return { success: false, error: error.message };

  revalidatePath("/");
  redirect("/");
}
