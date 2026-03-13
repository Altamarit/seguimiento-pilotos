"use client";

import { Plus } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { formatDate, formatDateShort, STATUS_CONFIG } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useRole } from "@/hooks/use-role";
import type { Pilot } from "@/lib/types/database";

interface PilotsTableProps {
  pilots: Pilot[];
  productivityMap?: Record<string, number | null>;
  participantesMap?: Record<string, number>;
}

export function PilotsTable({
  pilots,
  productivityMap = {},
  participantesMap = {},
}: PilotsTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { canEdit } = useRole();

  function buildPilotHref(pilotId: string, openEventModal = false) {
    const params = new URLSearchParams();
    const currentView = searchParams.get("view");

    if (currentView) {
      params.set("view", currentView);
    }

    if (openEventModal) {
      params.set("openEvent", "1");
    }

    const query = params.toString();
    return query ? `/pilots/${pilotId}?${query}` : `/pilots/${pilotId}`;
  }

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
            <div
              key={pilot.id}
              role="button"
              tabIndex={0}
              onClick={() => router.push(buildPilotHref(pilot.id))}
              onKeyDown={(e) => e.key === "Enter" && router.push(buildPilotHref(pilot.id))}
              className="p-4 space-y-3 cursor-pointer transition-colors hover:bg-[#F9FAFB] text-left"
            >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-[#101828]">{pilot.name}</p>
                    {pilot.objective ? (
                      <div className="mt-1 max-h-[4.5rem] overflow-y-auto text-xs text-[#667085] leading-relaxed">
                        {pilot.objective}
                      </div>
                    ) : null}
                  </div>
                  <Badge color={statusCfg.color} bgColor={statusCfg.bgColor}>
                    {statusCfg.label}
                  </Badge>
                </div>

                <div className="flex items-end justify-between gap-3 text-sm flex-wrap">
                  <div className="flex gap-4">
                    <div>
                      <p className="text-[11px] tracking-wide text-[#667085]">Desde</p>
                      <p className="mt-1 font-medium text-[#101828]">{formatDateShort(pilot.start_date)}</p>
                    </div>
                    <div>
                      <p className="text-[11px] tracking-wide text-[#667085]">Hasta</p>
                      <p className="mt-1 font-medium text-[#101828]">{formatDateShort(pilot.end_date)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[11px] tracking-wide text-[#667085]">Participantes</p>
                      <p className="mt-1 font-medium text-[#101828]">
                        {(participantesMap[pilot.id] ?? 0) > 0
                          ? participantesMap[pilot.id]
                          : "—"}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-[11px] tracking-wide text-[#667085]">Mejora</p>
                      <p className="mt-1 font-medium text-[#101828]">
                        {productivityMap[pilot.id] != null
                          ? `${productivityMap[pilot.id]} %`
                          : "—"}
                      </p>
                    </div>
                  </div>
                  {canEdit && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(buildPilotHref(pilot.id, true));
                      }}
                    >
                      <Plus className="h-4 w-4" />
                      Evento
                    </Button>
                  )}
                </div>
            </div>
          );
        })}
      </div>

      <table className="hidden w-full text-sm md:table">
        <thead>
          <tr className="border-b border-[#E4E7EC] bg-[#F9FAFB]">
            <th className="px-4 py-3 text-left text-xs font-medium tracking-widest text-[#667085]">
              Pilotos
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium tracking-widest text-[#667085]">
              Estado
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium tracking-widest text-[#667085]">
              Desde
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium tracking-widest text-[#667085]">
              Hasta
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium tracking-widest text-[#667085]">
              Participantes
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium tracking-widest text-[#667085]">
              Mejora
            </th>
            {canEdit && (
              <th className="px-4 py-3 text-right text-xs font-medium tracking-widest text-[#667085]">
                Hito
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E4E7EC]">
          {pilots.map((pilot) => {
            const statusCfg = STATUS_CONFIG[pilot.status];
            return (
              <tr
                key={pilot.id}
                onClick={() => router.push(buildPilotHref(pilot.id))}
                className="cursor-pointer bg-white transition-colors hover:bg-[#F9FAFB]"
              >
                <td className="min-w-[200px] px-4 py-3.5">
                  <p className="font-medium text-[#101828]">{pilot.name}</p>
                  {pilot.objective && (
                    <div className="mt-0.5 max-h-[4.5rem] overflow-y-auto text-xs text-[#667085] leading-relaxed">
                      {pilot.objective}
                    </div>
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
                <td className="px-4 py-3.5 text-center font-medium text-[#101828]">
                  {(participantesMap[pilot.id] ?? 0) > 0
                    ? participantesMap[pilot.id]
                    : "—"}
                </td>
                <td className="px-4 py-3.5 text-center font-medium text-[#101828]">
                  {productivityMap[pilot.id] != null
                    ? `${productivityMap[pilot.id]} %`
                    : "—"}
                </td>
                {canEdit && (
                  <td className="px-4 py-3.5 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(buildPilotHref(pilot.id, true));
                      }}
                    >
                      <Plus className="h-4 w-4" />
                      Evento
                    </Button>
                  </td>
                )}
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
