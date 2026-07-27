"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { navItems, settingsNavItem } from "@/lib/nav-config";
import { cn } from "@/lib/utils";
import { Gauge } from "lucide-react";

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 px-5 pt-6 pb-4">
        <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm shadow-primary/30">
          <Gauge className="size-5" strokeWidth={2.25} />
        </div>
        <div className="leading-tight">
          <p className="text-[15px] font-semibold tracking-tight text-foreground">DataPilot</p>
          <p className="text-[11px] text-muted-foreground">AI Insight Studio</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2" aria-label="Primary">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-medium transition-colors",
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
              )}
            >
              {active && (
                <motion.span
                  layoutId="sidebar-active-pill"
                  className="absolute inset-0 rounded-xl bg-secondary"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              <Icon className="relative z-10 size-[18px] shrink-0" strokeWidth={2} />
              <span className="relative z-10">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pb-4 pt-2">
        <Link
          href={settingsNavItem.href}
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-medium text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
        >
          <settingsNavItem.icon className="size-[18px] shrink-0" strokeWidth={2} />
          Settings
        </Link>

        <div className="mt-3 rounded-2xl border border-border bg-gradient-to-br from-secondary/70 to-transparent p-3.5">
          <p className="text-[12.5px] font-semibold text-foreground">Free plan</p>
          <p className="mt-0.5 text-[11.5px] leading-snug text-muted-foreground">
            3 of 5 datasets analyzed this month.
          </p>
        </div>
      </div>
    </div>
  );
}
