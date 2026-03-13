import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { getGlobalKPIs } from "@/lib/queries/kpis";
import { listPilots } from "@/lib/queries/pilots";
import { KpiCard, KpiCardSkeleton } from "@/components/kpi-card";
import { PilotsTable, PilotsTableSkeleton } from "@/components/pilots-table";
import { PilotsTimeline } from "@/components/pilots-timeline";
import { ViewToggle } from "@/components/view-toggle";
import { PilotsFilters } from "@/components/pilots-filters";
import { AddPilotButton } from "@/components/add-pilot-button";
import { Topbar } from "@/components/topbar";
import type { PilotStatus } from "@/lib/types/database";

interface HomePageProps {
  searchParams: Promise<{ view?: string; status?: string }>;
}

async function GlobalKPIsSection() {
  const kpis = await getGlobalKPIs();
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <KpiCard label="Pilotos activos" value={kpis.activePilots} />
      <KpiCard
        label="Personas formadas"
        value={kpis.totalTrainedPeople}
        subtext="Total acumulado"
      />
      <KpiCard
        label="Mejora productividad"
        value={
          kpis.avgProductivityImprovement !== null
            ? `${kpis.avgProductivityImprovement.toFixed(1)} %`
            : "—"
        }
        subtext="Media entre pilotos"
      />
    </div>
  );
}

async function PilotsViewSection({
  view,
  status,
}: {
  view: string;
  status: string;
}) {
  const pilots = await listPilots({ status: status as PilotStatus | "" });
  if (view === "timeline") return <PilotsTimeline pilots={pilots} />;
  return <PilotsTable pilots={pilots} />;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const params = await searchParams;
  const view = params?.view ?? "list";
  const status = params?.status ?? "";

  return (
    <>
      <Topbar title="Pilotos IA" userName={user?.user_metadata?.full_name ?? ""} userEmail={user?.email ?? ""}>
        <PilotsFilters />
        <ViewToggle />
        <AddPilotButton />
      </Topbar>

      <div className="mx-auto max-w-[1280px] px-6 py-6 space-y-6">
        <Suspense
          fallback={
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <KpiCardSkeleton />
              <KpiCardSkeleton />
              <KpiCardSkeleton />
            </div>
          }
        >
          <GlobalKPIsSection />
        </Suspense>

        <Suspense fallback={<PilotsTableSkeleton />}>
          <PilotsViewSection view={view} status={status} />
        </Suspense>
      </div>
    </>
  );
}
