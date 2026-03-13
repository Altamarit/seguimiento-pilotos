"use client";

import { useQueryState } from "nuqs";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const FILTER_OPTIONS = [
  { label: "All", value: "" },
  { label: "Planificados", value: "planificado" },
  { label: "Activos", value: "en_marcha" },
  { label: "Finalizados", value: "finalizado" },
  { label: "Cancelados", value: "cancelado" },
] as const;

export function PilotsFilters() {
  const [status, setStatus] = useQueryState("status", {
    defaultValue: "",
    shallow: false,
  });

  return (
    <div className="pilots-filters flex flex-wrap gap-1">
      {FILTER_OPTIONS.map(({ label, value }) => (
        <Button
          key={value || "all"}
          variant={status === value ? "default" : "outline"}
          size="sm"
          onClick={() => setStatus(value)}
          className={cn(
            "h-8 text-xs sm:text-sm",
            status === value
              ? "bg-white text-[#0F4C81] hover:bg-white/90"
              : "border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
          )}
        >
          {label}
        </Button>
      ))}
    </div>
  );
}
