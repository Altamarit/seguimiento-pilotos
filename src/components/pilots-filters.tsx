"use client";

import { useQueryState } from "nuqs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function PilotsFilters() {
  const [status, setStatus] = useQueryState("status", { defaultValue: "" });

  return (
    <div className="w-full sm:w-auto">
      <Select value={status} onValueChange={(v) => setStatus(v === "all" ? "" : v)}>
        <SelectTrigger className="h-9 w-full text-sm sm:w-40">
          <SelectValue placeholder="Todos los estados" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los estados</SelectItem>
          <SelectItem value="planificado">Planificado</SelectItem>
          <SelectItem value="en_marcha">En marcha</SelectItem>
          <SelectItem value="finalizado">Finalizado</SelectItem>
          <SelectItem value="cancelado">Cancelado</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
