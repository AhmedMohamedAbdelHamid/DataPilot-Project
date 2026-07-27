import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export function MetricBadge({
  icon: Icon,
  children,
  tone = "default",
  className,
}: {
  icon?: LucideIcon;
  children: React.ReactNode;
  tone?: "default" | "primary" | "success";
  className?: string;
}) {
  const toneClass = {
    default: "bg-secondary text-secondary-foreground",
    primary: "bg-primary/10 text-primary",
    success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  }[tone];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11.5px] font-medium",
        toneClass,
        className
      )}
    >
      {Icon && <Icon className="size-3.5" strokeWidth={2.25} />}
      {children}
    </span>
  );
}

export function ConfidenceMeter({ value }: { value: number }) {
  const tone = value >= 90 ? "bg-emerald-500" : value >= 75 ? "bg-primary" : "bg-amber-500";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-secondary">
        <div className={cn("h-full rounded-full", tone)} style={{ width: `${value}%` }} />
      </div>
      <span className="text-[11.5px] font-medium text-muted-foreground">{value}%</span>
    </div>
  );
}
