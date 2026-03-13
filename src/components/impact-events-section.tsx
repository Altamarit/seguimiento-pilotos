"use client";

import { useEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ImpactEventCard } from "@/components/impact-event-card";
import { ImpactEventModal } from "@/components/impact-event-modal";
import { useRole } from "@/hooks/use-role";
import type { ImpactEvent } from "@/lib/types/database";

interface ImpactEventsSectionProps {
  events: ImpactEvent[];
  totalEvents: number;
  pilotId: string;
  initialOpen?: boolean;
}

export function ImpactEventsSection({
  events,
  totalEvents,
  pilotId,
  initialOpen = false,
}: ImpactEventsSectionProps) {
  const { canEdit } = useRole();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ImpactEvent | null>(null);
  const [showAll, setShowAll] = useState(false);
  const cameFromMainToAddEvent = useRef(initialOpen);

  const displayedEvents = showAll ? events : events.slice(0, 5);

  function handleEdit(event: ImpactEvent) {
    setEditingEvent(event);
    setModalOpen(true);
  }

  function handleCloseModal(eventCreated?: boolean) {
    setModalOpen(false);
    setEditingEvent(null);
    if (eventCreated && cameFromMainToAddEvent.current) {
      const view = searchParams.get("view") || "list";
      router.push(view ? `/?view=${view}` : "/");
    }
  }

  useEffect(() => {
    if (initialOpen && canEdit) {
      setModalOpen(true);

      const params = new URLSearchParams(searchParams.toString());
      params.delete("openEvent");
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname);
    }
  }, [canEdit, initialOpen, pathname, router, searchParams]);

  return (
    <div className="rounded-lg border border-[#E4E7EC] bg-white p-6 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-[#101828]">
          Hitos
          {totalEvents > 0 && (
            <span className="ml-2 rounded-full bg-[#F5F5F7] px-2 py-0.5 text-xs font-normal text-[#667085]">
              {totalEvents}
            </span>
          )}
        </h2>
        {canEdit && (
          <Button size="sm" onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4" />
            Evento
          </Button>
        )}
      </div>

      {events.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-sm text-[#667085]">
            Aún no hay hitos para este piloto.
          </p>
          {canEdit && (
            <Button
              size="sm"
              variant="outline"
              className="mt-3"
              onClick={() => setModalOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Añadir primer hito
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
              Ver todos ({totalEvents} hitos)
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
