import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import {
  getGlobalKPIs,
  getParticipantsTimeline,
} from "@/lib/queries/kpis";
import {
  listPilots,
  getPilotsProductivityMap,
  getPilotsParticipantesMap,
} from "@/lib/queries/pilots";
import { PilotsTable, PilotsTableSkeleton } from "@/components/pilots-table";
import { PilotsTimeline } from "@/components/pilots-timeline";
import { ViewToggle } from "@/components/view-toggle";
import { PilotsFilters } from "@/components/pilots-filters";
import { AddPilotButton } from "@/components/add-pilot-button";
import { Topbar } from "@/components/topbar";
import { GlobalKPIsDisplay } from "@/components/global-kpis-display";
import type { PilotStatus } from "@/lib/types/database";

interface HomePageProps {
  searchParams: Promise<{ view?: string; status?: string }>;
}

async function GlobalKPIsSection() {
  const [kpis, participantsTimeline] = await Promise.all([
    getGlobalKPIs(),
    getParticipantsTimeline(),
  ]);
  return (
    <GlobalKPIsDisplay
      kpis={kpis}
      participantsTimeline={participantsTimeline}
    />
  );
}

async function PilotsViewSection({
  view,
  status,
}: {
  view: string;
  status: string;
}) {
  const [pilots, productivityMap, participantesMap] = await Promise.all([
    listPilots({ status: status as PilotStatus | "" }),
    getPilotsProductivityMap(),
    getPilotsParticipantesMap(),
  ]);
  if (view === "timeline")
    return <PilotsTimeline pilots={pilots} participantesMap={participantesMap} />;
  return (
    <PilotsTable
      pilots={pilots}
      productivityMap={productivityMap}
      participantesMap={participantesMap}
    />
  );
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
      <Topbar
        title={
          <>
            Pilotos IA{" "}
            <span className="text-xs font-normal opacity-70">v0.6</span>
          </>
        }
        userName={user?.user_metadata?.full_name ?? ""}
        userIdentifier={user?.user_metadata?.login_name ?? user?.email ?? ""}
        headerAction={<AddPilotButton />}
      >
        <ViewToggle />
        <PilotsFilters />
      </Topbar>

      <div className="mx-auto max-w-[1280px] space-y-4 px-4 py-4 sm:px-6 sm:py-5">
        <Suspense
          fallback={
            <div className="rounded-xl bg-[#0F4C81] p-4 sm:p-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="h-16 animate-pulse rounded-lg bg-white/20" />
                <div className="h-16 animate-pulse rounded-lg bg-white/20" />
                <div className="h-16 animate-pulse rounded-lg bg-white/20" />
              </div>
            </div>
          }
        >
          <GlobalKPIsSection />
        </Suspense>

        <section>
          <Suspense fallback={<PilotsTableSkeleton />}>
            <PilotsViewSection view={view} status={status} />
          </Suspense>
        </section>
      </div>
    </>
  );
}
