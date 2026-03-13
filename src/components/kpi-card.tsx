interface KpiCardProps {
  label: string;
  value: string | number;
  delta?: string;
  subtext?: string;
}

export function KpiCard({ label, value, delta, subtext }: KpiCardProps) {
  return (
    <div className="rounded-lg border border-[#E4E7EC] bg-white p-3 shadow-card sm:p-4">
      <p className="text-xs font-medium text-[#667085] uppercase tracking-wide">
        {label}
      </p>
      <div className="mt-2 flex items-end justify-between gap-2">
        <p className="text-xl font-semibold text-[#101828] sm:text-2xl">{value}</p>
        {delta && (
          <span className="mb-0.5 rounded-full bg-[#EFF4FF] px-2 py-0.5 text-xs font-medium text-[#2563EB]">
            {delta}
          </span>
        )}
      </div>
      {subtext && <p className="mt-1 text-xs text-[#667085]">{subtext}</p>}
    </div>
  );
}

export function KpiCardSkeleton() {
  return (
    <div className="rounded-lg border border-[#E4E7EC] bg-white p-3 shadow-card sm:p-4">
      <div className="h-3 w-24 animate-pulse rounded bg-[#E4E7EC]" />
      <div className="mt-2 h-8 w-16 animate-pulse rounded bg-[#E4E7EC]" />
    </div>
  );
}
