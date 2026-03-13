import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getPilot } from "@/lib/queries/pilots";
import { listImpactEvents, countImpactEvents } from "@/lib/queries/impact-events";
import { getPilotKPIs } from "@/lib/queries/kpis";
import { PilotHeader } from "@/components/pilot-header";
import { ImpactEventsSection } from "@/components/impact-events-section";
import { Topbar } from "@/components/topbar";

interface PilotPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ view?: string; openEvent?: string }>;
}

export default async function PilotPage({ params, searchParams }: PilotPageProps) {
  const { id } = await params;
  const sp = await searchParams;
  const backView = sp?.view ?? "list";
  const shouldOpenEventModal = sp?.openEvent === "1";

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

  const impactEventsSection = (
    <ImpactEventsSection
      events={events}
      totalEvents={totalEvents}
      pilotId={id}
      initialOpen={shouldOpenEventModal}
    />
  );

  return (
    <>
      <Topbar
        title={pilot.name}
        userName={user?.user_metadata?.full_name ?? ""}
        userIdentifier={user?.user_metadata?.login_name ?? user?.email ?? ""}
      />

      <div className="mx-auto max-w-[1280px] px-6 py-6 space-y-5">
        <Link
          href={`/?view=${backView}`}
          className="inline-flex items-center gap-1.5 text-sm text-[#667085] hover:text-[#101828] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a pilotos
        </Link>

        <PilotHeader pilot={pilot} />

        {events.length > 0 ? impactEventsSection : null}

        <div className="rounded-xl bg-[#0F4C81] p-4 sm:p-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="text-center">
              <p className="text-xs font-medium tracking-wider text-white/80 sm:text-sm">
                Participantes
              </p>
              <p className="mt-1 text-2xl font-semibold text-white sm:text-3xl">
                {kpis.trainedPeopleCount}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs font-medium tracking-wider text-white/80 sm:text-sm">
                Mejora
              </p>
              <p className="mt-1 text-2xl font-semibold text-white sm:text-3xl">
                {kpis.productivityImprovementPct !== null
                  ? `${kpis.productivityImprovementPct} %`
                  : "—"}
              </p>
            </div>
          </div>
        </div>

        {events.length === 0 ? impactEventsSection : null}
      </div>
    </>
  );
}
