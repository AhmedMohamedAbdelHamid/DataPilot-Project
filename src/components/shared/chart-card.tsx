"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ConfidenceMeter } from "@/components/shared/metric-badge";
import { chartTypeIconMap } from "@/lib/icon-map";
import type { ChartRecommendation } from "@/lib/types";
import { ChartPreview } from "@/components/shared/chart-preview";
import { ChartRenderDialog } from "@/components/shared/chart-render-dialog";
import { ArrowRight } from "lucide-react";

export function ChartRecommendationCard({
  recommendation,
  index = 0,
}: {
  recommendation: ChartRecommendation;
  index?: number;
}) {
  const Icon = chartTypeIconMap[recommendation.chartType];
  const [open, setOpen] = React.useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05, ease: "easeOut" }}
      whileHover={{ y: -3 }}
      className="card-shadow flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:card-shadow-hover"
    >
      <div className="flex h-36 items-center justify-center border-b border-border bg-secondary/40 p-4">
        <ChartPreview type={recommendation.chartType} />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              {Icon && <Icon className="size-4" strokeWidth={2.25} />}
            </div>
            <h3 className="text-[14.5px] font-semibold text-foreground">{recommendation.title}</h3>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {recommendation.columns.map((col) => (
            <span
              key={col}
              className="rounded-md bg-muted px-2 py-0.5 font-mono text-[11px] text-muted-foreground"
            >
              {col}
            </span>
          ))}
        </div>

        <p className="text-[12.5px] leading-relaxed text-muted-foreground">{recommendation.reason}</p>

        <p className="text-[12px] leading-relaxed text-muted-foreground/80">
          <span className="font-medium text-foreground/80">Best for: </span>
          {recommendation.bestUseCase}
        </p>

        <div className="mt-auto flex items-center justify-between pt-2">
          <ConfidenceMeter value={recommendation.confidence} />
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1 px-2.5 text-[12.5px] text-primary hover:text-primary"
            onClick={() => setOpen(true)}
          >
            Generate <ArrowRight className="size-3.5" />
          </Button>
        </div>
      </div>

      <ChartRenderDialog open={open} onOpenChange={setOpen} recommendation={recommendation} />
    </motion.div>
  );
}
