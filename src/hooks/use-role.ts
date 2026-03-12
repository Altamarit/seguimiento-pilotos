"use client";

import { createContext, useContext } from "react";
import type { AppRole } from "@/lib/types/database";

export interface RoleContextValue {
  role: AppRole;
  isEditor: boolean;
  isAdmin: boolean;
  canEdit: boolean;
}

export const RoleContext = createContext<RoleContextValue>({
  role: "lector",
  isEditor: false,
  isAdmin: false,
  canEdit: false,
});

export function useRole(): RoleContextValue {
  return useContext(RoleContext);
}
