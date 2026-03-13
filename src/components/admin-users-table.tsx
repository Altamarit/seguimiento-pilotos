"use client";

import { useState, useTransition } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { updateUserRole, deleteUser } from "@/lib/actions/user-actions";
import type { ProfileWithRole, AppRole } from "@/lib/types/database";

const ROLE_CONFIG: Record<AppRole, { label: string; color: string; bgColor: string }> = {
  admin: { label: "Admin", color: "#2563EB", bgColor: "#EFF4FF" },
  editor: { label: "Editor", color: "#16A34A", bgColor: "#ECFDF3" },
  lector: { label: "Lector", color: "#667085", bgColor: "#F2F4F7" },
};

interface AdminUsersTableProps {
  users: ProfileWithRole[];
  currentUserId: string;
}

export function AdminUsersTable({ users, currentUserId }: AdminUsersTableProps) {
  const [isPending, startTransition] = useTransition();
  const [isDeletePending, startDeleteTransition] = useTransition();
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [userToDelete, setUserToDelete] = useState<ProfileWithRole | null>(null);

  function handleRoleChange(userId: string, newRole: AppRole) {
    setPendingUserId(userId);
    setErrors((prev) => ({ ...prev, [userId]: "" }));
    startTransition(async () => {
      const result = await updateUserRole(userId, newRole);
      if (!result.success) {
        setErrors((prev) => ({ ...prev, [userId]: result.error ?? "Error" }));
      }
      setPendingUserId(null);
    });
  }

  function handleDeleteConfirm() {
    if (!userToDelete) return;
    const id = userToDelete.id;
    startDeleteTransition(async () => {
      const result = await deleteUser(id);
      if (!result.success) {
        setErrors((prev) => ({ ...prev, [id]: result.error ?? "Error al eliminar" }));
      }
      setUserToDelete(null);
    });
  }

  return (
    <>
      <Dialog open={!!userToDelete} onOpenChange={(open) => { if (!open) setUserToDelete(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar usuario</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-[#667085]">
            ¿Estás seguro de que quieres eliminar a{" "}
            <span className="font-medium text-[#101828]">
              {userToDelete?.full_name || userToDelete?.email}
            </span>
            ? Esta acción no se puede deshacer.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setUserToDelete(null)}
              disabled={isDeletePending}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteConfirm}
              disabled={isDeletePending}
            >
              {isDeletePending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Eliminar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="rounded-lg border border-[#E4E7EC] bg-white shadow-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E4E7EC] bg-[#F9FAFB]">
              <th className="px-4 py-3 text-left text-xs font-medium tracking-wide text-[#667085]">
                Usuario
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium tracking-wide text-[#667085]">
                Rol actual
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium tracking-wide text-[#667085]">
                Cambiar rol
              </th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E4E7EC]">
            {users.map((user) => {
              const roleCfg = ROLE_CONFIG[user.role];
              const isCurrentUser = user.id === currentUserId;
              const isLoading = isPending && pendingUserId === user.id;

              return (
                <tr key={user.id} className="bg-white hover:bg-[#F9FAFB]">
                  <td className="px-4 py-3.5">
                    <p className="font-medium text-[#101828]">
                      {user.full_name || user.email}
                      {isCurrentUser && (
                        <span className="ml-2 text-xs text-[#667085]">(tú)</span>
                      )}
                    </p>
                    <p className="text-xs text-[#667085]">{user.email}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <Badge color={roleCfg.color} bgColor={roleCfg.bgColor}>
                      {roleCfg.label}
                    </Badge>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <Select
                          value={user.role}
                          onValueChange={(v) => handleRoleChange(user.id, v as AppRole)}
                          disabled={isLoading}
                        >
                          <SelectTrigger className="h-8 w-32 text-sm">
                            {isLoading ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <SelectValue />
                            )}
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="lector">Lector</SelectItem>
                            <SelectItem value="editor">Editor</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {errors[user.id] && (
                        <p className="text-xs text-[#DC2626]">{errors[user.id]}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <button
                      onClick={() => setUserToDelete(user)}
                      disabled={isCurrentUser || isDeletePending}
                      title={isCurrentUser ? "No puedes eliminar tu propia cuenta" : "Eliminar usuario"}
                      className="rounded p-1.5 text-[#98A2B3] transition-colors hover:bg-[#FEF3F2] hover:text-[#DC2626] disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
