"use client";

import * as React from "react";
import { InsightCard } from "@/components/shared/insight-card";
import { RecommendationCard } from "@/components/shared/recommendation-card";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { NoDatasetState } from "@/components/shared/no-dataset-state";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { Button } from "@/components/ui/button";
import { explainWithGemini, generateDecisionSupport, AiUnavailableError } from "@/lib/ai-client";
import { useActiveDataset, useAiContent } from "@/lib/dataset-store";
import type { AiInsightSection, DecisionRecommendation } from "@/lib/types";
import { Sparkles, RefreshCw, Target } from "lucide-react";

const sectionMeta: Record<AiInsightSection["type"], string> = {
  summary: "Executive Summary",
  finding: "Key Findings",
  pattern: "Interesting Patterns",
  recommendation: "Business Recommendations",
  risk: "Risk Factors",
  opportunity: "Opportunities",
};

const order: AiInsightSection["type"][] = [
  "summary",
  "finding",
  "pattern",
  "recommendation",
  "risk",
  "opportunity",
];

function AiExplanationSection({ profile }: { profile: NonNullable<ReturnType<typeof useActiveDataset>["profile"]> }) {
  const { setAiAnalystNotes } = useAiContent();
  const persisted = profile.aiAnalystNotes;
  const [state, setState] = React.useState<"idle" | "loading" | "error" | "done">(persisted ? "done" : "idle");
  const [notes, setNotes] = React.useState<AiInsightSection[]>(persisted ?? []);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const requestedFor = React.useRef<string | null>(persisted ? profile.summary.name : null);

  const generate = React.useCallback(() => {
    setState("loading");
    setErrorMessage(null);
    explainWithGemini(profile)
      .then((insights) => {
        setNotes(insights);
        setState("done");
        setAiAnalystNotes(insights);
      })
      .catch((err) => {
        setErrorMessage(err instanceof AiUnavailableError ? err.message : "Something went wrong generating AI explanations.");
        setState("error");
      });
  }, [profile, setAiAnalystNotes]);

  React.useEffect(() => {
    // Auto-generate once per uploaded dataset (not on every re-render) —
    // skipped entirely if notes were already persisted from a prior visit.
    if (requestedFor.current === profile.summary.name) return;
    requestedFor.current = profile.summary.name;
    generate();
  }, [profile.summary.name, generate]);

  return (
    <section className="mt-10 rounded-2xl border border-dashed border-primary/25 bg-primary/[0.03] p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Sparkles className="size-4" strokeWidth={2} />
          </div>
          <div>
            <h2 className="text-[13.5px] font-semibold text-foreground">AI Analyst Notes</h2>
            <p className="text-[11.5px] text-muted-foreground">
              Written by Gemini from the numbers on this page — it explains and prioritizes, but never computes its own statistics.
            </p>
          </div>
        </div>
        {state === "done" && (
          <Button variant="ghost" size="sm" onClick={generate} className="shrink-0">
            <RefreshCw className="size-3.5" />
            Regenerate
          </Button>
        )}
      </div>

      <div className="mt-4">
        {state === "loading" && (
          <div className="flex items-center gap-2.5 rounded-xl bg-card/60 px-4 py-6 text-[12.5px] text-muted-foreground">
            <LoadingSpinner size={16} />
            Asking the AI layer to explain these findings…
          </div>
        )}
        {state === "error" && (
          <div className="rounded-xl bg-card/60 px-4 py-4 text-[12.5px] text-muted-foreground">
            Couldn&apos;t generate AI notes right now{errorMessage ? ` — ${errorMessage}` : ""}. The deterministic
            insights below are unaffected.
            <Button variant="outline" size="sm" onClick={generate} className="mt-3 flex">
              Try again
            </Button>
          </div>
        )}
        {state === "done" && (
          <div className="grid gap-4 lg:grid-cols-2">
            {notes.map((note, i) => (
              <InsightCard key={note.id} insight={note} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function DecisionSupportSection({ profile }: { profile: NonNullable<ReturnType<typeof useActiveDataset>["profile"]> }) {
  const { setDecisionRecommendations } = useAiContent();
  const persisted = profile.decisionRecommendations;
  const [state, setState] = React.useState<"idle" | "loading" | "error" | "done">(persisted ? "done" : "idle");
  const [recommendations, setRecommendations] = React.useState<DecisionRecommendation[]>(persisted ?? []);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const requestedFor = React.useRef<string | null>(persisted ? profile.summary.name : null);

  const generate = React.useCallback(() => {
    setState("loading");
    setErrorMessage(null);
    generateDecisionSupport(profile)
      .then((recs) => {
        setRecommendations(recs);
        setState("done");
        setDecisionRecommendations(recs);
      })
      .catch((err) => {
        setErrorMessage(err instanceof AiUnavailableError ? err.message : "Something went wrong generating recommendations.");
        setState("error");
      });
  }, [profile, setDecisionRecommendations]);

  React.useEffect(() => {
    // Auto-generate once per uploaded dataset (skipped if already
    // persisted from a prior visit). Re-run manually via "Regenerate"
    // after approving/rejecting cleaning fixes, since those decisions
    // feed into the recommendations but don't change the dataset name
    // that this effect keys off.
    if (requestedFor.current === profile.summary.name) return;
    requestedFor.current = profile.summary.name;
    generate();
  }, [profile.summary.name, generate]);

  return (
    <section className="mt-8 rounded-2xl border border-dashed border-primary/25 bg-primary/[0.03] p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Target className="size-4" strokeWidth={2} />
          </div>
          <div>
            <h2 className="text-[13.5px] font-semibold text-foreground">Decision-Support Recommendations</h2>
            <p className="text-[11.5px] text-muted-foreground">
              Actionable next steps — accounts for which cleaning fixes you&apos;ve approved, rejected, or left pending.
            </p>
          </div>
        </div>
        {state === "done" && (
          <Button variant="ghost" size="sm" onClick={generate} className="shrink-0">
            <RefreshCw className="size-3.5" />
            Regenerate
          </Button>
        )}
      </div>

      <div className="mt-4">
        {state === "loading" && (
          <div className="flex items-center gap-2.5 rounded-xl bg-card/60 px-4 py-6 text-[12.5px] text-muted-foreground">
            <LoadingSpinner size={16} />
            Working out what to do next with this data…
          </div>
        )}
        {state === "error" && (
          <div className="rounded-xl bg-card/60 px-4 py-4 text-[12.5px] text-muted-foreground">
            Couldn&apos;t generate recommendations right now{errorMessage ? ` — ${errorMessage}` : ""}.
            <Button variant="outline" size="sm" onClick={generate} className="mt-3 flex">
              Try again
            </Button>
          </div>
        )}
        {state === "done" && (
          <div className="grid gap-4 lg:grid-cols-2">
            {recommendations.map((rec, i) => (
              <RecommendationCard key={rec.id} recommendation={rec} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default function InsightsPage() {
  const { profile } = useActiveDataset();

  if (!profile) {
    return (
      <DashboardShell title="AI Insights">
        <NoDatasetState description="Upload a dataset to generate an executive summary, key findings, and recommendations." />
      </DashboardShell>
    );
  }

  const grouped = order.map((type) => ({
    type,
    label: sectionMeta[type],
    items: profile.insights.filter((i) => i.type === type),
  })).filter((g) => g.items.length > 0);

  return (
    <DashboardShell title="AI Insights">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Sparkles className="size-5" strokeWidth={1.9} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">AI insights</h1>
            <p className="mt-0.5 text-[13.5px] text-muted-foreground">
              Generated automatically from your dataset — grounded in the statistics DataPilot computed.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 space-y-10">
        {grouped.map((group) => (
          <section key={group.type}>
            <h2 className="text-[13px] font-semibold uppercase tracking-wide text-muted-foreground">
              {group.label}
            </h2>
            <div
              className={
                group.type === "summary"
                  ? "mt-3 grid gap-4"
                  : "mt-3 grid gap-4 lg:grid-cols-2"
              }
            >
              {group.items.map((insight, i) => (
                <InsightCard key={insight.id} insight={insight} index={i} />
              ))}
            </div>
          </section>
        ))}
      </div>

      <AiExplanationSection profile={profile} />
      <DecisionSupportSection profile={profile} />
    </DashboardShell>
  );
}
