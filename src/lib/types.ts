export type Severity = "critical" | "warning" | "info";

export type ColumnType = "numerical" | "categorical" | "datetime" | "boolean" | "text";

export interface DatasetSummary {
  name: string;
  fileSize: string;
  rows: number;
  columns: number;
  missingValues: number;
  missingPercent: number;
  duplicateRows: number;
  outliers: number;
  numericalColumns: number;
  categoricalColumns: number;
  memoryUsage: string;
  uploadedAt: string;
}

export interface KpiMetric {
  id: string;
  label: string;
  value: string;
  icon: string;
  trend?: {
    direction: "up" | "down" | "flat";
    value: string;
    isGood: boolean;
  };
  tone?: "default" | "primary" | "success" | "warning" | "destructive";
  helpText?: string;
}

export type QualityGrade = "excellent" | "good" | "fair" | "poor";

export interface QualityScoreFactor {
  id: "missing" | "duplicates" | "outliers" | "inconsistent" | "dtype";
  label: string;
  /** Human-readable statement of the rule used to compute this factor's deduction. */
  rule: string;
  /** The raw measurement the rule was applied to, e.g. "4.2% missing cells". */
  measurement: string;
  /** Points deducted from 100 for this factor (0 if the measurement is clean). */
  pointsDeducted: number;
  /** Maximum points this factor could ever deduct, so the UI can show "x / cap". */
  maxPoints: number;
}

export interface DataQualityScore {
  /** 0-100, higher is better. Always 100 minus the sum of factor deductions, floored at 0. */
  score: number;
  grade: QualityGrade;
  /** One entry per scored dimension, in the order deductions were applied. */
  factors: QualityScoreFactor[];
  /** Plain-language description of the overall method, shown to the user so the score is never a black box. */
  methodology: string;
}

export type CleaningProposalStatus = "pending" | "approved" | "rejected";

export interface DataIssue {
  id: string;
  title: string;
  category: "missing" | "duplicate" | "outlier" | "inconsistent" | "dtype";
  severity: Severity;
  affectedColumns: string[];
  affectedCount: number;
  affectedPercent: number;
  explanation: string;
  suggestedFix: string;
  /**
   * User's decision on the suggested fix. This is a proposal-tracking flag
   * only — approving a fix does NOT mutate the dataset (no auto-apply).
   * It records intent so decision-support text and report exports can
   * reflect what the user has signed off on.
   */
  status: CleaningProposalStatus;
}

export type ChartData =
  | { kind: "categorical"; items: { label: string; value: number }[] }
  | { kind: "histogram"; bins: { range: string; count: number }[] }
  | { kind: "scatter"; points: { x: number; y: number }[] }
  | { kind: "heatmap"; columns: string[]; matrix: number[][] }
  | {
      kind: "boxplot";
      groups: { label: string; min: number; q1: number; median: number; q3: number; max: number }[];
    };

export interface ChartRecommendation {
  id: string;
  chartType: "bar" | "histogram" | "pie" | "scatter" | "heatmap" | "boxplot" | "line";
  title: string;
  columns: string[];
  reason: string;
  bestUseCase: string;
  confidence: number;
  data?: ChartData;
}

export interface AiInsightSection {
  id: string;
  type: "summary" | "finding" | "pattern" | "recommendation" | "risk" | "opportunity";
  title: string;
  body: string;
  tags?: string[];
}

export type RecommendationPriority = "high" | "medium" | "low";

export interface DecisionRecommendation {
  id: string;
  title: string;
  body: string;
  priority: RecommendationPriority;
  /** Issue titles or insight titles this recommendation was grounded in, shown so the user can trace the reasoning. */
  basedOn: string[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  isTyping?: boolean;
  /** Only set on assistant messages — lets the UI label how the answer was produced. */
  source?: "deterministic" | "ai";
}

export interface RecentUpload {
  id: string;
  name: string;
  size: string;
  rows: number;
  uploadedAt: string;
  status: "ready" | "processing" | "failed";
}

export interface ReportSection {
  id: string;
  title: string;
  description: string;
  included: boolean;
}

export interface ColumnProfile {
  name: string;
  type: ColumnType;
  missingCount: number;
  missingPercent: number;
  uniqueCount: number;
}

export interface CorrelationPair {
  columnA: string;
  columnB: string;
  r: number;
}

export interface DatasetProfile {
  summary: DatasetSummary;
  kpis: KpiMetric[];
  columns: ColumnProfile[];
  issues: DataIssue[];
  chartRecommendations: ChartRecommendation[];
  insights: AiInsightSection[];
  correlations: CorrelationPair[];
  qualityScore: DataQualityScore;
  /**
   * Gemini-authored analyst notes from /insights, persisted so a later
   * report export can include them without re-generating. Optional and
   * absent until the user visits /insights and generation succeeds at
   * least once — kept separate from the deterministic `insights` above.
   */
  aiAnalystNotes?: AiInsightSection[];
  /**
   * Gemini-authored decision-support recommendations from /insights,
   * persisted for the same reason as aiAnalystNotes above.
   */
  decisionRecommendations?: DecisionRecommendation[];
}
