"use client";

import * as React from "react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { LabeledProgress } from "@/components/shared/labeled-progress";
import { NoDatasetState } from "@/components/shared/no-dataset-state";
import { reportSections as initialSections } from "@/lib/report-config";
import { useActiveDataset } from "@/lib/dataset-store";
import { downloadBlob, generateDocxReport, generatePdfReport } from "@/lib/report-generator";
import { FileText, Download, Share2, FileType2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ReportsPage() {
  const { profile } = useActiveDataset();
  const [sections, setSections] = React.useState(initialSections);
  const [exporting, setExporting] = React.useState<"pdf" | "docx" | null>(null);
  const [progress, setProgress] = React.useState(0);

  const includedCount = sections.filter((s) => s.included).length;

  const toggleSection = (id: string) => {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, included: !s.included } : s)));
  };

  if (!profile) {
    return (
      <DashboardShell title="Reports">
        <NoDatasetState description="Upload a dataset to build and export a decision brief from its findings." />
      </DashboardShell>
    );
  }

  const datasetSummary = profile.summary;

  const runExport = async (format: "pdf" | "docx") => {
    if (exporting) return;
    setExporting(format);
    setProgress(15);

    const progressTimer = setInterval(() => {
      setProgress((p) => (p < 85 ? p + Math.random() * 12 + 4 : p));
    }, 150);

    const baseName = datasetSummary.name.replace(/\.(csv|tsv)$/i, "");

    try {
      if (format === "pdf") {
        const blob = generatePdfReport(profile, sections);
        downloadBlob(blob, `${baseName}-report.pdf`);
      } else {
        const blob = await generateDocxReport(profile, sections);
        downloadBlob(blob, `${baseName}-report.docx`);
      }
      clearInterval(progressTimer);
      setProgress(100);
      setTimeout(() => {
        setExporting(null);
        toast.success(`Report exported as ${format.toUpperCase()}`, {
          description: `${baseName}-report.${format}`,
        });
      }, 250);
    } catch (err) {
      clearInterval(progressTimer);
      setExporting(null);
      toast.error("Couldn't generate the report", {
        description: err instanceof Error ? err.message : "Please try again.",
      });
    }
  };

  return (
    <DashboardShell title="Reports">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Export report</h1>
        <p className="mt-1.5 max-w-2xl text-[13.5px] text-muted-foreground">
          Generate a reproducible report documenting your dataset&apos;s statistics, quality
          findings, and AI insights.
        </p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.3fr]">
        <div className="space-y-6">
          <div className="card-shadow rounded-2xl border border-border bg-card p-5">
            <h2 className="text-[13.5px] font-semibold text-foreground">Included sections</h2>
            <p className="mt-0.5 text-[12px] text-muted-foreground">{includedCount} of {sections.length} sections selected</p>

            <ul className="mt-4 space-y-1">
              {sections.map((section) => (
                <li
                  key={section.id}
                  className="flex items-start justify-between gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-secondary/50"
                >
                  <div className="min-w-0">
                    <Label htmlFor={section.id} className="text-[13px] font-medium text-foreground">
                      {section.title}
                    </Label>
                    <p className="mt-0.5 text-[12px] leading-snug text-muted-foreground">{section.description}</p>
                  </div>
                  <Switch
                    id={section.id}
                    checked={section.included}
                    onCheckedChange={() => toggleSection(section.id)}
                    className="mt-0.5 shrink-0"
                  />
                </li>
              ))}
            </ul>
          </div>

          <div className="card-shadow rounded-2xl border border-border bg-card p-5">
            <h2 className="text-[13.5px] font-semibold text-foreground">Export</h2>

            {exporting ? (
              <div className="mt-4">
                <LabeledProgress value={progress} label={`Preparing ${exporting.toUpperCase()}…`} />
              </div>
            ) : (
              <div className="mt-4 flex flex-col gap-2.5">
                <Button className="justify-start gap-2.5" onClick={() => runExport("pdf")}>
                  <Download className="size-4" /> Download PDF
                </Button>
                <Button variant="outline" className="justify-start gap-2.5" onClick={() => runExport("docx")}>
                  <FileType2 className="size-4" /> Download DOCX
                </Button>
                <Button
                  variant="ghost"
                  className="justify-start gap-2.5 text-muted-foreground hover:text-foreground"
                  onClick={() => toast("Share link copied to clipboard")}
                >
                  <Share2 className="size-4" /> Share report
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="card-shadow rounded-2xl border border-border bg-card p-6 sm:p-8">
          <div className="flex items-center gap-2 border-b border-border pb-4">
            <FileText className="size-4 text-muted-foreground" />
            <span className="text-[12px] font-medium text-muted-foreground">Report preview</span>
          </div>

          <div className="mt-5 max-h-[600px] space-y-6 overflow-y-auto pr-1">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-primary">DataPilot Report</p>
              <h3 className="mt-1 text-xl font-semibold text-foreground">{datasetSummary.name}</h3>
              <p className="mt-1 text-[12px] text-muted-foreground">
                Generated {datasetSummary.uploadedAt} · {datasetSummary.rows.toLocaleString()} rows · {datasetSummary.columns} columns
              </p>
            </div>

            {sections.map((section) => (
              <div
                key={section.id}
                className={cn("border-l-2 pl-4 transition-opacity", section.included ? "border-primary/40 opacity-100" : "border-border opacity-40")}
              >
                <h4 className="text-[13.5px] font-semibold text-foreground">{section.title}</h4>
                <p className="mt-1 text-[12.5px] leading-relaxed text-muted-foreground">
                  {section.description}
                </p>
                {!section.included && (
                  <p className="mt-1 text-[11px] font-medium text-muted-foreground/70">Excluded from export</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
