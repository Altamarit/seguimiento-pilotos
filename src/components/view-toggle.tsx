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
    <div className="flex items-center rounded-full bg-[#F2F4F7] p-0.5">
      <button
        onClick={() => setView("list")}
        className={cn(
          "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors",
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
          "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors",
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
