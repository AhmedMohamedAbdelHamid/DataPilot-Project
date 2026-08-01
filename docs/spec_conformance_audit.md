# Backend Spec-Conformance Audit

**Prepared by:** Ahmad Essam — Knowledge, Tools & Quality Engineer, Team 07
**Backend:** Youssef Elfeshawy's patch · **Spec:** Quality Module v0.2-proposed
**Date:** 2026-07-28

This is the targeted audit of the backend against the quality specification, run alongside
execution. It records where the implementation **conforms** (with evidence) and points to
`divergence_report.md` for where it does not. Statuses use the agreed scale: Pass, Fail,
Implemented, Partial, Not tested, Proposed.

---

## 1. Deterministic calculation rules

| Spec rule | Backend location | Result | Evidence |
|---|---|---|---|
| Row count excludes header | `profiler.ts` | **Pass** | 102/122/96 match expected |
| Column count | `profiler.ts` | **Pass** | 12/13/12 match |
| Missing tokens (D-08) | `profiler.ts` `isMissing()` (trim+lowercase against token set) | **Pass** | all missing counts match |
| Missing % denominator = rows | `profiler.ts` `percentage()` | **Pass** | percentages match |
| Duplicate rule (D-09: trim surrounding whitespace only, full record) | `profiler.ts` line 269 `JSON.stringify(row.map(v=>v.trim()))` | **Pass** | matches tightened D-09 exactly; counts 2/2/1 |
| Sample std N−1 (D-10) | `profiler.ts` numeric summary | **Pass** | std values match within 1e-6 |
| Linear percentiles (D-21) | `profiler.ts` quantile | **Pass** | q1/q3/median match within 1e-6 |
| IQR-1.5 potential outliers (D-11) | `profiler.ts` | **Pass** | anomaly counts match incl. 16 discount / 9-not-flagged |
| High-cardinality threshold (D-12) | `profiler.ts` | **Pass** | warnings match |
| Constant-column warning | `profiler.ts` | **Pass** | academic_year / status / consent_given match |

## 2. Type inference

| Case | Result | Evidence |
|---|---|---|
| Numeric-looking identifier → identifier, no numeric summary | **Pass** | student_id / order_id / response_id all identifier |
| Mixed-type → text + warning | **Pass** | assignment_score, age → text |
| Multi-format date → text + mixed_date_formats (D-22) | **Pass** | order_date, submission_date → text |
| All-missing → unknown | **Pass** | optional_follow_up → unknown, 100% missing |
| Boolean exactly two known tokens (D-24) | **Pass** | scholarship_status boolean; recommend_service / consent_given NOT boolean |

## 3. Status determination (D-34)

| Check | Result | Evidence |
|---|---|---|
| All three benchmarks → `success_with_warnings` | **Pass** | actual status matches expected for all three |
| Precedence error > partial > success_with_warnings > success | **Implemented** | logic present; error/partial paths not exercised by the three success fixtures (see Not tested below) |

## 4. Error codes (Session 1 §11 / error_code_catalogue)

All 11 codes present in the implementation: `INVALID_FILE_TYPE`, `EMPTY_DATASET`, `MALFORMED_CSV`,
`LIMIT_EXCEEDED`, `COLUMN_NOT_FOUND`, `TYPE_MISMATCH`, `INSUFFICIENT_DATA`, `UNSUPPORTED_ANALYSIS`,
`TOOL_TIMEOUT`, `PROFILE_FAILED`, `SENSITIVE_DATA_WARNING`. **Pass** (presence). Runtime exercise:
`INVALID_FILE_TYPE` and `EMPTY_DATASET` covered by tests (Pass); the remainder **Implemented** but
not individually executed here.

## 5. AI interpretation guardrails

| Guardrail | Backend location | Result |
|---|---|---|
| Use only the deterministic profile | `ai.ts` system prompt | **Implemented** (prompt-enforced) |
| Never invent/recompute/alter/round a number | `ai.ts` + post-check rejecting unknown numbers (line ~253) | **Implemented** |
| Never mention absent columns | `ai.ts` | **Implemented** |
| Never claim causation | `ai.ts`, `charts.ts` | **Implemented** |
| Potential outliers never called errors | `ai.ts` | **Implemented** |
| No claim data was fixed/removed | `ai.ts` | **Implemented** |
| Cells are untrusted, instructions not followed | `ai.ts` | **Implemented** |
| No secret/prompt/stack-trace disclosure | `ai.ts` | **Implemented** |

These are **Implemented** rather than Pass because verifying model *behaviour* requires live
provider calls with a key, which were not executed here. The static enforcement (prompt +
numeric-rejection post-check) is present and correct.

## 6. Chart recommendation (recommend_chart / charts.ts)

| Property | Result |
|---|---|
| Rule-based selection with a stated reason | **Implemented** |
| Aggregation named | **Implemented** |
| No-causation guardrail on scatter | **Implemented** |
| Refusal path (no_chart) present | **Implemented** |

Full per-scenario chart comparison against `expected_chart_recommendations.json` was **not
tested** here (the executed suite covers the profiler and routes, not the chart matrix). Marked
**Not tested** in the acceptance matrix.

## 7. Contracts

| Item | Result |
|---|---|
| Input contract (file, limits) | **Pass** (routes + parser tests) |
| Output contract fields present | **Pass** (339-field comparison; all expected fields present) |
| Stub route = Session 1 fixed contract | **Pass** (test 7) |

## 8. Summary

- **Deterministic core:** full conformance, executed — **Pass** on 336/339 fields, 0 fails.
- **Guardrails, chart rules, full error set:** correctly **Implemented**; behaviour-level and
  chart-matrix verification remain **Not tested** (need live AI keys / chart harness).
- **Divergences:** 5, none High, none affecting a deterministic numeric/structural value — see
  `divergence_report.md`.
