import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import type { PilotStatus, ImpactEventType } from "@/lib/types/database";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  try {
    return format(parseISO(dateStr), "dd MMM yyyy", { locale: es });
  } catch {
    return "—";
  }
}

export function formatDateShort(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  try {
    return format(parseISO(dateStr), "MMM yyyy", { locale: es });
  } catch {
    return "—";
  }
}

export const STATUS_CONFIG: Record<
  PilotStatus,
  { label: string; color: string; bgColor: string; borderColor: string }
> = {
  planificado: {
    label: "Planificado",
    color: "#64748B",
    bgColor: "#E2E8F0",
    borderColor: "#64748B",
  },
  en_marcha: {
    label: "En marcha",
    color: "#2563EB",
    bgColor: "#DBEAFE",
    borderColor: "#2563EB",
  },
  finalizado: {
    label: "Finalizado",
    color: "#16A34A",
    bgColor: "#DCFCE7",
    borderColor: "#16A34A",
  },
  cancelado: {
    label: "Cancelado",
    color: "#DC2626",
    bgColor: "#FEE2E2",
    borderColor: "#DC2626",
  },
};

export const EVENT_TYPE_CONFIG: Record<
  ImpactEventType,
  { label: string; color: string; bgColor: string }
> = {
  formacion: { label: "Formación", color: "#2563EB", bgColor: "#EFF4FF" },
  productividad: { label: "Productividad", color: "#16A34A", bgColor: "#ECFDF3" },
  otro: { label: "Otro", color: "#667085", bgColor: "#F2F4F7" },
};
