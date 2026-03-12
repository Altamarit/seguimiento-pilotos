"use client";

import { RoleContext, type RoleContextValue } from "@/hooks/use-role";
import type { AppRole } from "@/lib/types/database";

interface RoleProviderProps {
  role: AppRole;
  children: React.ReactNode;
}

export function RoleProvider({ role, children }: RoleProviderProps) {
  const value: RoleContextValue = {
    role,
    isEditor: role === "editor" || role === "admin",
    isAdmin: role === "admin",
    canEdit: role === "editor" || role === "admin",
  };

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}
