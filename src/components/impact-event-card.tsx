"use client";

import { useState, useTransition } from "react";
import { Pencil, Trash2, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate, EVENT_TYPE_CONFIG } from "@/lib/utils";
import { deleteImpactEvent } from "@/lib/actions/event-actions";
import { useRole } from "@/hooks/use-role";
import type { ImpactEvent } from "@/lib/types/database";

interface ImpactEventCardProps {
  event: ImpactEvent;
  onEdit: (event: ImpactEvent) => void;
}

export function ImpactEventCard({ event, onEdit }: ImpactEventCardProps) {
  const { canEdit } = useRole();
  const [isPending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const typeCfg = EVENT_TYPE_CONFIG[event.event_type];

  function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }
    startTransition(async () => {
      await deleteImpactEvent(event.id, event.pilot_id);
    });
  }

  return (
    <div className="flex gap-4">
      {/* Nodo timeline */}
      <div className="relative flex flex-col items-center">
        <div className="mt-1.5 h-2 w-2 rounded-full bg-[#2563EB] shrink-0" />
        <div className="mt-1 flex-1 w-px bg-[#E4E7EC]" />
      </div>

      {/* Contenido */}
      <div className="flex-1 pb-4">
        <div className="rounded-lg border border-[#E4E7EC] bg-white p-3 shadow-card group">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-[#667085]">{formatDate(event.event_date)}</span>
              <Badge color={typeCfg.color} bgColor={typeCfg.bgColor}>
                {typeCfg.label}
              </Badge>
            </div>
            {canEdit && (
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onEdit(event)}
                  className="rounded p-1 text-[#98A2B3] hover:text-[#667085] hover:bg-[#F5F5F7]"
                  title="Editar evento"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isPending}
                  className={`rounded p-1 transition-colors ${
                    confirmDelete
                      ? "text-[#DC2626] bg-[#FEF3F2]"
                      : "text-[#98A2B3] hover:text-[#DC2626] hover:bg-[#FEF3F2]"
                  }`}
                  title={confirmDelete ? "Confirmar borrado" : "Borrar evento"}
                >
                  {isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            )}
          </div>
          {event.description && event.description !== "—" && (
            <p className="mt-1.5 text-sm text-[#101828]">{event.description}</p>
          )}
          {event.event_type === "formacion" && event.trained_people_event !== null && (
            <p className="mt-1 text-sm font-semibold text-[#2563EB]">
              +{event.trained_people_event} personas formadas
            </p>
          )}
          {event.event_type === "productividad" && event.productivity_improvement_pct !== null && (
            <p className="mt-1 text-sm font-semibold text-[#16A34A]">
              {event.productivity_improvement_pct} % mejora productividad
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
