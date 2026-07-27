"use client";

import { motion } from "framer-motion";
import { UploadCloud, ScanSearch, ShieldCheck, Sparkles, FileDown } from "lucide-react";

const steps = [
  { icon: UploadCloud, title: "Upload", description: "Drop in a CSV or TSV file up to 200 MB." },
  { icon: ScanSearch, title: "Profile", description: "DataPilot reads structure, types, and stats." },
  { icon: ShieldCheck, title: "Detect issues", description: "Missing values, duplicates & outliers surfaced." },
  { icon: Sparkles, title: "AI insights", description: "Plain-English findings and recommendations." },
  { icon: FileDown, title: "Export report", description: "Download a reproducible decision report." },
];

export function Workflow() {
  return (
    <section id="workflow" className="border-y border-border bg-secondary/30 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            One upload, a complete analysis
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
            The entire workflow — from raw file to decision report — happens in one guided flow.
          </p>
        </div>

        <div className="relative mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-5 lg:gap-4">
          <div
            aria-hidden="true"
            className="absolute left-0 right-0 top-[26px] hidden h-px bg-border lg:block"
          />
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: i * 0.08, ease: "easeOut" }}
              className="relative flex flex-col items-center text-center lg:items-start lg:text-left"
            >
              <div className="relative z-10 flex size-[52px] items-center justify-center rounded-2xl border border-border bg-card text-primary shadow-sm">
                <step.icon className="size-5" strokeWidth={1.9} />
                <span className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                  {i + 1}
                </span>
              </div>
              <h3 className="mt-4 text-[14.5px] font-semibold text-foreground">{step.title}</h3>
              <p className="mt-1 text-[12.5px] leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
