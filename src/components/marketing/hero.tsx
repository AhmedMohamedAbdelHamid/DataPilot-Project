"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, TrendingUp, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChartPreview } from "@/components/shared/chart-preview";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-40 -z-10 flex justify-center blur-3xl"
      >
        <div className="aspect-[1200/600] w-[1200px] bg-gradient-to-tr from-primary/25 via-accent/20 to-transparent opacity-60" />
      </div>

      <div className="mx-auto grid max-w-7xl gap-12 px-4 pb-20 pt-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8 lg:pb-28 lg:pt-24">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/60 px-3 py-1 text-[12px] font-medium text-muted-foreground"
          >
            <Sparkles className="size-3.5 text-primary" />
            AI-powered data insight studio
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.05 }}
            className="mt-5 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-[3.25rem] lg:leading-[1.05]"
          >
            Turn raw CSVs into
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"> clear decisions</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="mt-5 max-w-lg text-[15.5px] leading-relaxed text-muted-foreground"
          >
            Upload a dataset and DataPilot profiles it, flags data quality issues, recommends the
            right charts, and explains what it all means — in plain English, in seconds.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.15 }}
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <Button size="lg" className="gap-2 text-[14px]" nativeButton={false} render={<Link href="/upload" />}>
              Upload Dataset <ArrowRight className="size-4" />
            </Button>
            <Button size="lg" variant="outline" className="text-[14px]" nativeButton={false} render={<Link href="#workflow" />}>
              See how it works
            </Button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.55, delay: 0.25 }}
            className="mt-6 text-[12px] text-muted-foreground/80"
          >
            No credit card required · CSV & TSV supported · Your data never leaves your workspace
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
          className="relative"
        >
          <div className="card-shadow-hover rounded-2xl border border-border bg-card p-4 sm:p-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <span className="size-2.5 rounded-full bg-destructive/40" />
                <span className="size-2.5 rounded-full bg-amber-400/60" />
                <span className="size-2.5 rounded-full bg-emerald-400/60" />
              </div>
              <span className="font-mono text-[11px] text-muted-foreground">customer_churn_2026.csv</span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-border bg-secondary/40 p-3">
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <TrendingUp className="size-3.5 text-primary" /> Rows
                </div>
                <p className="mt-1 text-lg font-semibold text-foreground">84,213</p>
              </div>
              <div className="rounded-xl border border-border bg-secondary/40 p-3">
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <TriangleAlert className="size-3.5 text-amber-500" /> Issues found
                </div>
                <p className="mt-1 text-lg font-semibold text-foreground">5</p>
              </div>
            </div>

            <div className="mt-3 rounded-xl border border-border p-3">
              <p className="text-[11px] font-medium text-muted-foreground">Churn Rate by Plan Type</p>
              <div className="mt-2 flex justify-center">
                <ChartPreview type="bar" />
              </div>
            </div>

            <div className="mt-3 flex items-start gap-2 rounded-xl bg-primary/5 p-3">
              <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" />
              <p className="text-[11.5px] leading-relaxed text-foreground/80">
                Month-to-month customers churn <span className="font-medium text-foreground">3.2x more</span> than
                annual customers.
              </p>
            </div>
          </div>

          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -right-4 -top-4 hidden rounded-2xl border border-border bg-card px-3 py-2 shadow-lg sm:block"
          >
            <p className="text-[11px] font-medium text-muted-foreground">Data quality score</p>
            <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">98.2%</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
