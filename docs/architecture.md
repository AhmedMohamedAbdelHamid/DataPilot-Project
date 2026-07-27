# Architecture

Team 07, "AI in Applications." This document describes how DataPilot is put
together as of this revision. See `README.md` for what's done vs. planned;
this file explains *how* the done parts work.

## System overview

```
Browser (Next.js client components)
  │
  ├─ Supabase Auth (cookies) ──────────────► Supabase project
  │                                            (users only — no dataset
  │                                             storage; see "Data storage")
  │
  ├─ POST /api/datapilot/upload ───────────► deterministic profiling
  │                                            (src/lib/csv-profiler.ts)
  │
  ├─ POST /api/datapilot/ask        ┐
  ├─ POST /api/datapilot/explain    ├──────► Gemini generateContent API
  └─ POST /api/datapilot/recommend  ┘         (src/lib/gemini.ts, server-only)
```

Everything runs inside a single Next.js 16 App Router app
(`src/app/`). There is no separate backend service — Route Handlers
under `src/app/api/datapilot/` are the entire server side.

## Request flow: upload → analysis

1. User signs in (Supabase Auth) and lands on `/upload`.
2. `upload-area.tsx` POSTs the raw file as `multipart/form-data` to
   `POST /api/datapilot/upload`.
3. The route handler (`src/app/api/datapilot/upload/route.ts`):
   - Re-checks auth server-side (the `proxy.ts` middleware also blocks
     signed-out users, but the route checks independently since it's
     directly reachable).
   - Validates extension (`.csv`/`.tsv`), non-empty, size ≤
     `MAX_UPLOAD_BYTES` (15 MB), row count ≤ `MAX_ROWS` (100,000) — both
     constants live in `src/lib/csv-profiler.ts`.
   - Parses with `parseCsvText()` (PapaParse under the hood).
   - Calls `buildDatasetProfile()`, which computes everything
     deterministically: column types, missing values, duplicate rows,
     IQR-based outlier detection, Pearson correlation, a 0–100 data
     quality score (`computeDataQualityScore()`), cleaning-issue proposals,
     and chart recommendations.
   - Returns the resulting `DatasetProfile` (see `src/lib/types.ts`) as
     JSON. No numeric value in this response is ever touched by an LLM.
4. The client stores the returned profile via `DatasetProvider`
   (`src/lib/dataset-store.tsx`), which persists it to
   `window.localStorage` under `datapilot:active-dataset` and exposes it
   through `useActiveDataset()`. Every dashboard/quality/charts/insights
   page reads from this single client-side store — there's no server-side
   dataset database (see "Data storage" below).

## The grounding contract (why the AI never invents numbers)

This is the one hard constraint that shapes the whole AI layer, stated in
`README.md`: *all numeric/statistical values must come from deterministic
code; the AI may explain or recommend but must never calculate or
fabricate a number.*

Mechanically, this is enforced in `src/lib/gemini.ts`:

- `buildGroundingData(profile)` strips the `DatasetProfile` down to
  scalar facts only (no chart pixel/point arrays) and serializes it as
  `GROUNDING_DATA` JSON.
- Every Gemini call is prefixed with a fixed `SYSTEM_INSTRUCTION` that
  hard-requires the model to copy numbers only from `GROUNDING_DATA`, and
  to say "not computed yet" instead of guessing.
- `gemini.ts` is imported exclusively from Route Handlers and starts with
  `import "server-only"`, so `GEMINI_API_KEY` can never be bundled into
  client JS even by accident.

Three functions build on this contract, each calling `callGemini()` with
a different prompt:

| Function | Purpose | Output shape |
|---|---|---|
| `answerQuestionWithGemini()` | Open-ended NL Q&A, fallback only | plain text |
| `explainFindingsWithGemini()` | 3–5 analyst notes ("AI Analyst Notes") | `AiInsightSection[]` |
| `generateDecisionSupportWithGemini()` | 3–5 prioritized action recommendations | `DecisionRecommendation[]` |

The latter two request `responseMimeType: "application/json"` and
validate the parsed shape (unknown `type`/`priority` values are filtered
out) before returning — a malformed or partial Gemini response never
reaches the UI as-is.

`generateDecisionSupportWithGemini()` additionally grounds on
`cleaningDecisionCounts` (approved/rejected/pending, derived from
`DataIssue.status`) and the deterministic `insights` array, so its
recommendations can reference what the user has already decided instead
of just restating findings — see `docs/api-contracts.md` for the exact
request/response shape.

## Deterministic vs. AI-generated insights

Two separate things are both called "insights" in this codebase, kept
deliberately separate so nothing about the deterministic path can be
silently swapped for AI output:

- **`DatasetProfile.insights`** (`AiInsightSection[]`) — built entirely
  by rule-based code in `buildDatasetProfile()` (`csv-profiler.ts`).
  Despite the type name, no LLM is involved. Always present.
- **`DatasetProfile.aiAnalystNotes`** and **`.decisionRecommendations`**
  — optional, Gemini-authored, generated on-demand from `/insights` and
  persisted onto the profile once generated (see below) so a later
  report export can include them.

## Client-side state and persistence

`DatasetProvider` (`src/lib/dataset-store.tsx`) is a React Context that
holds the single active `DatasetProfile` for the session, backed by
`localStorage`:

- `setProfile()` — called once, after upload.
- `updateIssueStatus()` — approve/reject/reset a cleaning proposal;
  never mutates the underlying dataset, only `DataIssue.status`.
- `setAiAnalystNotes()` / `setDecisionRecommendations()` (exposed via
  `useAiContent()`) — persist Gemini output onto the profile after a
  successful `/insights` generation, so revisiting the page or exporting
  a report doesn't require re-calling Gemini.

All three mutators share a `patchProfile()` helper that merges the patch
into state and re-writes `localStorage` in one place.

## Data storage

There is **no server-side database for datasets or profiles** — uploaded
CSVs are parsed in-memory for the duration of the upload request and
never written to disk or a database; only the *result* (`DatasetProfile`,
a JSON summary — no raw row data) is sent back to the client and kept in
`localStorage`. Supabase is used for authentication only (`auth.users`
via `@supabase/ssr`), not for dataset storage. This matches the course
handbook's "out of scope: processing very large/private datasets" — there
is no persistence layer to secure or scale.

## Auth

- `src/proxy.ts` (Next 16 renamed `middleware.ts` → `proxy.ts`) runs
  `updateSession()` (`src/lib/supabase/middleware.ts`) on every request
  except static assets, refreshing the Supabase session cookie and
  redirecting signed-out users away from app routes.
- `src/lib/auth-actions.ts` — Server Actions for sign in/up/out (not API
  routes).
- `/auth/callback` — route handler for email confirmation links.
- Each `/api/datapilot/*` Route Handler independently re-checks
  `supabase.auth.getUser()` — defense in depth, since a Route Handler is
  reachable directly regardless of which page it was called from.

## Report export

`src/lib/report-generator.ts` builds a shared outline
(`buildReportOutline()`) from the current `DatasetProfile` and the
user-selected `ReportSection[]` (`src/lib/report-config.ts`), then
renders it two ways:

- `generatePdfReport()` — via `jsPDF`, manual pagination
  (`createPdfWriter()`).
- `generateDocxReport()` — via the `docx` package.

Both consume the exact same outline, so PDF and DOCX exports always stay
in sync. Sections 8–9 (AI Analyst Notes, Decision-Support
Recommendations) fall back to a "visit Insights to generate them first"
message if the corresponding profile field is absent.

## Frontend structure

Next.js 16 App Router, TypeScript, Tailwind, shadcn/ui, recharts,
framer-motion. Pages under `src/app/`: landing, `/login`, `/signup`,
`/upload`, `/analyzing` (transitional loading state), `/dashboard`,
`/data-quality`, `/charts`, `/insights`, `/ask-ai`, `/reports`,
`/settings` — see `src/lib/nav-config.ts` for the canonical nav list.
Shared UI lives in `src/components/shared/`; shadcn primitives in
`src/components/ui/`.

## Tech stack

Next.js 16.2, React 19, TypeScript 5, Tailwind CSS 4, shadcn/ui,
`@base-ui/react`, `@supabase/ssr` + `@supabase/supabase-js`, PapaParse
(CSV parsing), recharts, framer-motion, jsPDF + `docx` (report export),
Gemini `generateContent` REST API (no SDK dependency).
