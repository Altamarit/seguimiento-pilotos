"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export interface AuthResult {
  success: boolean;
  error?: string;
  actionLink?: string;
}

function looksLikeEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function toAuthEmail(userIdentifier: string) {
  const normalizedUser = userIdentifier.trim().toLowerCase();

  if (looksLikeEmail(normalizedUser)) {
    return normalizedUser;
  }

  const encodedUser = Buffer.from(normalizedUser).toString("base64url");
  return `${encodedUser}@users.seguimiento-pilotos.local`;
}

function normalizeCredentials(userIdentifier: string, alias: string, password?: string) {
  return {
    userIdentifier: userIdentifier.trim(),
    authEmail: toAuthEmail(userIdentifier),
    alias: alias.trim(),
    password: password?.trim() ?? "",
  };
}

async function syncAlias(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  adminClient: any,
  userId: string,
  alias: string,
  userIdentifier?: string
) {
  const { data: userData } = await adminClient.auth.admin.getUserById(userId);
  const currentMetadata = userData?.user?.user_metadata ?? {};

  await adminClient
    .from("profiles")
    .update({ full_name: alias })
    .eq("id", userId);

  await adminClient.auth.admin.updateUserById(userId, {
    user_metadata: {
      ...currentMetadata,
      full_name: alias,
      ...(userIdentifier ? { login_name: userIdentifier } : {}),
    },
  });
}

async function loginWithMagicLink(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  adminClient: any,
  authEmail: string,
  alias: string,
  userIdentifier: string
): Promise<AuthResult> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // Intentar generar magic link (falla si el usuario no existe)
  const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
    type: "magiclink",
    email: authEmail,
  });

  if (linkError) {
    // Usuario no existe → crearlo
    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
      email: authEmail,
      email_confirm: true,
      user_metadata: { full_name: alias, login_name: userIdentifier },
    });
    if (createError) return { success: false, error: createError.message };

    await syncAlias(adminClient, newUser.user.id, alias, userIdentifier);

    const { data: newLinkData, error: newLinkError } = await adminClient.auth.admin.generateLink({
      type: "magiclink",
      email: authEmail,
    });
    if (newLinkError) return { success: false, error: newLinkError.message };
    return { success: true, actionLink: newLinkData.properties.action_link };
  } else {
    // Usuario existe → actualizar alias
    await syncAlias(adminClient, linkData.user.id, alias, userIdentifier);
    return { success: true, actionLink: linkData.properties.action_link };
  }
}

async function loginWithPassword(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  adminClient: any,
  authEmail: string,
  alias: string,
  password: string,
  userIdentifier: string
): Promise<AuthResult> {
  const supabase = await createClient();
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: authEmail,
    password,
  });

  if (!signInError && signInData.user) {
    await syncAlias(adminClient, signInData.user.id, alias, userIdentifier);
    return { success: true };
  }

  const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
    email: authEmail,
    password,
    email_confirm: true,
    user_metadata: { full_name: alias, login_name: userIdentifier },
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

  await syncAlias(adminClient, newUser.user.id, alias, userIdentifier);

  const { error: newSignInError } = await supabase.auth.signInWithPassword({
    email: authEmail,
    password,
  });

  if (newSignInError) return { success: false, error: newSignInError.message };

  return { success: true };
}

export async function loginOrCreate(
  userIdentifier: string,
  alias: string,
  password?: string
): Promise<AuthResult> {
  const normalized = normalizeCredentials(userIdentifier, alias, password);

  if (!normalized.userIdentifier) {
    return { success: false, error: "El usuario es obligatorio." };
  }

  if (!normalized.alias) {
    return { success: false, error: "El alias no puede estar en blanco." };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const adminClient = createAdminClient() as any;

  if (!normalized.password) {
    return loginWithMagicLink(
      adminClient,
      normalized.authEmail,
      normalized.alias,
      normalized.userIdentifier
    );
  }

  return loginWithPassword(
    adminClient,
    normalized.authEmail,
    normalized.alias,
    normalized.password,
    normalized.userIdentifier
  );
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
