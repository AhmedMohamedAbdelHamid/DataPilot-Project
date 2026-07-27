"use client";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { ChartRecommendationCard } from "@/components/shared/chart-card";
import { EmptyState } from "@/components/shared/empty-state";
import { NoDatasetState } from "@/components/shared/no-dataset-state";
import { useActiveDataset } from "@/lib/dataset-store";
import { BarChart3 } from "lucide-react";

export default function ChartsPage() {
  const { profile } = useActiveDataset();

  if (!profile) {
    return (
      <DashboardShell title="Charts">
        <NoDatasetState description="Upload a dataset to get chart recommendations based on its column types." />
      </DashboardShell>
    );
  }

  const chartRecommendations = profile.chartRecommendations;

  return (
    <DashboardShell title="Charts">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Recommended visualizations</h1>
        <p className="mt-1.5 max-w-2xl text-[13.5px] text-muted-foreground">
          Based on your column types and relationships, DataPilot recommends the following charts —
          ranked by confidence.
        </p>
      </div>

      {chartRecommendations.length > 0 ? (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {chartRecommendations.map((rec, i) => (
            <ChartRecommendationCard key={rec.id} recommendation={rec} index={i} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={BarChart3}
          title="Not enough columns to recommend charts"
          description="Upload a dataset with at least one categorical or numeric column to get chart suggestions."
          className="mt-6"
        />
      )}
    </DashboardShell>
  );
}
