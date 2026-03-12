"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { AppRole } from "@/lib/types/database";

export async function createUser(
  email: string,
  password: string,
  role: AppRole = "lector"
): Promise<ActionResult> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "No autenticado" };

  const { data: myRole } = await db.rpc("get_my_role");
  if (myRole !== "admin") {
    return { success: false, error: "Solo los administradores pueden crear usuarios" };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const adminClient = createAdminClient() as any;

  const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (createError) {
    if (createError.message?.includes("already been registered")) {
      return { success: false, error: "Ya existe un usuario con ese email" };
    }
    return { success: false, error: createError.message };
  }

  const { error: roleError } = await adminClient
    .from("user_roles")
    .insert({ user_id: newUser.user.id, role, assigned_by: user.id });

  if (roleError) return { success: false, error: roleError.message };

  revalidatePath("/admin");
  return { success: true };
}

export interface ActionResult {
  success: boolean;
  error?: string;
}

export async function deleteUser(targetUserId: string): Promise<ActionResult> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "No autenticado" };

  const { data: myRole } = await db.rpc("get_my_role");
  if (myRole !== "admin") {
    return { success: false, error: "Solo los administradores pueden eliminar usuarios" };
  }

  if (targetUserId === user.id) {
    return { success: false, error: "No puedes eliminar tu propia cuenta" };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const adminClient = createAdminClient() as any;

  const { error } = await adminClient.auth.admin.deleteUser(targetUserId);
  if (error) return { success: false, error: error.message };

  revalidatePath("/admin");
  return { success: true };
}

export async function updateUserRole(
  targetUserId: string,
  newRole: AppRole
): Promise<ActionResult> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "No autenticado" };

  const { data: myRole } = await db.rpc("get_my_role");
  if (myRole !== "admin") {
    return { success: false, error: "Solo los administradores pueden cambiar roles" };
  }

  if (newRole !== "admin") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const adminClient = createAdminClient() as any;
    const { data: currentAdmins } = await adminClient
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const isTargetCurrentAdmin = (currentAdmins as any[])?.find(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (a: any) => a.user_id === targetUserId
    );

    if (isTargetCurrentAdmin && currentAdmins && currentAdmins.length <= 1) {
      return {
        success: false,
        error: "No se puede quitar el rol admin al único administrador del sistema",
      };
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const adminClient = createAdminClient() as any;
  const { error } = await adminClient
    .from("user_roles")
    .update({ role: newRole, assigned_by: user.id })
    .eq("user_id", targetUserId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin");
  return { success: true };
}
