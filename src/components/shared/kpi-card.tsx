"use client";

import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { kpiIconMap } from "@/lib/icon-map";
import type { KpiMetric } from "@/lib/types";

const toneStyles: Record<NonNullable<KpiMetric["tone"]>, string> = {
  default: "bg-secondary text-foreground",
  primary: "bg-primary/10 text-primary",
  success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  destructive: "bg-destructive/10 text-destructive",
};

export function KpiCard({ metric, index = 0 }: { metric: KpiMetric; index?: number }) {
  const Icon = kpiIconMap[metric.icon];
  const tone = metric.tone ?? "default";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04, ease: "easeOut" }}
      whileHover={{ y: -3 }}
      className="group card-shadow rounded-2xl border border-border bg-card p-5 transition-shadow hover:card-shadow-hover"
    >
      <div className="flex items-start justify-between">
        <div className={cn("flex size-10 items-center justify-center rounded-xl", toneStyles[tone])}>
          {Icon && <Icon className="size-5" strokeWidth={2} />}
        </div>
        {metric.trend && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-medium",
              metric.trend.isGood
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "bg-destructive/10 text-destructive"
            )}
          >
            {metric.trend.direction === "up" && <ArrowUpRight className="size-3" />}
            {metric.trend.direction === "down" && <ArrowDownRight className="size-3" />}
            {metric.trend.direction === "flat" && <Minus className="size-3" />}
            {metric.trend.value}
          </span>
        )}
      </div>

      <p className="mt-4 text-2xl font-semibold tracking-tight text-foreground">{metric.value}</p>
      <p className="mt-1 text-[13px] font-medium text-muted-foreground">{metric.label}</p>
      {metric.helpText && (
        <p className="mt-0.5 text-[11.5px] text-muted-foreground/70">{metric.helpText}</p>
      )}
    </motion.div>
  );
}
