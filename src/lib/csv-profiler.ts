import Papa from "papaparse";
import type {
  AiInsightSection,
  ChartRecommendation,
  ColumnProfile,
  ColumnType,
  CorrelationPair,
  DataIssue,
  DataQualityScore,
  DatasetProfile,
  KpiMetric,
  QualityGrade,
  QualityScoreFactor,
} from "@/lib/types";

export function answerFromProfile(question: string, profile: DatasetProfile): string | null {
  const q = question.toLowerCase();
  const { summary, columns, correlations, insights } = profile;

  if (/how many row|row count|number of rows/.test(q)) {
    return `${summary.name} has ${summary.rows.toLocaleString()} rows.`;
  }
  if (/how many column|column count|number of columns|which columns|list.*columns/.test(q)) {
    return `${summary.name} has ${summary.columns} columns: ${columns.map((c) => c.name).join(", ")}.`;
  }
  if (/approve|reject|cleaning|review progress|fixes/.test(q)) {
    const approved = profile.issues.filter((i) => i.status === "approved").length;
    const rejected = profile.issues.filter((i) => i.status === "rejected").length;
    const pending = profile.issues.filter((i) => i.status === "pending").length;
    if (profile.issues.length === 0) return "There are no flagged issues, so there's nothing to approve or reject.";
    return `Of ${profile.issues.length} suggested fix${profile.issues.length === 1 ? "" : "es"}, ${approved} ${approved === 1 ? "is" : "are"} approved, ${rejected} rejected, and ${pending} still awaiting your review. Approving a fix records your decision only — no data is changed automatically. Review them on the Data Quality page.`;
  }
  if (/quality score|data quality|how clean/.test(q)) {
    const { score, grade, factors } = profile.qualityScore;
    const worst = [...factors].sort((a, b) => b.pointsDeducted - a.pointsDeducted)[0];
    const worstNote = worst && worst.pointsDeducted > 0 ? ` The biggest deduction is from ${worst.label.toLowerCase()} (-${worst.pointsDeducted} pts).` : " No points were deducted in any category.";
    return `${summary.name} scores ${score}/100 (${grade}) on the deterministic data-quality score.${worstNote} See the Data Quality page for the full breakdown and the exact formula used.`;
  }
  if (/missing/.test(q)) {
    const missingCols = columns.filter((c) => c.missingCount > 0).sort((a, b) => b.missingCount - a.missingCount);
    if (missingCols.length === 0) return "No missing values were detected in this dataset.";
    return `${summary.missingValues.toLocaleString()} cells (${summary.missingPercent}%) are missing overall. The most affected column is \`${missingCols[0].name}\` with ${missingCols[0].missingCount.toLocaleString()} missing values (${missingCols[0].missingPercent}%).`;
  }
  if (/duplicate/.test(q)) {
    if (summary.duplicateRows === 0) return "No duplicate rows were detected.";
    const pct = summary.rows === 0 ? 0 : Math.round((summary.duplicateRows / summary.rows) * 1000) / 10;
    return `${summary.duplicateRows.toLocaleString()} rows (${pct}%) are exact duplicates of an earlier row.`;
  }
  if (/outlier/.test(q)) {
    if (summary.outliers === 0) return "No statistical outliers were detected in the numeric columns.";
    return `${summary.outliers.toLocaleString()} outlier values were detected across the numeric columns, using the 1.5× interquartile range rule.`;
  }
  if (/correlat/.test(q)) {
    if (correlations.length === 0) return "There aren't at least two numeric columns with enough overlapping data to compute a correlation.";
    const top = correlations[0];
    return `\`${top.columnA}\` and \`${top.columnB}\` are the most correlated pair, with r = ${top.r}.`;
  }
  if (/summar/.test(q)) {
    return insights.find((i) => i.type === "summary")?.body ?? null;
  }
  if (/column type|data type|dtype/.test(q)) {
    const byType = new Map<string, string[]>();
    for (const c of columns) {
      if (!byType.has(c.type)) byType.set(c.type, []);
      byType.get(c.type)!.push(c.name);
    }
    return Array.from(byType.entries()).map(([type, names]) => `${type}: ${names.join(", ")}`).join(" · ");
  }
  return null;
}

const MISSING_TOKENS = new Set(["", "na", "n/a", "null", "nan", "none", "-", "--"]);

function isMissing(value: string | undefined | null): boolean {
  if (value === undefined || value === null) return true;
  return MISSING_TOKENS.has(value.trim().toLowerCase());
}

function isNumericLike(value: string): boolean {
  if (value.trim() === "") return false;
  return Number.isFinite(Number(value.trim().replace(/,/g, "")));
}

const DATE_PATTERN = /^\d{4}-\d{1,2}-\d{1,2}|^\d{1,2}\/\d{1,2}\/\d{2,4}/;

function isDateLike(value: string): boolean {
  return DATE_PATTERN.test(value.trim()) && !Number.isNaN(Date.parse(value.trim()));
}

const BOOLEAN_VALUES = new Set(["true", "false", "yes", "no"]);

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex++;
  }
  return `${value.toFixed(1)} ${units[unitIndex]}`;
}

// Limits enforced by the server-side upload route (src/app/api/datapilot/upload/route.ts).
// Kept here so the deterministic profiling code and its guardrails live together.
export const MAX_UPLOAD_BYTES = 15 * 1024 * 1024; // 15 MB
export const MAX_ROWS = 100_000;

/**
 * Parses CSV/TSV text on the server. Synchronous (Papa.parse on a string
 * returns its result directly — no FileReader involved, unlike the
 * browser's file-mode parsing), so it's safe to call from a Route Handler.
 */
export function parseCsvText(text: string): Papa.ParseResult<Record<string, string>> {
  return Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
  });
}

function inferColumnType(values: string[]): ColumnType {
  const present = values.filter((v) => !isMissing(v));
  if (present.length === 0) return "text";

  const sample = present.length > 500 ? present.slice(0, 500) : present;

  const boolCount = sample.filter((v) => BOOLEAN_VALUES.has(v.trim().toLowerCase())).length;
  if (boolCount / sample.length > 0.95) return "boolean";

  const numCount = sample.filter(isNumericLike).length;
  if (numCount / sample.length > 0.9) return "numerical";

  const dateCount = sample.filter(isDateLike).length;
  if (dateCount / sample.length > 0.85) return "datetime";

  const uniqueCount = new Set(sample.map((v) => v.trim().toLowerCase())).size;
  const uniqueRatio = uniqueCount / sample.length;
  if (uniqueRatio <= 0.5 && uniqueCount <= 50) return "categorical";

  return "text";
}

function computeQuartiles(sorted: number[]): { q1: number; q3: number } {
  const q1Index = Math.floor(sorted.length * 0.25);
  const q3Index = Math.floor(sorted.length * 0.75);
  return { q1: sorted[q1Index], q3: sorted[q3Index] };
}

function pearsonCorrelation(a: number[], b: number[]): number {
  const n = a.length;
  const meanA = a.reduce((s, v) => s + v, 0) / n;
  const meanB = b.reduce((s, v) => s + v, 0) / n;
  let num = 0;
  let denomA = 0;
  let denomB = 0;
  for (let i = 0; i < n; i++) {
    const da = a[i] - meanA;
    const db = b[i] - meanB;
    num += da * db;
    denomA += da * da;
    denomB += db * db;
  }
  const denom = Math.sqrt(denomA * denomB);
  return denom === 0 ? 0 : num / denom;
}

function formatNumber(n: number): string {
  if (Math.abs(n) >= 1000) return Math.round(n).toLocaleString();
  return Number(n.toFixed(1)).toString();
}

function computeCategoricalCounts(values: string[], maxCategories = 10): { label: string; value: number }[] {
  const counts = new Map<string, number>();
  for (const v of values) {
    if (isMissing(v)) continue;
    const label = v.trim();
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  const sorted = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  if (sorted.length <= maxCategories) {
    return sorted.map(([label, value]) => ({ label, value }));
  }
  const top = sorted.slice(0, maxCategories - 1);
  const rest = sorted.slice(maxCategories - 1).reduce((s, [, v]) => s + v, 0);
  return [...top.map(([label, value]) => ({ label, value })), { label: "Other", value: rest }];
}

function computeHistogramBins(values: number[], binCount = 8): { range: string; count: number }[] {
  if (values.length === 0) return [];
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (min === max) return [{ range: formatNumber(min), count: values.length }];
  const width = (max - min) / binCount;
  const bins = Array.from({ length: binCount }, () => 0);
  for (const v of values) {
    let idx = Math.floor((v - min) / width);
    if (idx >= binCount) idx = binCount - 1;
    if (idx < 0) idx = 0;
    bins[idx]++;
  }
  return bins.map((count, i) => ({
    range: `${formatNumber(min + i * width)}–${formatNumber(min + (i + 1) * width)}`,
    count,
  }));
}

function computeScatterData(
  rows: Record<string, string>[],
  colA: string,
  colB: string,
  maxPoints = 300
): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = [];
  for (const row of rows) {
    const a = row[colA];
    const b = row[colB];
    if (!isMissing(a) && !isMissing(b) && isNumericLike(a) && isNumericLike(b)) {
      points.push({ x: Number(a.replace(/,/g, "")), y: Number(b.replace(/,/g, "")) });
    }
  }
  if (points.length <= maxPoints) return points;
  const stride = points.length / maxPoints;
  const sampled: { x: number; y: number }[] = [];
  for (let i = 0; i < maxPoints; i++) sampled.push(points[Math.floor(i * stride)]);
  return sampled;
}

function computeHeatmapData(
  rows: Record<string, string>[],
  columnNames: string[]
): { columns: string[]; matrix: number[][] } {
  const n = columnNames.length;
  const matrix: number[][] = Array.from({ length: n }, () => Array(n).fill(1));
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const a: number[] = [];
      const b: number[] = [];
      for (const row of rows) {
        const av = row[columnNames[i]];
        const bv = row[columnNames[j]];
        if (!isMissing(av) && !isMissing(bv) && isNumericLike(av) && isNumericLike(bv)) {
          a.push(Number(av.replace(/,/g, "")));
          b.push(Number(bv.replace(/,/g, "")));
        }
      }
      const r = a.length >= 2 ? Math.round(pearsonCorrelation(a, b) * 100) / 100 : 0;
      matrix[i][j] = r;
      matrix[j][i] = r;
    }
  }
  return { columns: columnNames, matrix };
}

function computeBoxplotData(
  rows: Record<string, string>[],
  numericCol: string,
  groupCol: string,
  maxGroups = 6
): { label: string; min: number; q1: number; median: number; q3: number; max: number }[] {
  const byGroup = new Map<string, number[]>();
  for (const row of rows) {
    const g = row[groupCol]?.trim();
    const raw = row[numericCol];
    if (!g || isMissing(g) || isMissing(raw) || !isNumericLike(raw)) continue;
    if (!byGroup.has(g)) byGroup.set(g, []);
    byGroup.get(g)!.push(Number(raw.replace(/,/g, "")));
  }
  const groups = Array.from(byGroup.entries())
    .filter(([, values]) => values.length >= 2)
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, maxGroups);

  return groups.map(([label, values]) => {
    const sorted = [...values].sort((x, y) => x - y);
    const { q1, q3 } = computeQuartiles(sorted);
    const median = sorted[Math.floor(sorted.length / 2)];
    return { label, min: sorted[0], q1, median, q3, max: sorted[sorted.length - 1] };
  });
}

/**
 * Deterministic 0-100 data quality score. Starts at 100 and deducts points
 * for each dimension below, each capped so no single factor can dominate.
 * This is pure arithmetic over values already computed by buildDatasetProfile
 * (missing %, duplicate %, outlier %, inconsistent-label %, dtype issues) —
 * it never involves the AI layer, per the "AI may explain, never calculate"
 * constraint in README.md.
 */
function gradeForScore(score: number): QualityGrade {
  if (score >= 90) return "excellent";
  if (score >= 75) return "good";
  if (score >= 60) return "fair";
  return "poor";
}

function computeDataQualityScore(params: {
  missingPercent: number;
  duplicatePercent: number;
  outlierPercent: number;
  inconsistentPercent: number;
  dtypeIssueCount: number;
}): DataQualityScore {
  const { missingPercent, duplicatePercent, outlierPercent, inconsistentPercent, dtypeIssueCount } = params;

  const round1 = (n: number) => Math.round(n * 10) / 10;

  const factors: QualityScoreFactor[] = [
    {
      id: "missing",
      label: "Missing values",
      rule: "1 point deducted per 1% of cells missing, capped at 30 points",
      measurement: `${missingPercent}% of all cells are missing`,
      pointsDeducted: round1(Math.min(missingPercent * 1, 30)),
      maxPoints: 30,
    },
    {
      id: "duplicates",
      label: "Duplicate rows",
      rule: "2 points deducted per 1% of rows that are exact duplicates, capped at 25 points",
      measurement: `${duplicatePercent}% of rows are exact duplicates`,
      pointsDeducted: round1(Math.min(duplicatePercent * 2, 25)),
      maxPoints: 25,
    },
    {
      id: "outliers",
      label: "Statistical outliers",
      rule: "1 point deducted per 1% of numeric values flagged by the 1.5x IQR rule, capped at 15 points",
      measurement: `${outlierPercent}% of numeric values are outliers`,
      pointsDeducted: round1(Math.min(outlierPercent * 1, 15)),
      maxPoints: 15,
    },
    {
      id: "inconsistent",
      label: "Inconsistent category labels",
      rule: "1 point deducted per 1% of rows with mixed casing/spacing variants of the same category, capped at 15 points",
      measurement: `${inconsistentPercent}% of rows contain inconsistent category labels`,
      pointsDeducted: round1(Math.min(inconsistentPercent * 1, 15)),
      maxPoints: 15,
    },
    {
      id: "dtype",
      label: "Dtype mismatches",
      rule: "5 points deducted per distinct column flagged as the wrong data type, capped at 15 points",
      measurement:
        dtypeIssueCount === 0
          ? "No dtype mismatches detected"
          : `${dtypeIssueCount} column${dtypeIssueCount === 1 ? "" : "s"} flagged with a likely dtype mismatch`,
      pointsDeducted: round1(Math.min(dtypeIssueCount * 5, 15)),
      maxPoints: 15,
    },
  ];

  const totalDeducted = factors.reduce((s, f) => s + f.pointsDeducted, 0);
  const score = Math.max(0, Math.round(100 - totalDeducted));

  return {
    score,
    grade: gradeForScore(score),
    factors,
    methodology:
      "Score starts at 100. Each factor below deducts points using a fixed, published rule based only on values computed directly from your data — never estimated or AI-generated. The final score is 100 minus the sum of deductions, floored at 0.",
  };
}

export function buildDatasetProfile(
  file: { name: string; size: number },
  parsed: Papa.ParseResult<Record<string, string>>
): DatasetProfile {
  const rows = parsed.data.filter((row) => Object.values(row).some((v) => !isMissing(v)));
  const fields = parsed.meta.fields ?? [];
  const rowCount = rows.length;
  const columnCount = fields.length;

  const columnValues: Record<string, string[]> = {};
  for (const field of fields) {
    columnValues[field] = rows.map((row) => row[field] ?? "");
  }

  const columns: ColumnProfile[] = fields.map((field) => {
    const values = columnValues[field];
    const missingCount = values.filter(isMissing).length;
    const uniqueCount = new Set(values.filter((v) => !isMissing(v)).map((v) => v.trim())).size;
    return {
      name: field,
      type: inferColumnType(values),
      missingCount,
      missingPercent: rowCount === 0 ? 0 : Math.round((missingCount / rowCount) * 1000) / 10,
      uniqueCount,
    };
  });

  const totalCells = rowCount * columnCount;
  const totalMissing = columns.reduce((s, c) => s + c.missingCount, 0);

  const rowSignatures = rows.map((row) => fields.map((f) => (row[f] ?? "").trim().toLowerCase()).join(""));
  const seen = new Set<string>();
  let duplicateRows = 0;
  for (const sig of rowSignatures) {
    if (seen.has(sig)) duplicateRows++;
    else seen.add(sig);
  }

  const numericalColumns = columns.filter((c) => c.type === "numerical");
  const categoricalColumns = columns.filter((c) => c.type === "categorical");

  const numericValuesByColumn: Record<string, number[]> = {};
  for (const col of numericalColumns) {
    numericValuesByColumn[col.name] = columnValues[col.name]
      .filter((v) => !isMissing(v) && isNumericLike(v))
      .map((v) => Number(v.replace(/,/g, "")));
  }

  const outlierCountByColumn: Record<string, number> = {};
  let totalOutliers = 0;
  for (const col of numericalColumns) {
    const values = numericValuesByColumn[col.name];
    if (values.length < 4) continue;
    const sorted = [...values].sort((a, b) => a - b);
    const { q1, q3 } = computeQuartiles(sorted);
    const iqr = q3 - q1;
    const lower = q1 - 1.5 * iqr;
    const upper = q3 + 1.5 * iqr;
    const count = values.filter((v) => v < lower || v > upper).length;
    if (count > 0) {
      outlierCountByColumn[col.name] = count;
      totalOutliers += count;
    }
  }

  const memoryBytes = totalCells * 24;
  const uploadedAt = new Date().toLocaleString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const summary = {
    name: file.name,
    fileSize: formatBytes(file.size),
    rows: rowCount,
    columns: columnCount,
    missingValues: totalMissing,
    missingPercent: totalCells === 0 ? 0 : Math.round((totalMissing / totalCells) * 1000) / 10,
    duplicateRows,
    outliers: totalOutliers,
    numericalColumns: numericalColumns.length,
    categoricalColumns: categoricalColumns.length,
    memoryUsage: formatBytes(memoryBytes),
    uploadedAt,
  };

  const issues: DataIssue[] = [];

  const missingColumns = columns.filter((c) => c.missingCount > 0).sort((a, b) => b.missingCount - a.missingCount);
  if (missingColumns.length > 0) {
    const top = missingColumns.slice(0, 3);
    const affectedCount = top.reduce((s, c) => s + c.missingCount, 0);
    issues.push({
      id: "issue-missing",
      title: `Missing values in ${top.map((c) => `\`${c.name}\``).join(", ")}`,
      category: "missing",
      severity: top[0].missingPercent > 15 ? "critical" : top[0].missingPercent > 3 ? "warning" : "info",
      affectedColumns: top.map((c) => c.name),
      affectedCount,
      affectedPercent: top[0].missingPercent,
      explanation: `${top.map((c) => `\`${c.name}\` is missing ${c.missingCount.toLocaleString()} values (${c.missingPercent}%)`).join("; ")}.`,
      suggestedFix: "Impute with a sensible default (median for numeric, mode for categorical) or exclude these rows from analyses that depend on the column.",
      status: "pending",
    });
  }

  if (duplicateRows > 0) {
    issues.push({
      id: "issue-duplicate",
      title: `${duplicateRows.toLocaleString()} duplicate rows`,
      category: "duplicate",
      severity: duplicateRows / Math.max(rowCount, 1) > 0.05 ? "critical" : "warning",
      affectedColumns: fields,
      affectedCount: duplicateRows,
      affectedPercent: rowCount === 0 ? 0 : Math.round((duplicateRows / rowCount) * 1000) / 10,
      explanation: `${duplicateRows.toLocaleString()} rows are exact duplicates of an earlier row across all ${columnCount} columns.`,
      suggestedFix: "Drop exact duplicate rows, keeping the first (or most recent, if there's a timestamp column) occurrence.",
      status: "pending",
    });
  }

  const outlierEntries = Object.entries(outlierCountByColumn).sort((a, b) => b[1] - a[1]);
  if (outlierEntries.length > 0) {
    const [colName, count] = outlierEntries[0];
    issues.push({
      id: "issue-outlier",
      title: `Outliers in \`${colName}\``,
      category: "outlier",
      severity: "warning",
      affectedColumns: [colName],
      affectedCount: count,
      affectedPercent: rowCount === 0 ? 0 : Math.round((count / rowCount) * 1000) / 10,
      explanation: `${count.toLocaleString()} values in \`${colName}\` fall outside 1.5x the interquartile range, which is statistically unusual for this column.`,
      suggestedFix: "Inspect these rows individually; cap, transform, or exclude extreme values before modeling.",
      status: "pending",
    });
  }

  const inconsistentColumns: { name: string; affected: number }[] = [];
  for (const col of categoricalColumns) {
    const values = columnValues[col.name].filter((v) => !isMissing(v));
    const groups = new Map<string, Set<string>>();
    for (const v of values) {
      const norm = v.trim().toLowerCase();
      if (!groups.has(norm)) groups.set(norm, new Set());
      groups.get(norm)!.add(v.trim());
    }
    let affected = 0;
    for (const [norm, variants] of groups) {
      if (variants.size > 1) {
        affected += values.filter((v) => v.trim().toLowerCase() === norm).length;
      }
    }
    if (affected > 0) inconsistentColumns.push({ name: col.name, affected });
  }
  if (inconsistentColumns.length > 0) {
    const top = inconsistentColumns.sort((a, b) => b.affected - a.affected)[0];
    issues.push({
      id: "issue-inconsistent",
      title: `Inconsistent category labels in \`${top.name}\``,
      category: "inconsistent",
      severity: "info",
      affectedColumns: [top.name],
      affectedCount: top.affected,
      affectedPercent: rowCount === 0 ? 0 : Math.round((top.affected / rowCount) * 1000) / 10,
      explanation: `\`${top.name}\` contains multiple casing/spacing variants of what appear to be the same category (e.g. mixed capitalization or extra whitespace).`,
      suggestedFix: "Normalize casing and trim whitespace, then map known variants to a single canonical label.",
      status: "pending",
    });
  }

  const numericLookingTextColumns = columns.filter((c) => {
    if (c.type === "numerical" || c.type === "boolean") return false;
    const values = columnValues[c.name].filter((v) => !isMissing(v));
    if (values.length === 0) return false;
    const numericish = values.filter((v) => /^\d+$/.test(v.trim())).length;
    return numericish / values.length > 0.8;
  });
  if (numericLookingTextColumns.length > 0) {
    const names = numericLookingTextColumns.slice(0, 2).map((c) => c.name);
    issues.push({
      id: "issue-dtype",
      title: `Numeric-looking values stored as text in ${names.map((n) => `\`${n}\``).join(", ")}`,
      category: "dtype",
      severity: "info",
      affectedColumns: names,
      affectedCount: rowCount,
      affectedPercent: 100,
      explanation: `${names.join(", ")} look like IDs or codes made of digits, but were detected as text — likely to preserve leading zeros or because they're identifiers, not quantities.`,
      suggestedFix: "Keep as a zero-padded string/category dtype rather than casting to a number, so identifiers aren't corrupted.",
      status: "pending",
    });
  }

  const numericCellCount = numericalColumns.reduce((s, c) => s + numericValuesByColumn[c.name].length, 0);
  const outlierPercent = numericCellCount === 0 ? 0 : Math.round((totalOutliers / numericCellCount) * 1000) / 10;
  const duplicatePercent = rowCount === 0 ? 0 : Math.round((duplicateRows / rowCount) * 1000) / 10;
  const totalInconsistentAffected = inconsistentColumns.reduce((s, c) => s + c.affected, 0);
  const inconsistentPercent = rowCount === 0 ? 0 : Math.round((totalInconsistentAffected / rowCount) * 1000) / 10;

  const qualityScore = computeDataQualityScore({
    missingPercent: summary.missingPercent,
    duplicatePercent,
    outlierPercent,
    inconsistentPercent,
    dtypeIssueCount: numericLookingTextColumns.length,
  });

  const kpis: KpiMetric[] = [
    {
      id: "quality",
      label: "Data Quality Score",
      value: `${qualityScore.score}/100`,
      icon: "ShieldCheck",
      tone: qualityScore.score >= 90 ? "success" : qualityScore.score >= 75 ? "primary" : qualityScore.score >= 60 ? "warning" : "destructive",
      helpText: `${qualityScore.grade[0].toUpperCase()}${qualityScore.grade.slice(1)} — see Data Quality page for formula`,
    },
    { id: "rows", label: "Total Rows", value: rowCount.toLocaleString(), icon: "Rows3", tone: "primary", helpText: "Records in the dataset" },
    { id: "columns", label: "Total Columns", value: String(columnCount), icon: "Columns3", tone: "default", helpText: "Fields per record" },
    {
      id: "missing",
      label: "Missing Values",
      value: totalMissing.toLocaleString(),
      icon: "CircleSlash2",
      tone: totalMissing > 0 ? "warning" : "default",
      helpText: `${summary.missingPercent}% of all cells`,
    },
    {
      id: "duplicates",
      label: "Duplicate Rows",
      value: duplicateRows.toLocaleString(),
      icon: "Copy",
      tone: duplicateRows > 0 ? "warning" : "default",
      helpText: rowCount === 0 ? undefined : `${Math.round((duplicateRows / rowCount) * 1000) / 10}% of total rows`,
    },
    {
      id: "outliers",
      label: "Outliers Detected",
      value: totalOutliers.toLocaleString(),
      icon: "TriangleAlert",
      tone: totalOutliers > 0 ? "destructive" : "default",
      helpText: `Across ${Object.keys(outlierCountByColumn).length} numeric columns`,
    },
    { id: "numeric", label: "Numerical Columns", value: String(numericalColumns.length), icon: "Hash", tone: "primary" },
    { id: "categorical", label: "Categorical Columns", value: String(categoricalColumns.length), icon: "Tags", tone: "default" },
    { id: "memory", label: "Memory Usage", value: formatBytes(memoryBytes), icon: "MemoryStick", tone: "default" },
    { id: "filesize", label: "File Size", value: formatBytes(file.size), icon: "FileArchive", tone: "default" },
  ];

  const chartRecommendations: ChartRecommendation[] = [];
  const firstCategorical = categoricalColumns[0];
  const secondCategorical = categoricalColumns[1];
  const firstNumeric = numericalColumns[0];
  const secondNumeric = numericalColumns[1];

  if (firstCategorical) {
    chartRecommendations.push({
      id: "chart-bar",
      chartType: "bar",
      title: `Distribution of ${firstCategorical.name}`,
      columns: [firstCategorical.name],
      reason: `${firstCategorical.name} is categorical with ${firstCategorical.uniqueCount} unique values, suited to a bar chart of counts.`,
      bestUseCase: "Best for comparing frequency across a moderate number of categories.",
      confidence: firstCategorical.uniqueCount <= 12 ? 94 : 78,
      data: { kind: "categorical", items: computeCategoricalCounts(columnValues[firstCategorical.name]) },
    });
  }
  if (firstNumeric) {
    chartRecommendations.push({
      id: "chart-histogram",
      chartType: "histogram",
      title: `Distribution of ${firstNumeric.name}`,
      columns: [firstNumeric.name],
      reason: `${firstNumeric.name} is numeric; a histogram reveals its spread, skew, and any outliers.`,
      bestUseCase: "Best for understanding the shape of a single numeric column.",
      confidence: 92,
      data: { kind: "histogram", bins: computeHistogramBins(numericValuesByColumn[firstNumeric.name]) },
    });
  }
  if (secondCategorical && secondCategorical.uniqueCount <= 6) {
    chartRecommendations.push({
      id: "chart-pie",
      chartType: "pie",
      title: `Share by ${secondCategorical.name}`,
      columns: [secondCategorical.name],
      reason: `${secondCategorical.name} has only ${secondCategorical.uniqueCount} unique values, making a part-to-whole view easy to read.`,
      bestUseCase: "Best for showing proportions across a small number of segments.",
      confidence: 83,
      data: { kind: "categorical", items: computeCategoricalCounts(columnValues[secondCategorical.name], 6) },
    });
  }
  if (firstNumeric && secondNumeric) {
    chartRecommendations.push({
      id: "chart-scatter",
      chartType: "scatter",
      title: `${firstNumeric.name} vs. ${secondNumeric.name}`,
      columns: [firstNumeric.name, secondNumeric.name],
      reason: `Both columns are numeric, good for spotting correlation and outliers between the two.`,
      bestUseCase: "Best for revealing relationships between two numeric variables.",
      confidence: 88,
      data: { kind: "scatter", points: computeScatterData(rows, firstNumeric.name, secondNumeric.name) },
    });
  }
  if (numericalColumns.length >= 3) {
    const heatmapColumns = numericalColumns.slice(0, 6).map((c) => c.name);
    chartRecommendations.push({
      id: "chart-heatmap",
      chartType: "heatmap",
      title: "Correlation Matrix — Numeric Columns",
      columns: heatmapColumns,
      reason: `${numericalColumns.length} numeric columns are available; a heatmap surfaces the strongest relationships at a glance.`,
      bestUseCase: "Best for scanning correlation strength across many numeric columns at once.",
      confidence: 86,
      data: { kind: "heatmap", ...computeHeatmapData(rows, heatmapColumns) },
    });
  }
  if (firstNumeric && firstCategorical) {
    chartRecommendations.push({
      id: "chart-boxplot",
      chartType: "boxplot",
      title: `${firstNumeric.name} by ${firstCategorical.name}`,
      columns: [firstNumeric.name, firstCategorical.name],
      reason: `Compares the distribution and outliers of ${firstNumeric.name} across each ${firstCategorical.name} group.`,
      bestUseCase: "Best for comparing spread and outliers of a numeric column across categories.",
      confidence: 84,
      data: { kind: "boxplot", groups: computeBoxplotData(rows, firstNumeric.name, firstCategorical.name) },
    });
  }

  const correlations: CorrelationPair[] = [];
  for (let i = 0; i < numericalColumns.length; i++) {
    for (let j = i + 1; j < numericalColumns.length; j++) {
      const colA = numericalColumns[i].name;
      const colB = numericalColumns[j].name;
      const pairsA: number[] = [];
      const pairsB: number[] = [];
      for (const row of rows) {
        const a = row[colA];
        const b = row[colB];
        if (!isMissing(a) && !isMissing(b) && isNumericLike(a) && isNumericLike(b)) {
          pairsA.push(Number(a.replace(/,/g, "")));
          pairsB.push(Number(b.replace(/,/g, "")));
        }
      }
      if (pairsA.length >= 5) {
        correlations.push({ columnA: colA, columnB: colB, r: Math.round(pearsonCorrelation(pairsA, pairsB) * 100) / 100 });
      }
    }
  }
  correlations.sort((a, b) => Math.abs(b.r) - Math.abs(a.r));

  const insights: AiInsightSection[] = [];
  insights.push({
    id: "insight-summary",
    type: "summary",
    title: "Dataset Summary",
    body: `This dataset has ${rowCount.toLocaleString()} rows and ${columnCount} columns (${numericalColumns.length} numerical, ${categoricalColumns.length} categorical). It is ${(100 - summary.missingPercent).toFixed(1)}% complete overall${duplicateRows > 0 ? `, with ${duplicateRows.toLocaleString()} duplicate rows detected` : ""}.`,
    tags: [`${rowCount.toLocaleString()} rows`, `${summary.missingPercent}% missing`, `${duplicateRows.toLocaleString()} duplicates`],
  });

  if (missingColumns.length > 0) {
    const top = missingColumns[0];
    insights.push({
      id: "insight-finding-missing",
      type: "finding",
      title: `\`${top.name}\` has the most missing data`,
      body: `${top.missingCount.toLocaleString()} rows (${top.missingPercent}%) are missing a value for \`${top.name}\`. Review the Data Quality page for the full breakdown and suggested fixes.`,
      tags: [top.name],
    });
  }

  if (correlations.length > 0) {
    const top = correlations[0];
    const strength = Math.abs(top.r) > 0.7 ? "strongly" : Math.abs(top.r) > 0.4 ? "moderately" : "weakly";
    insights.push({
      id: "insight-finding-correlation",
      type: "finding",
      title: `\`${top.columnA}\` and \`${top.columnB}\` are ${strength} correlated`,
      body: `These two numeric columns have a Pearson correlation of r = ${top.r}, computed directly from your data.`,
      tags: [top.columnA, top.columnB],
    });
  }

  if (outlierEntries.length > 0) {
    const [colName, count] = outlierEntries[0];
    insights.push({
      id: "insight-pattern-outlier",
      type: "pattern",
      title: `\`${colName}\` has notable outliers`,
      body: `${count.toLocaleString()} values in \`${colName}\` sit outside the typical range (1.5x IQR). Worth a closer look before using this column in downstream analysis.`,
      tags: [colName],
    });
  }

  insights.push({
    id: "insight-recommendation-quality",
    type: "recommendation",
    title: "Resolve data quality issues before analysis",
    body: `Start with the ${issues.length} issue${issues.length === 1 ? "" : "s"} flagged on the Data Quality page — they're ranked by severity so you can fix the highest-impact ones first.`,
  });

  if (duplicateRows > 0) {
    insights.push({
      id: "insight-risk-duplicates",
      type: "risk",
      title: "Duplicate rows may skew aggregate metrics",
      body: `Until removed, ${duplicateRows.toLocaleString()} duplicate rows could inflate counts, sums, or averages computed from this dataset by roughly ${rowCount === 0 ? 0 : Math.round((duplicateRows / rowCount) * 1000) / 10}%.`,
    });
  }

  if (numericalColumns.length > 0) {
    insights.push({
      id: "insight-opportunity-numeric",
      type: "opportunity",
      title: "Numeric columns are ready for deeper analysis",
      body: `${numericalColumns.map((c) => c.name).join(", ")} ${numericalColumns.length === 1 ? "is" : "are"} clean enough for summary statistics, trend analysis, or as model inputs once the flagged issues are resolved.`,
    });
  }

  return {
    summary,
    kpis,
    columns,
    issues,
    chartRecommendations,
    insights,
    correlations,
    qualityScore,
  };
}
