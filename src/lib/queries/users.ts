import { createAdminClient } from "@/lib/supabase/admin";
import type { Profile, ProfileWithRole } from "@/lib/types/database";

export async function listUsers(): Promise<ProfileWithRole[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;

  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("*")
    .order("email");

  if (profilesError) throw profilesError;

  const { data: roles, error: rolesError } = await supabase
    .from("user_roles")
    .select("*");

  if (rolesError) throw rolesError;

  return ((profiles as Profile[]) ?? []).map((profile) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userRole = (roles as any[])?.find((r: any) => r.user_id === profile.id);
    return {
      ...profile,
      role: userRole?.role ?? "lector",
    };
  });
}
