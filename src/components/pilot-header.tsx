"use client";

import { useState, useTransition } from "react";
import { Save, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { updatePilot, deletePilot } from "@/lib/actions/pilot-actions";
import { formatDate, STATUS_CONFIG } from "@/lib/utils";
import { useRole } from "@/hooks/use-role";
import type { Pilot, PilotStatus } from "@/lib/types/database";

interface PilotHeaderProps {
  pilot: Pilot;
}

export function PilotHeader({ pilot }: PilotHeaderProps) {
  const { canEdit } = useRole();
  const [isPending, startTransition] = useTransition();
  const [isDeletePending, startDeleteTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  function handleDelete() {
    startDeleteTransition(async () => {
      await deletePilot(pilot.id);
    });
  }

  const [name, setName] = useState(pilot.name);
  const [objective, setObjective] = useState(pilot.objective ?? "");
  const [status, setStatus] = useState<PilotStatus>(pilot.status);
  const [startDate, setStartDate] = useState(pilot.start_date ?? "");
  const [endDate, setEndDate] = useState(pilot.end_date ?? "");
  const [trainedPeople, setTrainedPeople] = useState(pilot.trained_people_count);
  const [productivityBase, setProductivityBase] = useState(pilot.productivity_improvement_base ?? 0);

  const isDirty =
    name !== pilot.name ||
    objective !== (pilot.objective ?? "") ||
    status !== pilot.status ||
    startDate !== (pilot.start_date ?? "") ||
    endDate !== (pilot.end_date ?? "") ||
    trainedPeople !== pilot.trained_people_count ||
    productivityBase !== (pilot.productivity_improvement_base ?? 0);

  function handleSave() {
    setError(null);
    setSuccess(false);
    startTransition(async () => {
      const result = await updatePilot(pilot.id, {
        name,
        objective: objective || undefined,
        status,
        start_date: startDate || null,
        end_date: endDate || null,
        trained_people_count: trainedPeople,
        productivity_improvement_base: productivityBase,
      });
      if (result.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 2000);
      } else {
        setError(result.error ?? "Error al guardar");
      }
    });
  }

  const statusCfg = STATUS_CONFIG[status];

  if (!canEdit) {
    return (
      <div className="rounded-lg border border-[#E4E7EC] bg-white p-6 shadow-card">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-semibold text-[#101828]">{pilot.name}</h1>
            {pilot.objective && (
              <p className="mt-1 text-sm text-[#667085]">{pilot.objective}</p>
            )}
            <p className="mt-2 text-xs text-[#667085]">
              {formatDate(pilot.start_date)} — {formatDate(pilot.end_date)}
            </p>
          </div>
          <Badge color={statusCfg.color} bgColor={statusCfg.bgColor} className="shrink-0">
            {statusCfg.label}
          </Badge>
        </div>
      </div>
    );
  }

  return (
    <>
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar piloto</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-[#667085]">
            ¿Estás seguro de que quieres eliminar{" "}
            <span className="font-medium text-[#101828]">{pilot.name}</span>?
            Esta acción eliminará también todos sus eventos de impacto y no se puede deshacer.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeletePending}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={isDeletePending}
            >
              {isDeletePending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Eliminar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    <div className="rounded-lg border border-[#E4E7EC] bg-white p-6 shadow-card">
      <div className="mb-4 flex gap-1">
        {[
          { label: "Planificado", value: "planificado" as PilotStatus },
          { label: "Activo", value: "en_marcha" as PilotStatus },
          { label: "Finalizado", value: "finalizado" as PilotStatus },
          { label: "Cancelado", value: "cancelado" as PilotStatus },
        ].map(({ label, value }) => (
          <Button
            key={value}
            type="button"
            variant={status === value ? "default" : "outline"}
            size="sm"
            onClick={() => setStatus(value)}
            className="flex-1 min-w-0 h-9 text-xs sm:text-sm"
          >
            {label}
          </Button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2 flex flex-col gap-1.5">
          <Label htmlFor="pilot-name">Nombre del piloto *</Label>
          <Input
            id="pilot-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre del piloto"
            className="text-base font-medium"
          />
        </div>

        <div className="sm:col-span-2 flex flex-col gap-1.5">
          <Label htmlFor="pilot-objective">Objetivo funcional</Label>
          <textarea
            id="pilot-objective"
            rows={4}
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
            placeholder="Describe el objetivo del piloto"
            className="flex min-h-[6rem] w-full resize-none overflow-y-auto rounded-md border border-[#D0D5DD] bg-white px-3 py-2 text-sm text-[#101828] placeholder:text-[#98A2B3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="trained-people">Participantes</Label>
          <Input
            id="trained-people"
            type="number"
            min={0}
            value={trainedPeople}
            onChange={(e) => setTrainedPeople(parseInt(e.target.value) || 0)}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="productivity-base">Mejora</Label>
          <Input
            id="productivity-base"
            type="number"
            min={-100}
            step={0.01}
            value={productivityBase}
            onChange={(e) => setProductivityBase(parseFloat(e.target.value) || 0)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3 sm:col-span-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="start-date">Desde</Label>
            <Input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="end-date">Hasta</Label>
            <Input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-3 rounded-md bg-[#FEF3F2] border border-[#FECDCA] px-3 py-2 text-sm text-[#DC2626]">
          {error}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowDeleteDialog(true)}
          className="text-[#DC2626] border-[#FECDCA] hover:bg-[#FEF3F2] hover:text-[#DC2626]"
        >
          <Trash2 className="h-4 w-4" />
          Eliminar piloto
        </Button>

        {isDirty && (
          <Button onClick={handleSave} disabled={isPending} size="sm">
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : success ? (
              "¡Guardado!"
            ) : (
              <>
                <Save className="h-4 w-4" />
                Guardar
              </>
            )}
          </Button>
        )}
      </div>
    </div>
    </>
  );
}
