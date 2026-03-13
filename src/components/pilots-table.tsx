"use client";

import { useRouter } from "next/navigation";
import { formatDate, formatDateShort, STATUS_CONFIG } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Pilot } from "@/lib/types/database";

interface PilotsTableProps {
  pilots: Pilot[];
}

export function PilotsTable({ pilots }: PilotsTableProps) {
  const router = useRouter();

  if (pilots.length === 0) {
    return (
      <div className="rounded-lg border border-[#E4E7EC] bg-white p-12 text-center shadow-card">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#F5F5F7]">
          <span className="text-2xl">🚀</span>
        </div>
        <p className="font-medium text-[#101828]">Todavía no hay pilotos</p>
        <p className="mt-1 text-sm text-[#667085]">
          Crea el primer piloto de IA para empezar el seguimiento.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-[#E4E7EC] bg-white shadow-card">
      <div className="divide-y divide-[#E4E7EC] md:hidden">
        {pilots.map((pilot) => {
          const statusCfg = STATUS_CONFIG[pilot.status];
          return (
            <button
              key={pilot.id}
              type="button"
              onClick={() => router.push(`/pilots/${pilot.id}`)}
              className="block w-full space-y-3 p-4 text-left transition-colors hover:bg-[#F9FAFB]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-[#101828]">{pilot.name}</p>
                  {pilot.objective ? (
                    <p className="mt-1 line-clamp-2 text-xs text-[#667085]">{pilot.objective}</p>
                  ) : null}
                </div>
                <Badge color={statusCfg.color} bgColor={statusCfg.bgColor}>
                  {statusCfg.label}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-[#667085]">Inicio</p>
                  <p className="mt-1 font-medium text-[#101828]">{formatDateShort(pilot.start_date)}</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-[#667085]">Fin</p>
                  <p className="mt-1 font-medium text-[#101828]">{formatDateShort(pilot.end_date)}</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-[#667085]">Formados</p>
                  <p className="mt-1 font-medium text-[#101828]">
                    {pilot.trained_people_count > 0 ? pilot.trained_people_count : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-[#667085]">Productividad</p>
                  <p className="mt-1 font-medium text-[#101828]">—</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <table className="hidden w-full text-sm md:table">
        <thead>
          <tr className="border-b border-[#E4E7EC] bg-[#F9FAFB]">
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-[#667085]">
              Piloto
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-[#667085]">
              Estado
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-[#667085]">
              Inicio
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-[#667085]">
              Fin
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-[#667085]">
              Formados
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-[#667085]">
              Productividad
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E4E7EC]">
          {pilots.map((pilot) => {
            const statusCfg = STATUS_CONFIG[pilot.status];
            return (
              <tr
                key={pilot.id}
                onClick={() => router.push(`/pilots/${pilot.id}`)}
                className="cursor-pointer bg-white transition-colors hover:bg-[#F9FAFB]"
              >
                <td className="min-w-[200px] px-4 py-3.5">
                  <p className="font-medium text-[#101828]">{pilot.name}</p>
                  {pilot.objective && (
                    <p className="mt-0.5 line-clamp-1 text-xs text-[#667085]">{pilot.objective}</p>
                  )}
                </td>
                <td className="px-4 py-3.5">
                  <Badge color={statusCfg.color} bgColor={statusCfg.bgColor}>
                    {statusCfg.label}
                  </Badge>
                </td>
                <td className="whitespace-nowrap px-4 py-3.5 text-[#667085]">
                  {formatDate(pilot.start_date)}
                </td>
                <td className="whitespace-nowrap px-4 py-3.5 text-[#667085]">
                  {formatDate(pilot.end_date)}
                </td>
                <td className="px-4 py-3.5 text-right font-medium text-[#101828]">
                  {pilot.trained_people_count > 0 ? pilot.trained_people_count : "—"}
                </td>
                <td className="px-4 py-3.5 text-right font-medium text-[#101828]">
                  —
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function PilotsTableSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-[#E4E7EC] bg-white shadow-card">
      <div className="space-y-3 p-4 md:hidden">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="space-y-3 rounded-lg border border-[#E4E7EC] p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-full" />
              </div>
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        ))}
      </div>

      <div className="hidden md:block">
        <div className="border-b border-[#E4E7EC] bg-[#F9FAFB] px-4 py-3">
          <Skeleton className="h-3 w-48" />
        </div>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-b border-[#E4E7EC] px-4 py-3.5">
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-64" />
            </div>
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="ml-auto h-4 w-10" />
            <Skeleton className="h-4 w-10" />
          </div>
        ))}
      </div>
    </div>
  );
}
