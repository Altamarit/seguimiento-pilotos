"use client";

import { useState, useTransition } from "react";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createPilot } from "@/lib/actions/pilot-actions";
import { useRole } from "@/hooks/use-role";

export function AddPilotButton() {
  const { canEdit } = useRole();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!canEdit) return null;

  function handleClick() {
    setError(null);
    startTransition(async () => {
      try {
        await createPilot();
      } catch (e) {
        if (e instanceof Error && e.message !== "NEXT_REDIRECT") {
          setError("Error al crear el piloto");
        }
      }
    });
  }

  return (
    <div>
      <Button onClick={handleClick} disabled={isPending} size="sm">
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Plus className="h-4 w-4" />
        )}
        Añadir piloto
      </Button>
      {error && <p className="mt-1 text-xs text-[#DC2626]">{error}</p>}
    </div>
  );
}
