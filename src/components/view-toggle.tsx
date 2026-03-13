"use client";

import { useQueryState } from "nuqs";
import { LayoutList, GanttChart } from "lucide-react";
import { cn } from "@/lib/utils";

export type ViewMode = "list" | "timeline";

export function ViewToggle() {
  const [view, setView] = useQueryState("view", {
    defaultValue: "list" as ViewMode,
    shallow: false,
  });

  return (
    <div className="flex w-full items-center rounded-full bg-[#F2F4F7] p-0.5 sm:w-auto">
      <button
        onClick={() => setView("list")}
        className={cn(
          "flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors sm:flex-none",
          view === "list"
            ? "bg-white font-semibold text-[#101828] shadow-sm"
            : "text-[#667085] hover:text-[#101828]"
        )}
      >
        <LayoutList className="h-3.5 w-3.5" />
        Lista
      </button>
      <button
        onClick={() => setView("timeline")}
        className={cn(
          "flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors sm:flex-none",
          view === "timeline"
            ? "bg-white font-semibold text-[#101828] shadow-sm"
            : "text-[#667085] hover:text-[#101828]"
        )}
      >
        <GanttChart className="h-3.5 w-3.5" />
        Cronológica
      </button>
    </div>
  );
}
