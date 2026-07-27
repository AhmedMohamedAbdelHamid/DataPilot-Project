"use client";

import { motion } from "framer-motion";
import { Wrench, Check, X, RotateCcw } from "lucide-react";
import { SeverityBadge } from "@/components/shared/status-badge";
import { issueCategoryIconMap } from "@/lib/icon-map";
import type { CleaningProposalStatus, DataIssue } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const severityRing: Record<DataIssue["severity"], string> = {
  critical: "ring-destructive/15 bg-destructive/10 text-destructive",
  warning: "ring-amber-500/15 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  info: "ring-primary/15 bg-primary/10 text-primary",
};

const proposalStatusConfig: Record<CleaningProposalStatus, { label: string; className: string }> = {
  pending: { label: "Awaiting review", className: "bg-secondary text-muted-foreground" },
  approved: { label: "Fix approved", className: "bg-success/10 text-emerald-700 dark:text-emerald-400" },
  rejected: { label: "Fix rejected", className: "bg-destructive/10 text-destructive" },
};

export function IssueCard({
  issue,
  index = 0,
  onStatusChange,
}: {
  issue: DataIssue;
  index?: number;
  onStatusChange?: (issueId: string, status: CleaningProposalStatus) => void;
}) {
  const Icon = issueCategoryIconMap[issue.category];
  const statusConfig = proposalStatusConfig[issue.status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05, ease: "easeOut" }}
      whileHover={{ y: -3 }}
      className="card-shadow rounded-2xl border border-border bg-card p-5 transition-shadow hover:card-shadow-hover"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset", severityRing[issue.severity])}>
            {Icon && <Icon className="size-5" strokeWidth={2} />}
          </div>
          <div>
            <h3 className="text-[14.5px] font-semibold leading-snug text-foreground">{issue.title}</h3>
            <p className="mt-0.5 text-[12px] text-muted-foreground">
              {issue.affectedCount.toLocaleString()} affected · {issue.affectedPercent}%
            </p>
          </div>
        </div>
        <SeverityBadge severity={issue.severity} className="shrink-0" />
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {issue.affectedColumns.map((col) => (
          <span key={col} className="rounded-md bg-muted px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
            {col}
          </span>
        ))}
      </div>

      <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">{issue.explanation}</p>

      <div className="mt-4 flex items-start gap-2 rounded-xl bg-secondary/60 p-3">
        <Wrench className="mt-0.5 size-4 shrink-0 text-primary" strokeWidth={2} />
        <p className="text-[12.5px] leading-relaxed text-foreground/80">
          <span className="font-medium text-foreground">Suggested fix — </span>
          {issue.suggestedFix}
        </p>
      </div>

      <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2">
        <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-[11.5px] font-medium", statusConfig.className)}>
          {statusConfig.label}
        </span>
        {onStatusChange && (
          <div className="flex items-center gap-1.5">
            {issue.status !== "approved" && (
              <Button
                size="sm"
                variant="outline"
                className="border-success/30 text-emerald-700 hover:bg-success/10 dark:text-emerald-400"
                onClick={() => onStatusChange(issue.id, "approved")}
              >
                <Check className="size-3.5" strokeWidth={2.5} />
                Approve fix
              </Button>
            )}
            {issue.status !== "rejected" && (
              <Button size="sm" variant="outline" onClick={() => onStatusChange(issue.id, "rejected")}>
                <X className="size-3.5" strokeWidth={2.5} />
                Reject
              </Button>
            )}
            {issue.status !== "pending" && (
              <Button size="icon-sm" variant="ghost" aria-label="Reset to pending" onClick={() => onStatusChange(issue.id, "pending")}>
                <RotateCcw className="size-3.5" strokeWidth={2} />
              </Button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
