# DataPilot — Knowledge, Tools & Quality Module

**Student:** Ahmad Essam · **Team:** Team 07 · **Role:** Knowledge, Tools & Quality Engineer
**Project:** DataPilot — Dataset Analysis & Decision Support Studio
**Version:** profile_version 0.2-proposed · ruleset rules-2026-07-23

This repository contains the complete specification, benchmark fixtures, exact expected
outputs, test plans, documentation, handoff materials, and defense preparation for Ahmad Essam's
five-session Knowledge, Tools & Quality Engineer role — **plus executed backend integration
evidence** (see `Backend_Integration/`).

Youssef Elfeshawy's backend patch has been run against this package: dependencies installed, the
test suite executed **9/9 successfully**, and the production build **succeeded after one
documented type fix**. All three benchmark datasets were executed through the backend profiler,
and **339 expected-vs-actual fields were compared: 336 passed, 0 failed, and 3 were label-only
divergences** (`profile_version` `0.2` vs `0.2-proposed`). The specified UI workflow items were
**manually verified by Ahmad and passed**. Remaining unexecuted, approval-dependent,
source-verification, and live-AI items remain non-Pass and are labelled as such throughout.

It contains only the work my role owns: the correctness and trust layer of DataPilot. It does
not contain frontend code, backend implementation, API deployment, or system architecture —
those belong to my teammates. Backend implementation ownership remains with Youssef Elfeshawy;
the fixes applied to obtain build/test evidence are typing/harness only and are recorded as
divergences with originals preserved.

---

## Read this first: current state of the evidence

| Category | State |
|---|---|
| **Specification** — rules and contracts | Complete |
| **Benchmark fixtures + exact expected outputs** | Complete; unchanged during integration |
| **Backend install / test / build** | Executed — install OK, **test 9/9 pass**, **build success** after documented fix |
| **Backend benchmark comparison** | Executed — **336/339 fields Pass, 0 Fail, 3 label-only divergences** |
| **Backend spec conformance** (duplicate rule, error codes, guardrails) | Verified / Implemented — see `Backend_Integration/spec_conformance_audit.md` |
| **UI workflow (named manual items)** | **Pass** — Ahmad Essam manual UI test |
| **Withheld UI areas** (accessibility, mobile, export, malformed/unsupported/injection/traceability display, partial-state) | Not tested — separate evidence required |
| **Full ten-case evaluation matrix** | Partial |
| **Live prompt-injection / live AI-guardrail behaviour** | Not tested / Implemented (need provider keys) |
| **Formula-neutralization UI/export** | Implemented (not run in UI/export) |
| **Source verification + access dates** | Pending |
| **Decision approvals (D-01…D-34)** | Proposed — pending Integration Lead |
| **Clean-dataset success-path fixture (KL-14)** | Pending |

No item is marked Pass without executed evidence. No source access date is fabricated. No
teammate approval is assumed. The 34 design decisions (D-01…D-34) remain proposed working rules
pending Integration Lead approval, and the source register is pending verification.

## The one rule everything rests on

> Application code computes every measurable fact. AI may explain, summarize, and suggest next
> steps, but it may never calculate, alter, recompute, or invent numbers.

## Folder guide

| Folder | Contents |
|---|---|
| *(top level)* | `README.md`, `CHANGELOG.md`, `VERSION_HISTORY.md`, `FINAL_AUDIT_REPORT.md` |
| `Backend_Integration/` | Executed backend evidence: actual profiler outputs, 339-row expected-vs-actual comparison, execution report, divergence report, spec-conformance audit, evidence index, npm logs, and preserved originals of the two files touched for the evidence run |
| `Session_1/` | The original Session 1 PDF, a foundation extraction of its fixed decisions, and the 34-row decision resolution register (14 columns; D-01…D-34, all Proposed) |
| `Session_2/` | Final taxonomy; three benchmark datasets with dictionaries, known-issues registers, and exact expected outputs; five core tests; three teammate handoffs; `generation_scripts/` (dataset generator, reference profiler, and `test_rules.py`) |
| `Session_3/` | `source_register_pending_verification.csv`; 10-file bounded knowledge base; traceability model; expected-vs-actual template; backend and chart verification plans |
| `Session_4/` | Ten-case evaluation; injection, formula, and invalid-input tests; AI guardrail evaluation; production documentation; limitations register; release checklist |
| `Session_5/` | Final quality report; defense script; 34-question Q&A; demo checklist; final acceptance matrix |
| `Shared_Checklists/` | Error catalogue, issue cards, severity model, acceptance criteria, backend and UI checklists |

## Reproducing and testing

The two scripts in `Session_2/generation_scripts/` are location-independent — they run identically
from the project root or from their own directory:

```
python3 Session_2/generation_scripts/gen_datasets.py       # regenerate the 3 benchmark CSVs
python3 Session_2/generation_scripts/reference_profiler.py  # regenerate the expected profiles
python3 Session_2/generation_scripts/test_rules.py          # 9 unit tests (duplicate rule + status)
```

`reference_profiler.py` exits with a clear error if an input dataset is missing. It is a
specification authoring aid, not the DataPilot product implementation.

## The benchmark datasets

Three deterministic datasets (seed 20260723), each with documented planted issues:

| Dataset | Shape | Exercises |
|---|---|---|
| `student_performance.csv` | 102 × 12 | Identifiers, missing values, duplicates, range violations, mixed type, boolean, constant column |
| `small_business_sales.csv` | 122 × 13 | Mixed date formats, formula injection, negative values, large values, high-cardinality text |
| `research_survey.csv` | 96 × 12 | Text-stored numbers, all-missing column, out-of-range values, inconsistent tokens, prompt injection |

Every expected profile in `Session_2/expected_outputs/` was **derived from the exact CSV**, not
estimated. Regenerating a dataset with the same seed reproduces it byte-for-byte.

## Four findings worth knowing

Authoring the benchmarks surfaced four limitations that shape the whole module:

1. The IQR rule flags 16 legitimate discount values because the column is discrete.
2. A satisfaction score of 9 (on a 1–5 scale) escapes IQR but is caught by a range check.
3. A single text value ("forty-one") makes the age column text, hiding an extreme value of 91.
4. A multi-format date column is demoted to text, correctly blocking a fabricated trend.

These are documented in `Session_4/known_limitations_register.csv` and demonstrated in
`Session_4/safe_vs_unsafe_ai_examples.md`.

## How to verify my work

- **Reproduce the datasets and expected outputs:** the values in `expected_outputs/` follow the
  proposed working rules (pending Integration Lead approval): D-06, D-08, D-09, D-10, D-11, D-12,
  D-21, D-22, D-24, D-29, D-30. The
  known-issues registers list every planted issue and its expected detection.
- **Check nothing is overclaimed:** items backed by executed evidence live in
  `Backend_Integration/` (install/test/build logs, the 339-row comparison, and preserved
  originals). Everything still unproven — source access dates, decision approvals, live-AI and
  full-injection tests, withheld UI areas — reads a pending / Not tested / Proposed marker rather
  than Pass. The acceptance matrix (`Session_5/final_acceptance_matrix.csv`) is the single source
  of truth for per-requirement status.

## Open items for the team

The decisions register and the final acceptance matrix list what still needs the Integration
Lead's approval (the 34 decisions D-01…D-34, the candidate sources) and what needs the integrated build
before it can be executed (all verification and evaluation evidence).
