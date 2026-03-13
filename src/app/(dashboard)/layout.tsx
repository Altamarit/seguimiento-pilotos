import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RoleProvider } from "@/components/role-provider";
import type { AppRole } from "@/lib/types/database";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: roleData } = await (supabase as any).rpc("get_my_role");
  const role: AppRole = roleData ?? "lector";

  return (
    <RoleProvider role={role}>
      <div className="min-h-screen bg-[#F5F5F7]">
        <main>{children}</main>
      </div>
    </RoleProvider>
  );
}
