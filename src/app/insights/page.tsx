"use client";

import * as React from "react";
import { InsightCard } from "@/components/shared/insight-card";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { NoDatasetState } from "@/components/shared/no-dataset-state";
import { useActiveDataset } from "@/lib/dataset-store";
import type { AiInsightSection } from "@/lib/types";
import { Sparkles } from "lucide-react";

const sectionMeta: Record<AiInsightSection["type"], string> = {
  summary: "Executive Summary",
  finding: "Key Findings",
  pattern: "Interesting Patterns",
  recommendation: "Business Recommendations",
  risk: "Risk Factors",
  opportunity: "Opportunities",
};

const order: AiInsightSection["type"][] = [
  "summary",
  "finding",
  "pattern",
  "recommendation",
  "risk",
  "opportunity",
];

export default function InsightsPage() {
  const { profile } = useActiveDataset();

  if (!profile) {
    return (
      <DashboardShell title="AI Insights">
        <NoDatasetState description="Upload a dataset to generate an executive summary, key findings, and recommendations." />
      </DashboardShell>
    );
  }

  const grouped = order.map((type) => ({
    type,
    label: sectionMeta[type],
    items: profile.insights.filter((i) => i.type === type),
  })).filter((g) => g.items.length > 0);

  return (
    <DashboardShell title="AI Insights">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Sparkles className="size-5" strokeWidth={1.9} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">AI insights</h1>
            <p className="mt-0.5 text-[13.5px] text-muted-foreground">
              Generated automatically from your dataset — grounded in the statistics DataPilot computed.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 space-y-10">
        {grouped.map((group) => (
          <section key={group.type}>
            <h2 className="text-[13px] font-semibold uppercase tracking-wide text-muted-foreground">
              {group.label}
            </h2>
            <div
              className={
                group.type === "summary"
                  ? "mt-3 grid gap-4"
                  : "mt-3 grid gap-4 lg:grid-cols-2"
              }
            >
              {group.items.map((insight, i) => (
                <InsightCard key={insight.id} insight={insight} index={i} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </DashboardShell>
  );
}
