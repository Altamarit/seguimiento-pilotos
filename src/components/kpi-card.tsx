interface KpiCardProps {
  label: string;
  value: string | number;
  delta?: string;
  subtext?: string;
}

export function KpiCard({ label, value, delta, subtext }: KpiCardProps) {
  return (
    <div className="rounded-lg border border-[#E4E7EC] bg-white p-2.5 shadow-card sm:p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-medium tracking-tight text-[#667085] sm:text-xs sm:tracking-wide shrink-0">
          {label}
        </p>
        <p className="text-base font-semibold text-[#101828] text-center flex-1 sm:text-xl">{value}</p>
        {delta && (
          <span className="rounded-full bg-[#EFF4FF] px-2 py-0.5 text-xs font-medium text-[#2563EB] shrink-0">
            {delta}
          </span>
        )}
      </div>
      {subtext && <p className="mt-1 hidden text-xs text-[#667085] sm:block">{subtext}</p>}
    </div>
  );
}

export function KpiCardSkeleton() {
  return (
    <div className="rounded-lg border border-[#E4E7EC] bg-white p-2.5 shadow-card sm:p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="h-3 w-16 animate-pulse rounded bg-[#E4E7EC]" />
        <div className="h-6 w-10 animate-pulse rounded bg-[#E4E7EC] sm:h-7 sm:w-12" />
      </div>
    </div>
  );
}
