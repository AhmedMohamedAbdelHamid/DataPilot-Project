"use client";

import { motion } from "framer-motion";
import {
  Sparkles,
  Lightbulb,
  Waypoints,
  ThumbsUp,
  ShieldAlert,
  Rocket,
} from "lucide-react";
import type { AiInsightSection } from "@/lib/types";
import { cn } from "@/lib/utils";

const typeConfig: Record<
  AiInsightSection["type"],
  { icon: typeof Sparkles; className: string }
> = {
  summary: { icon: Sparkles, className: "bg-primary/10 text-primary" },
  finding: { icon: Lightbulb, className: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  pattern: { icon: Waypoints, className: "bg-violet-500/10 text-violet-600 dark:text-violet-400" },
  recommendation: { icon: ThumbsUp, className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  risk: { icon: ShieldAlert, className: "bg-destructive/10 text-destructive" },
  opportunity: { icon: Rocket, className: "bg-sky-500/10 text-sky-600 dark:text-sky-400" },
};

export function InsightCard({ insight, index = 0 }: { insight: AiInsightSection; index?: number }) {
  const config = typeConfig[insight.type];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05, ease: "easeOut" }}
      className="card-shadow rounded-2xl border border-border bg-card p-5 transition-shadow hover:card-shadow-hover"
    >
      <div className="flex items-start gap-3">
        <div className={cn("flex size-9 shrink-0 items-center justify-center rounded-xl", config.className)}>
          <Icon className="size-[18px]" strokeWidth={2} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-[14.5px] font-semibold text-foreground">{insight.title}</h3>
          <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">{insight.body}</p>
          {insight.tags && insight.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {insight.tags.map((tag) => (
                <span key={tag} className="rounded-md bg-muted px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
