import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { listUsers } from "@/lib/queries/users";
import { Topbar } from "@/components/topbar";
import { AdminUsersTable } from "@/components/admin-users-table";
import { CreateUserModal } from "@/components/create-user-modal";

export default async function AdminPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: roleData } = await (supabase as any).rpc("get_my_role");
  if (roleData !== "admin") redirect("/");

  const users = await listUsers();

  return (
    <>
      <Topbar title="Administración" userEmail={user.email ?? ""} />
      <div className="mx-auto max-w-[1280px] px-6 py-6">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-[#101828]">
              Gestión de usuarios
            </h2>
            <p className="text-sm text-[#667085]">
              Crea usuarios y asigna roles. Los cambios se aplican de inmediato.
            </p>
          </div>
          <CreateUserModal />
        </div>
        <AdminUsersTable users={users} currentUserId={user.id} />
      </div>
    </>
  );
}
