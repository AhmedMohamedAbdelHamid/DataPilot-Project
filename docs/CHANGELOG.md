# CHANGELOG

## 2026-07-25 — Terminology accuracy pass

A wording-only revision to ensure the package never presents planned, proposed, or unverified
work as completed. **No project scope, benchmark data, expected numerical output, file
structure, or ownership boundary was changed.** The reference generator was re-run after the
edits and confirmed to produce byte-identical expected profiles, verifying that no calculation
was affected.

### Corrected wording

- **README opening** rewritten to state precisely what the repository contains (complete
  specification, benchmark fixtures, exact expected outputs, test plans, documentation
  templates, handoff materials, and defense preparation) and that actual backend verification,
  UI verification, source approval, security-test execution, screenshots, and final pass/fail
  evidence remain pending until team integration. A sixth "Approvals pending" item was added to
  the done-vs-pending list.

- **"complete personal deliverable across Sessions 1–5"** → "complete specification, fixtures,
  expected outputs, test plans, documentation templates, and defense preparation for the
  five-session role", with execution evidence stated as pending.

- **"Verified source register" / "Verified Source Register"** (in prose and document titles) →
  "source register (pending verification)". The file name `verified_source_register.csv` was
  **retained unchanged** to preserve the required file structure; its verification-status cells
  already read pending and were left as-is.

- **"frozen rules" / "frozen working defaults" / "frozen as a working default"** → "proposed
  working rules (pending Integration Lead approval)". Where the intent was authoring
  consistency, the wording now reads "fixed for authoring consistency (pending approval of the
  underlying decisions)". This affected the three dataset READMEs, the backend handoff, the
  foundation extraction, the verification plans, the final report, the README, and the
  generation-script comments.

- **Session 5 report "Delivered / Complete" table** → "Produced" with per-session states that
  distinguish specification completeness from pending approval and pending execution
  ("Specification complete", "Specification and fixtures complete; decisions pending approval",
  "Test plans and documentation complete; execution pending", "Defense preparation complete").

- **"delivered the full foundation" / "I have delivered"** → "produced", with an explicit note
  that the 34 decisions are proposals awaiting the Integration Lead's approval and that the
  source register still needs verification.

- **"specification is release-ready"** → clarified that the specification is complete but the
  quality layer is **not** release-ready until verification evidence exists.

- **"specified, documented, and test-ready"** → "specified and documented, with test plans
  prepared", to avoid implying execution readiness beyond what exists.

- **Acceptance-criteria status "Met"** (`Shared_Checklists/acceptance_criteria.csv`) →
  "Specification met", to make clear these are specification-level facts, not verified outcomes.
  Rows whose evidence is genuinely downstream already read "Pending execution" / "Pending
  approval" and were left unchanged.

- **Final acceptance matrix** (`Session_5/final_acceptance_matrix.csv`): rows previously marked
  "Pass" with evidence "Delivered" → "Specification met". Rows with pending execution or pending
  approval were left unchanged, and no unexecuted test is marked "Pass".

### Explicitly preserved

- All three benchmark datasets (`Session_2/benchmark_datasets/*.csv`), byte-for-byte, including
  the `status` column value `completed`, which is data, not a project-status claim.
- All exact expected numerical outputs in `Session_2/expected_outputs/`.
- All `Pending execution` and `Not yet assessed` status fields.
- The division of responsibilities among Ahmad (Knowledge, Tools & Quality), Ahmed (Integration
  Lead), Youssef (AI & Backend), and Omar (Product UI & Workflow).

### Consistency check performed

- Re-scanned every Markdown, CSV, and JSON file for the flagged terms; no misleading
  completion, verification, approval, or pass claim remains.
- Re-ran the reference generator: expected profiles unchanged (rows, duplicates, missing
  values, anomalies all identical).
- Validated that all JSON files still parse and all CSV files remain well-formed.

## 2026-07-25 — Technical pass (fixes 2–8)

Version bumped to **0.2-proposed**. See `VERSION_HISTORY.md` and `FINAL_AUDIT_REPORT.md` for full
detail and executed-check results. Summary:

- **D-09 duplicate rule** made precise: a later row whose complete record matches an earlier row
  after trimming leading/trailing whitespace only (case, punctuation, internal whitespace, and
  numeric representation not normalized). Aligned across profiler, definitions, taxonomy, quality
  rules, handoffs, and documentation.
- **D-34 added:** status determination precedence `error > partial > success_with_warnings >
  success`; a quality issue with no textual warning now yields `success_with_warnings`, not
  `success`.
- **`profile_version` → `0.2-proposed`** in the profiler and every schema, expected output,
  template, checklist, and documentation reference.
- **Scripts** `gen_datasets.py` and `reference_profiler.py` made location-independent (run from
  root or own directory); `reference_profiler.py` now fails with exit code 1 on missing inputs;
  both print generated files. Added **`test_rules.py`** (9 tests, passing from both locations).
- **Source register renamed** `verified_source_register.csv` →
  `source_register_pending_verification.csv`; fields normalized (`verification_status` =
  "Verification pending…", `access_date` = "Not recorded"); handbook rows distinguish
  starting-resource approval from pending independent verification.
- **Decision register upgraded** to 14 columns; 34 rows all `approval_status = Proposed`; new
  D-34 included.
- **Expected outputs regenerated.** Benchmark CSVs byte-identical; numeric and structural core of
  every expected profile unchanged; only `profile_version`, `duplicates.definition`, and
  `processing_metadata.version` differ.
- Added `VERSION_HISTORY.md` and `FINAL_AUDIT_REPORT.md`.

## 2026-07-28 — Backend integration (execute + merge)

Executed Youssef Elfeshawy's backend patch and merged the verified evidence into the quality
package. No benchmark data, expected calculation, deterministic rule, ownership boundary, or
versioning convention was changed.

- **Executed:** `npm install` (682 pkgs), `npm test` (**9/9 pass**), `npm run build` (**success**
  after one one-line ENV type fix in `ai.ts`, recorded as divergence D-2).
- **Independent comparison:** backend actual profiles vs authoritative expected profiles —
  **336/339 fields Pass, 0 Fail, 3 label-only divergences** (`profile_version`).
- **Added `Backend_Integration/`:** actual outputs, `expected_vs_actual_comparison.csv` (339
  rows), `backend_execution_report.md`, `divergence_report.md`, `spec_conformance_audit.md`,
  `EVIDENCE_INDEX.md`, evidence logs, and preserved originals of the two files touched for the
  evidence run.
- **Updated:** acceptance matrix (R-18 → Pass; R-19 → Partial; R-20 → Not tested; R-21/R-22 →
  Implemented; added R-28…R-32), backend checklist (21 Pass / 2 Partial / 6 Implemented), UI
  checklist (12 Pass via named manual evidence; withheld items Not tested), acceptance_criteria
  (AC-18 → Pass), final quality report §11/§13, and this audit report (backend addendum).
- **Divergences:** 5 total, none High, none affecting a deterministic value. One proposed spec
  change (PSC-1, structured warnings) raised for approval, not applied.
- **Provenance:** the instruction referenced `DataPilot_Ahmad_Essam_Quality_Module(2).zip`, which
  was not in the upload set; the latest available `DataPilot_Ahmad_Essam_Quality_Module.zip`
  (v0.2-proposed) was used as authoritative.

## 2026-07-29 — Final consistency cleanup

Documentation/consistency pass only. No benchmark data, expected calculation, deterministic rule,
ownership boundary, or versioning convention changed; all backend and UI evidence preserved.

- **Deleted** the obsolete `Session_3/verified_source_register.csv` (pre-normalization duplicate);
  only `source_register_pending_verification.csv` remains. Remaining mentions of the old name are
  historical rename descriptions only.
- **Rewrote README.md** opening to the current state: backend installed, tests 9/9, build success
  after the documented fix, 339 fields compared (336 Pass / 0 Fail / 3 label-only), named UI items
  manually verified Pass, remaining items honestly non-Pass. Added `Backend_Integration/` to the
  folder guide.
- **Regenerated FINAL_AUDIT_REPORT.md** from the current merged ZIP (98 files; all JSON/CSV/PY
  validate; one source register; backend + UI evidence recorded; five divergences; full non-Pass
  list; status legend). States it supersedes the previous 84-file audit.
- **Corrected stale statements** in `Session_5/final_quality_report.md` (evidence banner),
  `final_defense_script.md` (honest-status passage), and `defense_questions_and_answers.md`
  (Q18, Q20, Q32) to reflect executed evidence while keeping honest remaining-pending framing.
- **Confirmed** honest statuses left unchanged: source verification/access dates pending; Lead
  approvals Proposed/Pending; ten-case Partial; live injection Not tested; live AI guardrail
  Implemented/Not tested; formula UI/export Implemented; clean-success fixture Pending; withheld
  UI areas Not tested.
