import Link from "next/link";
import type { ReactNode } from "react";
import { Gauge } from "lucide-react";

export function AuthShell({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-12">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-40 -z-10 flex justify-center blur-3xl"
      >
        <div className="aspect-[1200/600] w-[1200px] bg-gradient-to-tr from-primary/25 via-accent/20 to-transparent opacity-60" />
      </div>

      <Link href="/" className="flex items-center gap-2.5">
        <div className="flex size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm shadow-primary/30">
          <Gauge className="size-4.5" strokeWidth={2.25} />
        </div>
        <span className="text-[15px] font-semibold tracking-tight text-foreground">DataPilot</span>
      </Link>

      <div className="card-shadow mt-8 w-full max-w-sm rounded-2xl border border-border bg-card p-6">
        <h1 className="text-[17px] font-semibold tracking-tight text-foreground">{title}</h1>
        {description && (
          <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">{description}</p>
        )}
        <div className="mt-6">{children}</div>
      </div>

      {footer && <div className="mt-5 text-[13px] text-muted-foreground">{footer}</div>}
    </div>
  );
}
