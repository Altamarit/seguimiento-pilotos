"use client";

import { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { GlobalKPIs, ParticipantsTimelinePoint } from "@/lib/queries/kpis";
import type { PilotStatus } from "@/lib/types/database";

const STATUS_ORDER: PilotStatus[] = [
  "planificado",
  "en_marcha",
  "finalizado",
  "cancelado",
];

const STATUS_LABELS: Record<PilotStatus, string> = {
  planificado: "Planificado",
  en_marcha: "En marcha",
  finalizado: "Finalizado",
  cancelado: "Cancelado",
};

const CHART_COLORS = ["#0F4C81", "#3B82F6", "#10B981", "#F59E0B"];

interface GlobalKPIsDisplayProps {
  kpis: GlobalKPIs;
  participantsTimeline: ParticipantsTimelinePoint[];
}

export function GlobalKPIsDisplay({
  kpis,
  participantsTimeline,
}: GlobalKPIsDisplayProps) {
  const [pilotsModalOpen, setPilotsModalOpen] = useState(false);
  const [participantsModalOpen, setParticipantsModalOpen] = useState(false);

  const pieData = STATUS_ORDER.map((status) => ({
    name: STATUS_LABELS[status],
    value: kpis.pilotsByStatus[status] ?? 0,
    status,
  })).filter((d) => d.value > 0);

  return (
    <div className="rounded-xl bg-[#0F4C81] p-4 sm:p-6">
      <div className="grid grid-cols-3 gap-4 sm:gap-6">
        <button
          type="button"
          onClick={() => setPilotsModalOpen(true)}
          className="text-center transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-white/50 rounded-lg"
        >
          <p className="text-xs font-medium tracking-wider text-white/80 sm:text-sm">
            Pilotos Activos/All
          </p>
          <p className="mt-1 text-2xl font-semibold text-white sm:text-3xl">
            {kpis.activeAndFinishedPilots}/{kpis.totalPilots}
          </p>
        </button>

        <button
          type="button"
          onClick={() => setParticipantsModalOpen(true)}
          className="text-center transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-white/50 rounded-lg"
        >
          <p className="text-xs font-medium tracking-wider text-white/80 sm:text-sm">
            Participantes
          </p>
          <p className="mt-1 text-2xl font-semibold text-white sm:text-3xl">
            {kpis.totalTrainedPeople}
          </p>
        </button>

        <div className="text-center">
          <p className="text-xs font-medium tracking-wider text-white/80 sm:text-sm">
            Max. mejora
          </p>
          <p className="mt-1 text-2xl font-semibold text-white sm:text-3xl">
            {kpis.avgProductivityImprovement !== null
              ? `${kpis.avgProductivityImprovement.toFixed(1)} %`
              : "—"}
          </p>
        </div>
      </div>

      <Dialog open={pilotsModalOpen} onOpenChange={setPilotsModalOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Pilotos por estado</DialogTitle>
          </DialogHeader>
          <div className="h-[320px] w-full">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="45%"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    nameKey="name"
                    label={({ percent }) =>
                      `${((percent ?? 0) * 100).toFixed(0)}%`
                    }
                  >
                    {pieData.map((d) => (
                      <Cell
                        key={d.status}
                        fill={
                          CHART_COLORS[
                            STATUS_ORDER.indexOf(d.status) % CHART_COLORS.length
                          ]
                        }
                      />
                    ))}
                  </Pie>
                  <Legend
                    layout="horizontal"
                    align="center"
                    verticalAlign="bottom"
                    formatter={(value) => {
                      const item = pieData.find((d) => d.name === value);
                      return item ? `${value} (${item.value})` : value;
                    }}
                  />
                  <Tooltip
                    formatter={(value) => [value ?? 0, "Pilotos"]}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid #E4E7EC",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="flex h-full items-center justify-center text-sm text-[#667085]">
                No hay datos de pilotos
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={participantsModalOpen}
        onOpenChange={setParticipantsModalOpen}
      >
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>Progresión de participantes en el tiempo</DialogTitle>
          </DialogHeader>
          <div className="h-[280px] w-full">
            {participantsTimeline.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={participantsTimeline}
                  margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E4E7EC" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11 }}
                    tickFormatter={(v) =>
                      new Date(v).toLocaleDateString("es-ES", {
                        day: "2-digit",
                        month: "short",
                        year: "2-digit",
                      })
                    }
                  />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(value) => [value ?? 0, "Participantes"]}
                    labelFormatter={(label) =>
                      new Date(label).toLocaleDateString("es-ES", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })
                    }
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid #E4E7EC",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="count"
                    name="Participantes"
                    stroke="#0F4C81"
                    strokeWidth={2}
                    dot={{ fill: "#0F4C81", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="flex h-full items-center justify-center text-sm text-[#667085]">
                No hay datos de progresión
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
