import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";

function toAuthEmail(userIdentifier: string) {
  const normalized = userIdentifier.trim().toLowerCase();
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) return normalized;
  const encoded = Buffer.from(normalized).toString("base64url");
  return `${encoded}@users.seguimiento-pilotos.local`;
}

async function syncAlias(userId: string, alias: string, userIdentifier: string) {
  const admin = createAdminClient();
  const { data: userData } = await admin.auth.admin.getUserById(userId);
  const metadata = userData?.user?.user_metadata ?? {};
  await admin.from("profiles").update({ full_name: alias }).eq("id", userId);
  await admin.auth.admin.updateUserById(userId, {
    user_metadata: { ...metadata, full_name: alias, login_name: userIdentifier },
  });
}

export async function POST(request: NextRequest) {
  const origin = request.nextUrl.origin;
  let body: { userIdentifier?: string; alias?: string; password?: string };
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    body = await request.json();
  } else {
    const form = await request.formData();
    body = {
      userIdentifier: (form.get("userIdentifier") as string)?.trim?.() ?? "",
      alias: (form.get("alias") as string)?.trim?.() ?? "",
      password: (form.get("password") as string)?.trim?.() ?? "",
    };
  }

  const userIdentifier = body.userIdentifier ?? "";
  const alias = body.alias ?? "";
  const password = body.password ?? "";

  if (!userIdentifier) {
    return NextResponse.redirect(`${origin}/login?error=usuario`);
  }
  if (!alias) {
    return NextResponse.redirect(`${origin}/login?error=alias`);
  }
  if (!password) {
    return NextResponse.redirect(`${origin}/login?error=password_required`);
  }

  const authEmail = toAuthEmail(userIdentifier);
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value, options }) =>
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            cookieStore.set(name, value, options as any)
          );
        },
      },
    }
  );

  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: authEmail,
    password,
  });

  if (!signInError && signInData.user) {
    await syncAlias(signInData.user.id, alias, userIdentifier);
    return NextResponse.redirect(origin + "/");
  }

  const admin = createAdminClient();
  const { data: newUser, error: createError } = await admin.auth.admin.createUser({
    email: authEmail,
    password,
    email_confirm: true,
    user_metadata: { full_name: alias, login_name: userIdentifier },
  });

  if (createError) {
    if (createError.message?.toLowerCase().includes("already")) {
      return NextResponse.redirect(`${origin}/login?error=bad_password`);
    }
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(createError.message)}`);
  }

  await syncAlias(newUser.user.id, alias, userIdentifier);

  const { error: newSignInError } = await supabase.auth.signInWithPassword({
    email: authEmail,
    password,
  });

  if (newSignInError) {
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(newSignInError.message)}`);
  }

  return NextResponse.redirect(origin + "/");
}
