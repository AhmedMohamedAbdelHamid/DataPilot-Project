# Divergence Report — Backend vs Quality Specification

**Prepared by:** Ahmad Essam — Knowledge, Tools & Quality Engineer, Team 07
**Backend audited:** Youssef Elfeshawy's patch (`datapilot_patch`)
**Authoritative spec:** DataPilot Quality Module v0.2-proposed
**Date:** 2026-07-28

Each divergence records the affected spec rule, the affected backend file/function, a severity,
whether expected outputs are affected, and a proposed **code** fix for Youssef's implementation.
Per the ownership boundary, quality rules are **not** changed to make the backend pass; where a
spec change would genuinely be better it is raised separately as a labelled proposal at the end.

Severity scale: **High** (breaks a deterministic result or a contract) · **Medium** (blocks a
clean build/run, or a contract gap with no output impact) · **Low** (cosmetic, additive, or
harness-only).

---

## D-1 — Test file fails strict compilation

- **Spec rule affected:** none (test harness, not a spec rule).
- **Backend file/function:** `tests/datapilot/profiler.test.ts`, `comparable()` (line 26).
- **Severity:** Low.
- **Expected outputs affected:** No.
- **Detail:** `const clone = structuredClone(actual) as Record<string, unknown>` is rejected under
  `strict: true` (`DatasetProfile` lacks a string index signature). This blocked `npm test` until
  corrected.
- **Proposed code fix (Youssef):** cast through `unknown`:
  ```ts
  const clone = structuredClone(actual) as unknown as Record<string, unknown>;
  ```
- **Status:** applied in this evidence run (test-only); original preserved at
  `evidence/originals/profiler.test.ts.ORIGINAL`.

## D-2 — Production build fails type-check on the AI env access

- **Spec rule affected:** none directly; touches the AI-explanation layer, which the spec
  requires to exist and be side-effect-free on the deterministic profile (guardrails IG-10/11).
- **Backend file/function:** `src/lib/datapilot/ai.ts`, module-level `ENV` (line 8) and its use at
  lines 146/148/183/185.
- **Severity:** Medium (blocks `npm run build`; does **not** affect deterministic profiling, which
  passes independently).
- **Expected outputs affected:** No.
- **Detail:** `const ENV = (...).process?.env ?? {}` infers type `{}` on the fallback branch, so
  `ENV.GROQ_API_KEY` / `GROQ_MODEL` / `GEMINI_API_KEY` / `GEMINI_MODEL` fail strict type-checking.
- **Proposed code fix (Youssef):** annotate the constant:
  ```ts
  const ENV: Record<string, string | undefined> =
    (globalThis as typeof globalThis & { process?: { env?: Record<string, string | undefined> } })
      .process?.env ?? {};
  ```
- **Status:** applied in this evidence run; build then succeeds end-to-end. Original preserved at
  `evidence/originals/ai.ts.ORIGINAL`.

## D-3 — Patch ships without a base `tsconfig.json`

- **Spec rule affected:** none (build tooling).
- **Backend file/function:** project root (missing `tsconfig.json`; only `tsconfig.test.json`
  present).
- **Severity:** Low.
- **Expected outputs affected:** No.
- **Detail:** `next build` auto-generated a `tsconfig.json`. The build works, but relying on
  auto-generation is fragile.
- **Proposed code fix (Youssef):** commit a standard Next.js `tsconfig.json` to the patch so the
  build is deterministic without auto-generation.
- **Status:** not applied (left to Youssef; auto-generation succeeded for the evidence run).

## D-4 — `profile_version` label differs (`0.2` vs `0.2-proposed`)

- **Spec rule affected:** D-20 / D-33 (versioning convention); the authoritative expected profiles
  carry `profile_version = "0.2-proposed"`.
- **Backend file/function:** `src/lib/datapilot/profiler.ts` (and `contracts.ts` / `constants.ts`
  where the version string is set) — currently emits `"0.2"`.
- **Severity:** Low (label only; the sole difference across 339 independently compared fields).
- **Expected outputs affected:** Yes, but **only** the `profile_version` string — no numeric or
  structural field.
- **Cause:** the backend was built against the pre-technical-pass snapshot of the quality package.
- **Proposed code fix (Youssef):** set the emitted profile version to `"0.2-proposed"` to match
  the authoritative package, or read it from a shared constant sourced from the spec.
- **Status:** not applied (a deterministic-output value; changing it is the backend author's call,
  not the quality role's). Recorded as a divergence, not a failure.

## D-5 — Structured `warning_details[]` added (additive superset)

- **Spec rule affected:** the warning schema in the backend handoff (which *requested* structured
  warnings with `code`, `column`, `severity`, `message`, `evidence`).
- **Backend file/function:** `src/lib/datapilot/profiler.ts` (warning emission).
- **Severity:** Low (additive; not a defect).
- **Expected outputs affected:** No — the plain-string `warnings[]` array matches the authoritative
  expected output exactly; `warning_details[]` is an **extra** field the comparison ignores.
- **Detail:** the backend emits both the spec's `warnings` (strings) and an additional
  `warning_details` array carrying the structure the handoff asked for. This is a value-add, not a
  divergence from any required value.
- **Proposed action:** none required. Optionally, adopt `warning_details` into a future spec
  version (see proposed spec change below).

---

## Summary table

| ID | Area | Severity | Expected outputs affected | Fix applied for evidence | Owner to action |
|---|---|---|---|---|---|
| D-1 | Test harness cast | Low | No | Yes (test only) | Youssef |
| D-2 | AI env typing (build) | Medium | No | Yes (typing only) | Youssef |
| D-3 | Missing `tsconfig.json` | Low | No | No | Youssef |
| D-4 | `profile_version` label | Low | Label only | No | Youssef |
| D-5 | `warning_details[]` extra | Low | No (additive) | No | — |

**No High-severity divergence. No deterministic numeric or structural field diverges.** The two
fixes applied to obtain execution evidence are typing/harness only and are preserved with
originals.

---

## Proposed spec change — requires Ahmad and Integration Lead approval

**PSC-1: Adopt structured warnings (`warning_details[]`) into the profile contract.**
The backend already emits a structured warning array (`code`, `column`, `severity`, `message`,
`evidence`) alongside the plain-string `warnings[]`. The current spec contract lists only
`warnings`. Formally adding `warning_details[]` to the output contract (Session 1 §8.6) would let
the UI render severities and evidence without parsing strings, matching what the backend handoff
already requested. This is **proposed only**; it is not applied, because changing the output
contract is a spec decision owned by Ahmad and the Integration Lead, not something to be adopted
merely because the backend implements it. If approved, the expected profiles would be regenerated
to include `warning_details[]`.

No other spec change is proposed. The existing duplicate rule (D-09), status rule (D-34), error
codes, and guardrails are all matched by the backend as written and require no revision.
