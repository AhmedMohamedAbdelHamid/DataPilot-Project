import { cn } from "@/lib/utils";
import type { RecommendationPriority, Severity } from "@/lib/types";
import { CircleAlert, Info, OctagonAlert, CheckCircle2, Loader2, XCircle, ArrowUp, ArrowRight, ArrowDown } from "lucide-react";

const severityConfig: Record<Severity, { label: string; className: string; icon: typeof Info }> = {
  critical: {
    label: "Critical",
    className: "bg-destructive/10 text-destructive ring-1 ring-inset ring-destructive/20",
    icon: OctagonAlert,
  },
  warning: {
    label: "Warning",
    className: "bg-warning/10 text-amber-700 ring-1 ring-inset ring-warning/25 dark:text-amber-400",
    icon: CircleAlert,
  },
  info: {
    label: "Info",
    className: "bg-primary/10 text-primary ring-1 ring-inset ring-primary/20",
    icon: Info,
  },
};

export function SeverityBadge({ severity, className }: { severity: Severity; className?: string }) {
  const config = severityConfig[severity];
  const Icon = config.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-medium",
        config.className,
        className
      )}
    >
      <Icon className="size-3.5" strokeWidth={2.25} />
      {config.label}
    </span>
  );
}

type UploadStatus = "ready" | "processing" | "failed";

const uploadStatusConfig: Record<UploadStatus, { label: string; className: string; icon: typeof Info }> = {
  ready: {
    label: "Ready",
    className: "bg-success/10 text-emerald-700 dark:text-emerald-400 ring-1 ring-inset ring-success/20",
    icon: CheckCircle2,
  },
  processing: {
    label: "Processing",
    className: "bg-primary/10 text-primary ring-1 ring-inset ring-primary/20",
    icon: Loader2,
  },
  failed: {
    label: "Failed",
    className: "bg-destructive/10 text-destructive ring-1 ring-inset ring-destructive/20",
    icon: XCircle,
  },
};

export function UploadStatusBadge({ status, className }: { status: UploadStatus; className?: string }) {
  const config = uploadStatusConfig[status];
  const Icon = config.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-medium",
        config.className,
        className
      )}
    >
      <Icon className={cn("size-3.5", status === "processing" && "animate-spin")} strokeWidth={2.25} />
      {config.label}
    </span>
  );
}

const priorityConfig: Record<RecommendationPriority, { label: string; className: string; icon: typeof Info }> = {
  high: {
    label: "High priority",
    className: "bg-destructive/10 text-destructive ring-1 ring-inset ring-destructive/20",
    icon: ArrowUp,
  },
  medium: {
    label: "Medium priority",
    className: "bg-warning/10 text-amber-700 ring-1 ring-inset ring-warning/25 dark:text-amber-400",
    icon: ArrowRight,
  },
  low: {
    label: "Low priority",
    className: "bg-secondary text-muted-foreground ring-1 ring-inset ring-border",
    icon: ArrowDown,
  },
};

export function PriorityBadge({ priority, className }: { priority: RecommendationPriority; className?: string }) {
  const config = priorityConfig[priority];
  const Icon = config.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-medium",
        config.className,
        className
      )}
    >
      <Icon className="size-3.5" strokeWidth={2.25} />
      {config.label}
    </span>
  );
}
