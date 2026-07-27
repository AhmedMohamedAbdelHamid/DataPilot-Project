"use client";

import Link from "next/link";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { KpiCard } from "@/components/shared/kpi-card";
import { NoDatasetState } from "@/components/shared/no-dataset-state";
import { Button } from "@/components/ui/button";
import { useActiveDataset } from "@/lib/dataset-store";
import { FileSpreadsheet, ArrowRight, ShieldCheck, BarChart3, Sparkles } from "lucide-react";

export default function DashboardPage() {
  const { profile } = useActiveDataset();

  if (!profile) {
    return (
      <DashboardShell title="Dashboard">
        <NoDatasetState />
      </DashboardShell>
    );
  }

  const { summary, kpis, issues, chartRecommendations, insights, qualityScore } = profile;

  const criticalCount = issues.filter((i) => i.severity === "critical").length;
  const warningCount = issues.filter((i) => i.severity === "warning").length;
  const infoCount = issues.filter((i) => i.severity === "info").length;
  const findingCount = insights.filter((i) => i.type === "finding" || i.type === "pattern").length;

  const nextSteps = [
    {
      href: "/data-quality",
      icon: ShieldCheck,
      title: "Review data quality",
      description:
        issues.length === 0
          ? `Quality score ${qualityScore.score}/100 (${qualityScore.grade}) — no issues found.`
          : `Quality score ${qualityScore.score}/100 (${qualityScore.grade}) — ${issues.length} issue${issues.length === 1 ? "" : "s"} found across ${criticalCount} critical, ${warningCount} warning${warningCount === 1 ? "" : "s"}, ${infoCount} info.`,
    },
    {
      href: "/charts",
      icon: BarChart3,
      title: "Explore recommended charts",
      description: `${chartRecommendations.length} visualization${chartRecommendations.length === 1 ? "" : "s"} suggested based on your columns.`,
    },
    {
      href: "/insights",
      icon: Sparkles,
      title: "Read AI insights",
      description: `Summary and ${findingCount} key finding${findingCount === 1 ? "" : "s"} ready.`,
    },
  ];

  return (
    <DashboardShell title="Dashboard">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <FileSpreadsheet className="size-5" strokeWidth={1.75} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[17px] font-semibold tracking-tight text-foreground">
                {summary.name}
              </h1>
            </div>
            <p className="text-[12.5px] text-muted-foreground">
              Uploaded {summary.uploadedAt} · {summary.fileSize}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/upload" />}>
            Upload new dataset
          </Button>
          <Button size="sm" nativeButton={false} render={<Link href="/reports" />}>
            Export report
          </Button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {kpis.map((metric, i) => (
          <KpiCard key={metric.id} metric={metric} index={i} />
        ))}
      </div>

      <div className="mt-10">
        <h2 className="text-[14px] font-semibold text-foreground">Next steps</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-3">
          {nextSteps.map((step) => (
            <Link
              key={step.href}
              href={step.href}
              className="card-shadow group flex flex-col rounded-2xl border border-border bg-card p-5 transition-shadow hover:card-shadow-hover"
            >
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <step.icon className="size-5" strokeWidth={1.9} />
              </div>
              <h3 className="mt-3.5 text-[14px] font-semibold text-foreground">{step.title}</h3>
              <p className="mt-1 text-[12.5px] leading-relaxed text-muted-foreground">{step.description}</p>
              <span className="mt-3.5 inline-flex items-center gap-1 text-[12.5px] font-medium text-primary">
                View <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}
