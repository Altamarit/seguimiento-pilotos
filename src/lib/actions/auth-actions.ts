"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export interface AuthResult {
  success: boolean;
  error?: string;
}

function normalizeCredentials(email: string, alias: string, password?: string) {
  return {
    email: email.trim(),
    alias: alias.trim(),
    password: password?.trim() ?? "",
  };
}

async function syncAlias(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  adminClient: any,
  userId: string,
  alias: string
) {
  await adminClient
    .from("profiles")
    .update({ full_name: alias })
    .eq("id", userId);

  await adminClient.auth.admin.updateUserById(userId, {
    user_metadata: { full_name: alias },
  });
}

async function loginWithMagicLink(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  adminClient: any,
  email: string,
  alias: string
): Promise<AuthResult> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // Intentar generar magic link (falla si el usuario no existe)
  const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
    type: "magiclink",
    email,
  });

  let hashedToken: string;

  if (linkError) {
    // Usuario no existe → crearlo
    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: { full_name: alias },
    });
    if (createError) return { success: false, error: createError.message };

    await syncAlias(adminClient, newUser.user.id, alias);

    const { data: newLinkData, error: newLinkError } = await adminClient.auth.admin.generateLink({
      type: "magiclink",
      email,
    });
    if (newLinkError) return { success: false, error: newLinkError.message };
    hashedToken = newLinkData.properties.hashed_token;
  } else {
    // Usuario existe → actualizar alias
    await syncAlias(adminClient, linkData.user.id, alias);

    hashedToken = linkData.properties.hashed_token;
  }

  // Verificar el token servidor → establece cookies de sesión
  const supabase = await createClient();
  const { error: verifyError } = await supabase.auth.verifyOtp({
    token_hash: hashedToken,
    type: "magiclink",
  });

  if (verifyError) return { success: false, error: verifyError.message };

  return { success: true };
}

async function loginWithPassword(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  adminClient: any,
  email: string,
  alias: string,
  password: string
): Promise<AuthResult> {
  const supabase = await createClient();
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (!signInError && signInData.user) {
    await syncAlias(adminClient, signInData.user.id, alias);
    return { success: true };
  }

  const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: alias },
  });

  if (createError) {
    if (createError.message?.toLowerCase().includes("already")) {
      return {
        success: false,
        error: "No se ha podido acceder con esa contraseña.",
      };
    }

    return { success: false, error: createError.message };
  }

  await syncAlias(adminClient, newUser.user.id, alias);

  const { error: newSignInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (newSignInError) return { success: false, error: newSignInError.message };

  return { success: true };
}

export async function loginOrCreate(
  email: string,
  alias: string,
  password?: string
): Promise<AuthResult> {
  const normalized = normalizeCredentials(email, alias, password);

  if (!normalized.email) {
    return { success: false, error: "El usuario es obligatorio." };
  }

  if (!normalized.alias) {
    return { success: false, error: "El alias no puede estar en blanco." };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const adminClient = createAdminClient() as any;

  if (!normalized.password) {
    return loginWithMagicLink(adminClient, normalized.email, normalized.alias);
  }

  return loginWithPassword(adminClient, normalized.email, normalized.alias, normalized.password);
}

export async function updateAlias(alias: string): Promise<AuthResult> {
  const normalizedAlias = alias.trim();

  if (!normalizedAlias) {
    return { success: false, error: "El alias no puede estar en blanco." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "No autenticado." };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const adminClient = createAdminClient() as any;
  await syncAlias(adminClient, user.id, normalizedAlias);

  revalidatePath("/");
  revalidatePath("/admin");

  return { success: true };
}
