"use client";

import * as React from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { IssueCard } from "@/components/shared/issue-card";
import { QualityScoreCard } from "@/components/shared/quality-score-card";
import { EmptyState } from "@/components/shared/empty-state";
import { NoDatasetState } from "@/components/shared/no-dataset-state";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useActiveDataset, useCleaningProposals } from "@/lib/dataset-store";
import type { Severity } from "@/lib/types";
import { ShieldCheck } from "lucide-react";

const filters: { value: Severity | "all"; label: string }[] = [
  { value: "all", label: "All issues" },
  { value: "critical", label: "Critical" },
  { value: "warning", label: "Warning" },
  { value: "info", label: "Info" },
];

export default function DataQualityPage() {
  const { profile } = useActiveDataset();
  const { updateIssueStatus } = useCleaningProposals();
  const [filter, setFilter] = React.useState<Severity | "all">("all");

  if (!profile) {
    return (
      <DashboardShell title="Data Quality">
        <NoDatasetState description="Upload a dataset to see missing values, duplicates, outliers, and other quality findings." />
      </DashboardShell>
    );
  }

  const dataIssues = profile.issues;

  const filtered = dataIssues.filter((issue) => filter === "all" || issue.severity === filter);
  const counts = {
    critical: dataIssues.filter((i) => i.severity === "critical").length,
    warning: dataIssues.filter((i) => i.severity === "warning").length,
    info: dataIssues.filter((i) => i.severity === "info").length,
  };
  const reviewCounts = {
    approved: dataIssues.filter((i) => i.status === "approved").length,
    rejected: dataIssues.filter((i) => i.status === "rejected").length,
    pending: dataIssues.filter((i) => i.status === "pending").length,
  };

  return (
    <DashboardShell title="Data Quality">
      <div className="flex flex-col gap-1.5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Data quality</h1>
          <p className="mt-1 text-[13.5px] text-muted-foreground">
            {dataIssues.length === 0
              ? "No issues found in this dataset."
              : `${dataIssues.length} issue${dataIssues.length === 1 ? "" : "s"} found across ${new Set(dataIssues.flatMap((i) => i.affectedColumns)).size} columns — ${counts.critical} critical, ${counts.warning} warnings, ${counts.info} informational.`}
          </p>
          {dataIssues.length > 0 && (
            <p className="mt-0.5 text-[12.5px] text-muted-foreground/80">
              Review progress: {reviewCounts.approved} approved, {reviewCounts.rejected} rejected, {reviewCounts.pending} awaiting review.
              Approving a fix records your decision only — DataPilot never changes your data automatically.
            </p>
          )}
        </div>
      </div>

      <QualityScoreCard qualityScore={profile.qualityScore} className="mt-5" />

      <Tabs value={filter} onValueChange={(v) => setFilter(v as Severity | "all")} className="mt-6">
        <TabsList>
          {filters.map((f) => (
            <TabsTrigger key={f.value} value={f.value} className="text-[13px]">
              {f.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {filtered.length > 0 ? (
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {filtered.map((issue, i) => (
            <IssueCard key={issue.id} issue={issue} index={i} onStatusChange={updateIssueStatus} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={ShieldCheck}
          title="No issues in this category"
          description="Nice — nothing to fix here. Try a different filter to see other findings."
          className="mt-5"
        />
      )}
    </DashboardShell>
  );
}
