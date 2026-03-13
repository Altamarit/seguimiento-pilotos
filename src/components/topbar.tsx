"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Settings, User, UserPen } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { updateAlias } from "@/lib/actions/auth-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRole } from "@/hooks/use-role";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TopbarProps {
  title: React.ReactNode;
  userName: string;
  userIdentifier: string;
  headerAction?: React.ReactNode;
  children?: React.ReactNode;
}

export function Topbar({ title, userName, userIdentifier, headerAction, children }: TopbarProps) {
  const router = useRouter();
  const { isAdmin } = useRole();
  const [isAliasDialogOpen, setIsAliasDialogOpen] = useState(false);
  const [alias, setAlias] = useState(userName);
  const [aliasError, setAliasError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setAlias(userName);
  }, [userName]);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  function handlePrimaryAction() {
    if (isAdmin) {
      router.push("/admin");
      router.refresh();
      return;
    }

    setAliasError(null);
    setIsAliasDialogOpen(true);
  }

  function handleAliasSubmit(e: React.FormEvent) {
    e.preventDefault();
    setAliasError(null);

    startTransition(async () => {
      const result = await updateAlias(alias);

      if (!result.success) {
        setAliasError(result.error ?? "No se ha podido actualizar el alias.");
        return;
      }

      setIsAliasDialogOpen(false);
      router.refresh();
    });
  }

  const displayName = userName || userIdentifier;
  const firstName = displayName ? displayName.split(/\s+/)[0] ?? displayName : "Usuario";

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-[#0E3D6B] bg-[#0F4C81]">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-lg font-semibold text-white sm:text-xl">{title}</h1>

            {headerAction ? (
              <div className="flex flex-1 items-center justify-center">
                {headerAction}
              </div>
            ) : null}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="max-w-[220px] gap-2 px-2 sm:px-3 text-white hover:bg-white/10 hover:text-white"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20">
                    <User className="h-3.5 w-3.5 text-[#7DD3FC]" />
                  </div>
                  <span className="truncate text-sm text-white">
                    Hola {firstName}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="truncate text-sm font-medium text-[#101828]">
                    {userName || userIdentifier}
                  </p>
                  {userName && userIdentifier ? (
                    <p className="truncate text-xs text-[#667085]">{userIdentifier}</p>
                  ) : null}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handlePrimaryAction}>
                  {isAdmin ? (
                    <>
                      <Settings className="mr-2 h-4 w-4" />
                      Ir a administración
                    </>
                  ) : (
                    <>
                      <UserPen className="mr-2 h-4 w-4" />
                      Cambiar alias
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-[#DC2626]">
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {children ? (
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
              {children}
            </div>
          ) : null}
        </div>
      </header>

      <Dialog open={isAliasDialogOpen} onOpenChange={setIsAliasDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cambiar alias</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleAliasSubmit} className="flex flex-col gap-4 pt-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="alias">Nuevo alias</Label>
              <Input
                id="alias"
                type="text"
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
                placeholder="Introduce tu alias"
                autoComplete="nickname"
                required
              />
            </div>

            {aliasError ? (
              <div className="rounded-md border border-[#FECDCA] bg-[#FEF3F2] px-3 py-2 text-sm text-[#DC2626]">
                {aliasError}
              </div>
            ) : null}

            <div className="flex justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAliasDialogOpen(false)}
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                Guardar alias
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
