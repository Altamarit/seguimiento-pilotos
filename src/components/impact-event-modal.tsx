"use client";

import { useState, useTransition, useEffect } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createImpactEvent, updateImpactEvent } from "@/lib/actions/event-actions";
import type { ImpactEvent, ImpactEventType } from "@/lib/types/database";

interface ImpactEventModalProps {
  open: boolean;
  onClose: () => void;
  pilotId: string;
  event?: ImpactEvent | null;
}

export function ImpactEventModal({
  open,
  onClose,
  pilotId,
  event,
}: ImpactEventModalProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [eventType, setEventType] = useState<ImpactEventType>("formacion");
  const [eventDate, setEventDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [description, setDescription] = useState("");
  const [numericValue, setNumericValue] = useState("");

  useEffect(() => {
    if (event) {
      setEventType(event.event_type);
      setEventDate(event.event_date);
      setDescription(event.description);
      if (event.event_type === "formacion") {
        setNumericValue(event.trained_people_event?.toString() ?? "");
      } else if (event.event_type === "productividad") {
        setNumericValue(event.productivity_improvement_pct?.toString() ?? "");
      } else {
        setNumericValue("");
      }
    } else {
      setEventType("formacion");
      setEventDate(new Date().toISOString().split("T")[0]);
      setDescription("");
      setNumericValue("");
    }
    setError(null);
  }, [event, open]);

  function handleSave() {
    setError(null);
    startTransition(async () => {
      const payload = {
        event_type: eventType,
        event_date: eventDate,
        description,
        trained_people_event:
          eventType === "formacion" ? parseInt(numericValue) || 0 : null,
        productivity_improvement_pct:
          eventType === "productividad" ? parseFloat(numericValue) || 0 : null,
      };

      const result = event
        ? await updateImpactEvent(event.id, pilotId, payload)
        : await createImpactEvent(pilotId, payload);

      if (result.success) {
        onClose();
      } else {
        setError(result.error ?? "Error al guardar el evento");
      }
    });
  }

  const isEditing = !!event;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar evento de impacto" : "Añadir evento de impacto"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 mt-2">
          <div className="flex flex-col gap-1.5">
            <Label>Tipo de evento</Label>
            <Select
              value={eventType}
              onValueChange={(v) => {
                setEventType(v as ImpactEventType);
                setNumericValue("");
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="formacion">Formación</SelectItem>
                <SelectItem value="productividad">Productividad</SelectItem>
                <SelectItem value="otro">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="event-date">Fecha del evento</Label>
            <Input
              id="event-date"
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
            />
          </div>

          {eventType === "formacion" && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="event-value">Nº de personas formadas en este evento</Label>
              <Input
                id="event-value"
                type="number"
                min={0}
                value={numericValue}
                onChange={(e) => setNumericValue(e.target.value)}
                placeholder="0"
              />
            </div>
          )}

          {eventType === "productividad" && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="event-value">% mejora de productividad</Label>
              <Input
                id="event-value"
                type="number"
                min={-100}
                max={999}
                step={0.1}
                value={numericValue}
                onChange={(e) => setNumericValue(e.target.value)}
                placeholder="0.0"
              />
              <p className="text-xs text-[#667085]">
                Este valor pasará a ser el % de productividad actual del piloto.
              </p>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="event-desc">Descripción</Label>
            <Input
              id="event-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Breve descripción del evento"
            />
          </div>

          {error && (
            <div className="rounded-md bg-[#FEF3F2] border border-[#FECDCA] px-3 py-2 text-sm text-[#DC2626]">
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={isPending}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              "Guardar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
