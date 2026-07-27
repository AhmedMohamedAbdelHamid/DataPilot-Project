"use client";

import { motion } from "framer-motion";
import {
  ScanSearch,
  ShieldCheck,
  BarChart3,
  Sparkles,
  MessageCircle,
  FileText,
} from "lucide-react";

const features = [
  {
    icon: ScanSearch,
    title: "Automatic profiling",
    description: "Instantly get row counts, column types, distributions, and memory usage — no code required.",
  },
  {
    icon: ShieldCheck,
    title: "Data quality detection",
    description: "Surfaces missing values, duplicates, outliers, and inconsistent labels with suggested fixes.",
  },
  {
    icon: BarChart3,
    title: "Smart chart recommendations",
    description: "DataPilot suggests the right visualization for each column pair, with a confidence score.",
  },
  {
    icon: Sparkles,
    title: "Plain-English AI insights",
    description: "Executive summaries, key findings, and business recommendations — generated automatically.",
  },
  {
    icon: MessageCircle,
    title: "Ask anything",
    description: "Chat with your dataset. Ask what drives an outcome, or why a column has missing data.",
  },
  {
    icon: FileText,
    title: "Reproducible reports",
    description: "Export a polished, shareable PDF or DOCX report that documents every finding and decision.",
  },
];

export function Features() {
  return (
    <section id="features" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Everything you need to understand your data
        </h2>
        <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
          From raw file to reproducible decision report — DataPilot handles the entire analysis
          workflow so you can focus on what the data means.
        </p>
      </div>

      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, i) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.4, delay: i * 0.06, ease: "easeOut" }}
            whileHover={{ y: -3 }}
            className="card-shadow rounded-2xl border border-border bg-card p-6 transition-shadow hover:card-shadow-hover"
          >
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <feature.icon className="size-5" strokeWidth={1.9} />
            </div>
            <h3 className="mt-4 text-[15px] font-semibold text-foreground">{feature.title}</h3>
            <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted-foreground">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
