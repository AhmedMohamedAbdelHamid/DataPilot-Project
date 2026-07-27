"use client";

import { motion } from "framer-motion";
import { Target } from "lucide-react";
import { PriorityBadge } from "@/components/shared/status-badge";
import type { DecisionRecommendation } from "@/lib/types";

export function RecommendationCard({ recommendation, index = 0 }: { recommendation: DecisionRecommendation; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05, ease: "easeOut" }}
      className="card-shadow rounded-2xl border border-border bg-card p-5 transition-shadow hover:card-shadow-hover"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Target className="size-[18px]" strokeWidth={2} />
          </div>
          <h3 className="text-[14.5px] font-semibold leading-snug text-foreground">{recommendation.title}</h3>
        </div>
        <PriorityBadge priority={recommendation.priority} className="shrink-0" />
      </div>

      <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">{recommendation.body}</p>

      {recommendation.basedOn.length > 0 && (
        <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-medium text-muted-foreground/70">Based on</span>
          {recommendation.basedOn.map((source) => (
            <span key={source} className="rounded-md bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
              {source}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}
