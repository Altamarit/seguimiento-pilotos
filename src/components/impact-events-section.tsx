"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImpactEventCard } from "@/components/impact-event-card";
import { ImpactEventModal } from "@/components/impact-event-modal";
import { useRole } from "@/hooks/use-role";
import type { ImpactEvent } from "@/lib/types/database";

interface ImpactEventsSectionProps {
  events: ImpactEvent[];
  totalEvents: number;
  pilotId: string;
}

export function ImpactEventsSection({
  events,
  totalEvents,
  pilotId,
}: ImpactEventsSectionProps) {
  const { canEdit } = useRole();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ImpactEvent | null>(null);
  const [showAll, setShowAll] = useState(false);

  const displayedEvents = showAll ? events : events.slice(0, 5);

  function handleEdit(event: ImpactEvent) {
    setEditingEvent(event);
    setModalOpen(true);
  }

  function handleCloseModal() {
    setModalOpen(false);
    setEditingEvent(null);
  }

  return (
    <div className="rounded-lg border border-[#E4E7EC] bg-white p-6 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-[#101828]">
          Eventos de impacto
          {totalEvents > 0 && (
            <span className="ml-2 rounded-full bg-[#F5F5F7] px-2 py-0.5 text-xs font-normal text-[#667085]">
              {totalEvents}
            </span>
          )}
        </h2>
        {canEdit && (
          <Button size="sm" onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4" />
            Añadir evento
          </Button>
        )}
      </div>

      {events.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-sm text-[#667085]">
            Aún no hay eventos de impacto para este piloto.
          </p>
          {canEdit && (
            <Button
              size="sm"
              variant="outline"
              className="mt-3"
              onClick={() => setModalOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Añadir primer evento de impacto
            </Button>
          )}
        </div>
      ) : (
        <div>
          <div className="flex flex-col">
            {displayedEvents.map((event) => (
              <ImpactEventCard key={event.id} event={event} onEdit={handleEdit} />
            ))}
          </div>

          {!showAll && totalEvents > 5 && (
            <button
              onClick={() => setShowAll(true)}
              className="mt-2 text-sm text-[#2563EB] hover:underline"
            >
              Ver todos ({totalEvents} eventos)
            </button>
          )}
        </div>
      )}

      <ImpactEventModal
        open={modalOpen}
        onClose={handleCloseModal}
        pilotId={pilotId}
        event={editingEvent}
      />
    </div>
  );
}
