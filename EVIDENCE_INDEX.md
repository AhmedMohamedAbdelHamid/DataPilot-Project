# Evidence Index

**Package:** DataPilot Quality Module — FINAL (with backend integration evidence)
**Prepared by:** Ahmad Essam — Knowledge, Tools & Quality Engineer, Team 07
**Date:** 2026-07-28

This index maps every claim of executed evidence to the file that supports it. Anything not
listed here as executed remains **Not tested**, **Implemented**, **Proposed**, or **Pending**,
per the acceptance matrix.

---

## 1. Backend execution evidence

| Claim | Status | Evidence file |
|---|---|---|
| `npm install` succeeded (682 packages) | Pass | `Backend_Integration/backend_execution_report.md` §1 |
| `npm test` — 9/9 tests pass | Pass | `Backend_Integration/evidence/npm_test_output.txt` |
| `npm run build` failed first (type error) | Fail (pre-fix) | `Backend_Integration/evidence/npm_build_output.txt` |
| `npm run build` succeeded after ENV type fix | Pass | `Backend_Integration/evidence/npm_build_output_after_fix.txt` |
| Backend actual profiles (all 3 datasets) | Produced | `Backend_Integration/actual_outputs/*.json` |

## 2. Benchmark comparison evidence

| Claim | Status | Evidence file |
|---|---|---|
| 339 fields compared, 336 Pass / 0 Fail / 3 label-only divergences | Pass | `Backend_Integration/expected_vs_actual_comparison.csv` |
| Raw comparison records | — | `Backend_Integration/comparison_rows.json` |
| Field coverage: rows, columns, types, missing, duplicates, uniques, numeric/categorical/date summaries, anomalies, issue cards, status, warnings, limitations | Pass | same CSV |

## 3. Spec-conformance audit evidence

| Claim | Status | Evidence file |
|---|---|---|
| Deterministic calculation rules conform | Pass | `Backend_Integration/spec_conformance_audit.md` §1 |
| Type inference conforms | Pass | §2 |
| Duplicate rule matches tightened D-09 | Pass | §1 (profiler.ts line 269) |
| All 11 error codes present | Pass (presence) | §4 |
| AI guardrails enforced in code | Implemented | §5 |
| Chart rules present | Implemented | §6 |

## 4. Divergences

| Claim | Status | Evidence file |
|---|---|---|
| 5 divergences, none High, none affecting deterministic values | Recorded | `Backend_Integration/divergence_report.md` |
| Original files preserved before the two evidence-run fixes | Preserved | `Backend_Integration/evidence/originals/` |
| Proposed spec change PSC-1 (structured warnings) | Proposed | `divergence_report.md` (end) |

## 5. UI evidence (manual)

| Claim | Status | Source |
|---|---|---|
| Named UI items (upload, dataset summary, row/col display, quality findings, issue & warning visibility, chart recommendations, navigation/behaviour) | Pass — manual | Ahmad Essam manual UI test statement; `Shared_Checklists/ui_quality_checklist.csv` |
| Accessibility, mobile, export, malformed/unsupported screens, formula/prompt-injection display, source-traceability display, partial-state | Not tested | withheld per instruction; same CSV |

The manual UI evidence is the statement supplied by Ahmad Essam confirming the tested upload
flow, dataset summary, row/column display, quality findings, issue and warning visibility, chart
recommendations, general navigation, and interface behaviour. It does **not** extend to the
withheld items, which require separate evidence.

## 6. Items explicitly NOT backed by executed evidence

| Item | Status | Why |
|---|---|---|
| Behavioural AI-guardrail tests | Not tested | need live provider keys |
| Full 10-case evaluation matrix | Partial | profiler + routes executed; injection/malformed/not-found scenarios not run |
| Chart-recommendation scenario matrix | Not tested | not exercised by the executed suite |
| Formula-neutralization display/export | Implemented | present in code; not run in UI/export |
| Source access-date verification | Pending | no source opened; no date fabricated |
| Decision approvals (D-01…D-34) | Proposed | awaiting Integration Lead |
| `profile_version` reconciliation (D-4) | Divergence | backend author's call |

## 7. Provenance note

The authoritative quality package used for comparison is the latest uploaded
`DataPilot_Ahmad_Essam_Quality_Module.zip` (v0.2-proposed). The instruction referenced a file
named `...(2).zip`, which was not present in the upload set; the latest available package was used
as authoritative, consistent with the instruction to treat the latest upload as superseding.
