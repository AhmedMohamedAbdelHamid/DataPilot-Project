"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { DataQualityScore, QualityGrade } from "@/lib/types";
import { ShieldCheck, ShieldAlert, ShieldX } from "lucide-react";

const gradeConfig: Record<QualityGrade, { label: string; ring: string; text: string; icon: typeof ShieldCheck }> = {
  excellent: { label: "Excellent", ring: "stroke-success", text: "text-emerald-700 dark:text-emerald-400", icon: ShieldCheck },
  good: { label: "Good", ring: "stroke-primary", text: "text-primary", icon: ShieldCheck },
  fair: { label: "Fair", ring: "stroke-warning", text: "text-amber-700 dark:text-amber-400", icon: ShieldAlert },
  poor: { label: "Poor", ring: "stroke-destructive", text: "text-destructive", icon: ShieldX },
};

function ScoreRing({ score, grade }: { score: number; grade: QualityGrade }) {
  const config = gradeConfig[grade];
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - score / 100);

  return (
    <div className="relative flex size-32 shrink-0 items-center justify-center">
      <svg viewBox="0 0 120 120" className="size-32 -rotate-90">
        <circle cx="60" cy="60" r={radius} strokeWidth="10" className="fill-none stroke-secondary" />
        <motion.circle
          cx="60"
          cy="60"
          r={radius}
          strokeWidth="10"
          strokeLinecap="round"
          className={cn("fill-none", config.ring)}
          style={{ strokeDasharray: circumference }}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-semibold tracking-tight text-foreground">{score}</span>
        <span className="text-[11px] text-muted-foreground">/ 100</span>
      </div>
    </div>
  );
}

export function QualityScoreCard({ qualityScore, className }: { qualityScore: DataQualityScore; className?: string }) {
  const { score, grade, factors, methodology } = qualityScore;
  const config = gradeConfig[grade];
  const GradeIcon = config.icon;

  return (
    <div className={cn("card-shadow rounded-2xl border border-border bg-card p-5", className)}>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <ScoreRing score={score} grade={grade} />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <GradeIcon className={cn("size-4", config.text)} strokeWidth={2} />
            <h2 className="text-[15px] font-semibold text-foreground">
              Data quality score: <span className={config.text}>{config.label}</span>
            </h2>
          </div>
          <p className="mt-1 text-[12.5px] leading-relaxed text-muted-foreground">{methodology}</p>

          <div className="mt-4 flex flex-col gap-2.5">
            {factors.map((factor) => (
              <div key={factor.id} className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-[12.5px]">
                  <span className="font-medium text-foreground">{factor.label}</span>
                  <span className={cn("tabular-nums", factor.pointsDeducted > 0 ? "text-destructive" : "text-muted-foreground")}>
                    {factor.pointsDeducted > 0 ? `−${factor.pointsDeducted}` : "0"} / {factor.maxPoints} pts
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                  <motion.div
                    className={cn("h-full rounded-full", factor.pointsDeducted > 0 ? "bg-destructive/70" : "bg-success/70")}
                    initial={{ width: 0 }}
                    animate={{ width: `${(factor.pointsDeducted / factor.maxPoints) * 100}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
                <p className="text-[11.5px] text-muted-foreground">
                  {factor.measurement} · <span className="italic">{factor.rule}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
