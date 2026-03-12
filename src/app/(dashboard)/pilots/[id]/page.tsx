import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getPilot } from "@/lib/queries/pilots";
import { listImpactEvents, countImpactEvents } from "@/lib/queries/impact-events";
import { getPilotKPIs } from "@/lib/queries/kpis";
import { PilotHeader } from "@/components/pilot-header";
import { KpiCard } from "@/components/kpi-card";
import { ImpactEventsSection } from "@/components/impact-events-section";
import { Topbar } from "@/components/topbar";

interface PilotPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ view?: string }>;
}

export default async function PilotPage({ params, searchParams }: PilotPageProps) {
  const { id } = await params;
  const sp = await searchParams;
  const backView = sp?.view ?? "list";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [pilot, events, totalEvents, kpis] = await Promise.all([
    getPilot(id),
    listImpactEvents(id),
    countImpactEvents(id),
    getPilotKPIs(id),
  ]);

  if (!pilot) notFound();

  return (
    <>
      <Topbar title={pilot.name} userEmail={user?.email ?? ""} />

      <div className="mx-auto max-w-[1280px] px-6 py-6 space-y-5">
        <Link
          href={`/?view=${backView}`}
          className="inline-flex items-center gap-1.5 text-sm text-[#667085] hover:text-[#101828] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a pilotos
        </Link>

        <PilotHeader pilot={pilot} />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <KpiCard
            label="Personas formadas (piloto)"
            value={kpis.trainedPeopleCount}
            subtext="Dato manual del piloto"
          />
          <KpiCard
            label="Mejora de productividad"
            value={
              kpis.productivityImprovementPct !== null
                ? `${kpis.productivityImprovementPct} %`
                : "—"
            }
            subtext="Último valor registrado"
          />
        </div>

        <ImpactEventsSection
          events={events}
          totalEvents={totalEvents}
          pilotId={id}
        />
      </div>
    </>
  );
}
