"use client";

import { useRouter } from "next/navigation";
import { formatDate, STATUS_CONFIG } from "@/lib/utils";
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
    <div className="rounded-lg border border-[#E4E7EC] bg-white shadow-card overflow-hidden">
      <table className="w-full text-sm">
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
                className="cursor-pointer bg-white hover:bg-[#F9FAFB] transition-colors"
              >
                <td className="px-4 py-3.5 min-w-[200px]">
                  <p className="font-medium text-[#101828]">{pilot.name}</p>
                  {pilot.objective && (
                    <p className="mt-0.5 text-xs text-[#667085] line-clamp-1">
                      {pilot.objective}
                    </p>
                  )}
                </td>
                <td className="px-4 py-3.5">
                  <Badge color={statusCfg.color} bgColor={statusCfg.bgColor}>
                    {statusCfg.label}
                  </Badge>
                </td>
                <td className="px-4 py-3.5 text-[#667085] whitespace-nowrap">
                  {formatDate(pilot.start_date)}
                </td>
                <td className="px-4 py-3.5 text-[#667085] whitespace-nowrap">
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
    <div className="rounded-lg border border-[#E4E7EC] bg-white shadow-card overflow-hidden">
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
          <Skeleton className="h-4 w-10 ml-auto" />
          <Skeleton className="h-4 w-10" />
        </div>
      ))}
    </div>
  );
}
