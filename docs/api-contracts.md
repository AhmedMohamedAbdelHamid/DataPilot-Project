# API Contracts

All routes below live under `src/app/api/datapilot/` and run on
`runtime = "nodejs"`. See `docs/architecture.md` for how they fit
together and for the grounding contract that governs the AI ones.

## Conventions

- **Auth**: every route requires a signed-in Supabase session
  (`supabase.auth.getUser()`). Unauthenticated requests get `401`.
  Auth is enforced twice — once in `src/proxy.ts` (redirects signed-out
  users away from app pages) and again inside each Route Handler, since
  the handler is directly reachable by POST regardless of which page
  called it.
- **Errors**: every error response has the shape `{ "error": string }`
  with a non-2xx status. There is no separate error-code enum — match on
  status code and surface `error` as-is; it's already a
  user-presentable message.
- **Content type**: all routes except `upload` expect and return JSON
  (`Content-Type: application/json`). `upload` expects
  `multipart/form-data`.
- **`DatasetProfile`** is the shared payload type threaded through
  `ask`, `explain`, and `recommend` — the client always sends the full
  profile it already has (from `upload` or from `localStorage`), never
  just an ID, because there is no server-side dataset store to look one
  up by ID. See `src/lib/types.ts` for the full shape.

---

## `POST /api/datapilot/upload`

Parses and profiles an uploaded CSV/TSV, entirely with deterministic
code — no AI involved in this route.

**Auth**: required (`401` if signed out).

**Request**: `multipart/form-data` with a single field:

| Field | Type | Required | Notes |
|---|---|---|---|
| `file` | File | yes | Must end in `.csv` or `.tsv`, non-empty, ≤ 15 MB (`MAX_UPLOAD_BYTES`), ≤ 100,000 data rows (`MAX_ROWS`) |

**Response `200`**:
```json
{ "profile": DatasetProfile }
```

**Errors**:

| Status | When |
|---|---|
| `401` | Not signed in |
| `400` | Body isn't `multipart/form-data`; no `file` field; wrong extension; empty file |
| `413` | File exceeds 15 MB, or exceeds 100,000 rows |
| `422` | No columns detected, or PapaParse reported non-trivial parse errors (ragged-row `FieldMismatch` warnings are tolerated) |

---

## `POST /api/datapilot/ask`

Answers an open-ended natural-language question about the dataset via
Gemini, strictly grounded in the profile's precomputed numbers. Called
only as a fallback from `/ask-ai` — `answerFromProfile()`
(`src/lib/csv-profiler.ts`) runs first and handles recognized questions
instantly, without a network call.

**Auth**: required (`401`).

**Request body**:
```ts
{
  question: string;        // required, non-empty
  profile: DatasetProfile; // required
  history?: { role: "user" | "assistant"; content: string }[]; // optional, last 6 used
}
```

**Response `200`**:
```json
{ "answer": "string", "source": "ai" }
```

**Errors**:

| Status | When |
|---|---|
| `401` | Not signed in |
| `503` | `GEMINI_API_KEY` not configured on the server |
| `400` | Malformed JSON body, missing `question`, or missing `profile` |
| `502` | Gemini call failed (timeout, non-2xx, empty response) — `error` carries the underlying `GeminiError` message |

---

## `POST /api/datapilot/explain`

Generates 3–5 short AI Analyst Notes explaining what matters most in the
dataset. Called from `/insights`, auto-triggered once per uploaded
dataset and persisted to `DatasetProfile.aiAnalystNotes` on success (see
`useAiContent()` in `src/lib/dataset-store.tsx`).

**Auth**: required (`401`).

**Request body**:
```ts
{ profile: DatasetProfile } // required
```

**Response `200`**:
```json
{ "insights": AiInsightSection[] }
```
Each `AiInsightSection`:
```ts
{
  id: string;
  type: "summary" | "finding" | "pattern" | "recommendation" | "risk" | "opportunity";
  title: string; // under 12 words
  body: string;  // 1-3 sentences
  tags?: string[];
}
```
1–5 items, filtered server-side to only well-formed entries with a
recognized `type`.

**Errors**:

| Status | When |
|---|---|
| `401` | Not signed in |
| `503` | `GEMINI_API_KEY` not configured |
| `400` | Malformed JSON body, or missing `profile` |
| `502` | Gemini call failed, returned invalid JSON, returned a non-array, or returned zero usable insights after filtering |

---

## `POST /api/datapilot/recommend`

Generates 3–5 prioritized decision-support recommendations — actionable
next steps, not just observations. Grounded in the same
`GROUNDING_DATA` as `/explain`, plus explicit
`cleaningDecisionCounts` (approved/rejected/pending, derived from each
`DataIssue.status`) so recommendations can reference what the user has
already decided on cleaning fixes. Called from `/insights`, auto-triggered
once per uploaded dataset and persisted to
`DatasetProfile.decisionRecommendations` on success.

**Auth**: required (`401`).

**Request body**:
```ts
{ profile: DatasetProfile } // required
```

**Response `200`**:
```json
{ "recommendations": DecisionRecommendation[] }
```
Each `DecisionRecommendation`:
```ts
{
  id: string;
  title: string;             // under 12 words, action-oriented
  body: string;               // 1-3 sentences on what to do and why
  priority: "high" | "medium" | "low";
  basedOn: string[];          // issue/insight titles from GROUNDING_DATA it cites
}
```
1–5 items, filtered server-side to only well-formed entries with a
recognized `priority`; `basedOn` entries that aren't strings are dropped.

**Errors**:

| Status | When |
|---|---|
| `401` | Not signed in |
| `503` | `GEMINI_API_KEY` not configured |
| `400` | Malformed JSON body, or missing `profile` |
| `502` | Gemini call failed, returned invalid JSON, returned a non-array, or returned zero usable recommendations after filtering |

---

## Auth routes (Supabase, not REST JSON APIs)

Sign in/up/out go through Next.js **Server Actions**
(`src/lib/auth-actions.ts`), not `/api/*` routes — call them directly
from Server/Client Components rather than fetching a URL. This is the
one deviation from the request/response contract above, noted here
because it's easy to assume otherwise:

- `signIn(formData)`, `signUp(formData)`, `signOut()` — Server Actions.
- `GET /auth/callback` — the one real route handler in this group,
  used for email-confirmation redirect links.

An API-route-based auth surface (`/api/auth/*`) is not built and is not
currently planned — see `README.md` "Not started yet" for the exact
wording used there ("`signIn`/`signUp`/`signOut` are Server Actions, not
an API route — that's still a separate not-started item").
