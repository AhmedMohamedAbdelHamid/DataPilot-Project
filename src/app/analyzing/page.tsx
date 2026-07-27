"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Gauge } from "lucide-react";
import { LabeledProgress } from "@/components/shared/labeled-progress";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { useActiveDataset } from "@/lib/dataset-store";
import { cn } from "@/lib/utils";

const steps = [
  "Reading dataset…",
  "Cleaning data…",
  "Calculating statistics…",
  "Detecting data quality issues…",
  "Generating AI insights…",
  "Preparing charts…",
  "Almost done…",
];

export default function AnalyzingPage() {
  const router = useRouter();
  const { profile, isHydrated } = useActiveDataset();
  const [activeStep, setActiveStep] = React.useState(0);
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    // No dataset in this session (e.g. direct navigation, refresh after
    // clearing storage) — send the user back to upload instead of showing
    // a fake analysis of nothing.
    if (isHydrated && !profile) {
      router.replace("/upload");
      return;
    }
    if (!profile) return;

    const stepDuration = 750;
    const stepTimer = setInterval(() => {
      setActiveStep((s) => Math.min(s + 1, steps.length));
    }, stepDuration);

    const progressTimer = setInterval(() => {
      setProgress((p) => Math.min(p + 100 / ((steps.length * stepDuration) / 80), 100));
    }, 80);

    const redirectTimer = setTimeout(() => {
      router.push("/dashboard");
    }, steps.length * stepDuration + 900);

    return () => {
      clearInterval(stepTimer);
      clearInterval(progressTimer);
      clearTimeout(redirectTimer);
    };
  }, [router, profile, isHydrated]);

  if (!profile) return null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 -z-10 flex justify-center blur-3xl"
      >
        <div className="aspect-[1200/600] w-[1000px] bg-gradient-to-tr from-primary/20 via-accent/15 to-transparent opacity-60" />
      </div>

      <div className="w-full max-w-md">
        <div className="flex flex-col items-center text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/30"
          >
            <Gauge className="size-7" strokeWidth={2} />
          </motion.div>
          <h1 className="mt-5 text-xl font-semibold tracking-tight text-foreground">
            Analyzing your dataset
          </h1>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">
            {profile.summary.name} · {profile.summary.rows.toLocaleString()} rows · {profile.summary.columns} columns
          </p>
        </div>

        <div className="mt-8 rounded-2xl border border-border bg-card p-6 card-shadow">
          <LabeledProgress value={progress} />

          <ul className="mt-6 space-y-3" aria-live="polite">
            {steps.map((step, i) => {
              const status = i < activeStep ? "done" : i === activeStep ? "active" : "pending";
              return (
                <li key={step} className="flex items-center gap-3">
                  <span
                    className={cn(
                      "flex size-6 shrink-0 items-center justify-center rounded-full text-[11px]",
                      status === "done" && "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
                      status === "active" && "bg-primary/10 text-primary",
                      status === "pending" && "bg-secondary text-muted-foreground/50"
                    )}
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      {status === "done" ? (
                        <motion.span key="done" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                          <Check className="size-3.5" strokeWidth={2.5} />
                        </motion.span>
                      ) : status === "active" ? (
                        <motion.span key="active" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                          <LoadingSpinner size={13} />
                        </motion.span>
                      ) : (
                        <motion.span key="pending" className="size-1.5 rounded-full bg-current" />
                      )}
                    </AnimatePresence>
                  </span>
                  <span
                    className={cn(
                      "text-[13.5px] transition-colors",
                      status === "pending" ? "text-muted-foreground/50" : "text-foreground"
                    )}
                  >
                    {step}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        <p className="mt-5 text-center text-[12px] text-muted-foreground">
          This usually takes a few seconds. You&apos;ll be redirected automatically.
        </p>
      </div>
    </div>
  );
}
