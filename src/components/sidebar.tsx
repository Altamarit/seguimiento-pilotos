"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRole } from "@/hooks/use-role";

const navItems = [
  { href: "/", label: "Pilotos", icon: BarChart3 },
];

const adminItems = [
  { href: "/admin", label: "Administración", icon: ShieldCheck },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isAdmin } = useRole();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/" || pathname.startsWith("/pilots");
    return pathname.startsWith(href);
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-60 border-r border-[#E4E7EC] bg-white flex flex-col z-30">
      <div className="flex h-16 items-center border-b border-[#E4E7EC] px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EFF4FF]">
            <span className="text-sm font-bold text-[#2563EB]">IA</span>
          </div>
          <span className="text-sm font-semibold text-[#101828]">Pilotos IA</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="flex flex-col gap-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-[#EFF4FF] text-[#2563EB] font-medium"
                    : "text-[#667085] hover:bg-[#F5F5F7] hover:text-[#101828]"
                )}
              >
                <Icon
                  className={cn("h-4 w-4", active ? "text-[#2563EB]" : "text-[#98A2B3]")}
                />
                {item.label}
              </Link>
            );
          })}
        </div>

        {isAdmin && (
          <div className="mt-4 border-t border-[#E4E7EC] pt-4">
            <p className="mb-1 px-3 text-[11px] font-medium uppercase tracking-wider text-[#98A2B3]">
              Sistema
            </p>
            {adminItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-[#EFF4FF] text-[#2563EB] font-medium"
                      : "text-[#667085] hover:bg-[#F5F5F7] hover:text-[#101828]"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4",
                      active ? "text-[#2563EB]" : "text-[#98A2B3]"
                    )}
                  />
                  {item.label}
                </Link>
              );
            })}
          </div>
        )}
      </nav>
    </aside>
  );
}
