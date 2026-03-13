"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { headers } from "next/headers";

export interface AuthResult {
  success: boolean;
  actionLink?: string;
  error?: string;
}

export async function loginOrCreate(email: string, alias: string): Promise<AuthResult> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const adminClient = createAdminClient() as any;

  const headersList = await headers();
  const origin = headersList.get("origin") ?? headersList.get("x-forwarded-host") ?? "http://localhost:3000";
  const redirectTo = `${origin}/auth/callback`;

  // Intentar generar magic link (falla si el usuario no existe)
  const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
    type: "magiclink",
    email,
    options: { redirectTo },
  });

  if (linkError) {
    // Usuario no existe → crearlo primero
    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: { full_name: alias },
    });
    if (createError) return { success: false, error: createError.message };

    // Actualizar perfil con el alias
    await adminClient
      .from("profiles")
      .update({ full_name: alias })
      .eq("id", newUser.user.id);

    // Generar magic link para el usuario recién creado
    const { data: newLinkData, error: newLinkError } = await adminClient.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: { redirectTo },
    });
    if (newLinkError) return { success: false, error: newLinkError.message };

    return { success: true, actionLink: newLinkData.properties.action_link };
  }

  // Usuario existe → actualizar alias
  await adminClient
    .from("profiles")
    .update({ full_name: alias })
    .eq("id", linkData.user.id);

  await adminClient.auth.admin.updateUserById(linkData.user.id, {
    user_metadata: { full_name: alias },
  });

  return { success: true, actionLink: linkData.properties.action_link };
}
