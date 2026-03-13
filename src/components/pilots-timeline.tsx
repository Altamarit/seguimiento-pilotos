"use client";

import { useRouter } from "next/navigation";
import { parseISO, differenceInDays, startOfMonth, endOfMonth, addMonths, format, min, max } from "date-fns";
import { es } from "date-fns/locale";
import { STATUS_CONFIG } from "@/lib/utils";
import type { Pilot } from "@/lib/types/database";

interface PilotsTimelineProps {
  pilots: Pilot[];
  participantesMap?: Record<string, number>;
}

export function PilotsTimeline({ pilots, participantesMap = {} }: PilotsTimelineProps) {
  const router = useRouter();

  const pilotsWithDates = pilots.filter((p) => p.start_date);

  if (pilotsWithDates.length === 0) {
    return (
      <div className="rounded-lg border border-[#E4E7EC] bg-white p-12 text-center shadow-card">
        <p className="font-medium text-[#101828]">Sin fechas definidas</p>
        <p className="mt-1 text-sm text-[#667085]">
          Añade fechas de inicio a los pilotos para verlos en la vista cronológica.
        </p>
      </div>
    );
  }

  const allStartDates = pilotsWithDates.map((p) => parseISO(p.start_date!));
  const allEndDates = pilotsWithDates
    .filter((p) => p.end_date)
    .map((p) => parseISO(p.end_date!));

  const timelineStart = startOfMonth(
    addMonths(min(allStartDates), -1)
  );
  const timelineEnd = endOfMonth(
    addMonths(
      allEndDates.length > 0 ? max([...allEndDates, ...allStartDates]) : max(allStartDates),
      1
    )
  );

  const totalDays = differenceInDays(timelineEnd, timelineStart) + 1;

  const months: { label: string; startDay: number; days: number }[] = [];
  let cursor = startOfMonth(timelineStart);
  while (cursor <= timelineEnd) {
    const monthEnd = endOfMonth(cursor);
    const clampedStart = cursor < timelineStart ? timelineStart : cursor;
    const clampedEnd = monthEnd > timelineEnd ? timelineEnd : monthEnd;
    months.push({
      label: format(cursor, "MMM yyyy", { locale: es }),
      startDay: differenceInDays(clampedStart, timelineStart),
      days: differenceInDays(clampedEnd, clampedStart) + 1,
    });
    cursor = addMonths(cursor, 1);
  }

  return (
    <div className="rounded-lg border border-[#E4E7EC] bg-white p-4 shadow-card overflow-x-auto">
      <div style={{ minWidth: "700px" }}>
        {/* Eje temporal */}
        <div className="flex border-b border-[#E4E7EC] pb-2 mb-3">
          <div className="w-48 shrink-0" />
          <div className="flex-1 relative flex">
            {months.map((month, i) => (
              <div
                key={i}
                className="text-xs text-[#667085] text-center"
                style={{ width: `${(month.days / totalDays) * 100}%` }}
              >
                {month.label}
              </div>
            ))}
          </div>
        </div>

        {/* Filas de pilotos */}
        <div className="flex flex-col gap-3">
          {pilotsWithDates.map((pilot) => {
            const startDate = parseISO(pilot.start_date!);
            const endDate = pilot.end_date ? parseISO(pilot.end_date) : addMonths(startDate, 1);
            const statusCfg = STATUS_CONFIG[pilot.status];

            const startOffset = Math.max(0, differenceInDays(startDate, timelineStart));
            const duration = Math.max(
              1,
              differenceInDays(endDate, startDate) + 1
            );

            const leftPct = (startOffset / totalDays) * 100;
            const widthPct = Math.min(
              (duration / totalDays) * 100,
              100 - leftPct
            );

            return (
              <div key={pilot.id} className="flex items-center gap-3">
                <div className="w-48 shrink-0">
                  <button
                    onClick={() => router.push(`/pilots/${pilot.id}`)}
                    className="text-left text-sm font-medium text-[#101828] hover:text-[#2563EB] truncate w-full"
                  >
                    {pilot.name}
                  </button>
                </div>
                <div className="flex-1 relative h-7 flex items-center">
                  {/* Lineas de separacion de meses */}
                  {months.map((month, i) => (
                    <div
                      key={i}
                      className="absolute top-0 bottom-0 border-l border-[#E4E7EC]"
                      style={{ left: `${(month.startDay / totalDays) * 100}%` }}
                    />
                  ))}
                  {/* Barra del piloto */}
                  <div
                    className="absolute h-4 rounded-full cursor-pointer transition-opacity hover:opacity-80 group"
                    style={{
                      left: `${leftPct}%`,
                      width: `${widthPct}%`,
                      backgroundColor: statusCfg.bgColor,
                      border: `1.5px solid ${statusCfg.borderColor}`,
                    }}
                    onClick={() => router.push(`/pilots/${pilot.id}`)}
                    title={`${pilot.name} — ${statusCfg.label}${(participantesMap[pilot.id] ?? 0) > 0 ? ` · ${participantesMap[pilot.id]} participantes` : ""}`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
