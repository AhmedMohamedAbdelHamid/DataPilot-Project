# Release Checklist

Use this before deploying DataPilot (Vercel or otherwise) or handing it
off for course submission. See `docs/architecture.md` for how the pieces
work and `docs/api-contracts.md` for exact API shapes.

## 1. Environment variables

Copy `.env.local.example` to `.env.local` (locally) or set these in the
hosting provider's project settings (Vercel: Project → Settings →
Environment Variables):

| Variable | Required | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | yes | Supabase project URL (Project Settings → API) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes | Safe to expose to the browser — access is governed by Row Level Security, not secrecy |
| `GEMINI_API_KEY` | yes, for the AI layer | Server-only — never prefix with `NEXT_PUBLIC_`. Get one at https://aistudio.google.com/apikey. Without it, `/ask-ai`, `/insights`, and the two AI report sections degrade gracefully (clean `503`s, no crashes) but produce no AI content |
| `GEMINI_MODEL` | no | Overrides the default `gemini-2.5-flash` if that model is ever deprecated — check https://ai.google.dev/gemini-api/docs/models if `/insights` or `/ask-ai` start failing in production with a model-not-found error |

**Never** put the Supabase `service_role` key in a `NEXT_PUBLIC_` variable,
and never let `GEMINI_API_KEY` reach client code — both are called out in
`.env.local.example` and enforced for Gemini by `gemini.ts` importing
`server-only`.

## 2. Supabase project setup

- [ ] Supabase project created, URL/anon key copied into env vars above.
- [ ] Email auth enabled (Authentication → Providers).
- [ ] Site URL and Redirect URLs (Authentication → URL Configuration) set
      to the deployed domain, including `/auth/callback`, or email
      confirmation links will redirect to the wrong host.
- [ ] No dataset-related tables are required — DataPilot doesn't persist
      uploaded data or profiles server-side (see `docs/architecture.md`
      → "Data storage"). Supabase is auth-only.

## 3. Pre-deploy checks (run locally)

```bash
npm install
npx tsc --noEmit   # must be clean
npx eslint .        # must be clean on src/ — the repo also ships
                     # docs-build/build-doc.js, which is not part of
                     # the app and can be excluded/ignored if it fails
npm run build        # production build must succeed
```

`tsc --noEmit` and `eslint` are verified clean on every file under `src/`
as of this revision.

`npm run build` needs outbound network access to `fonts.googleapis.com`
at build time — `layout.tsx` uses `next/font/google` (Geist, Geist Mono),
which fetches the font files during `next build`, not at runtime. Vercel
builds have this access by default, so this is normally a non-issue; it
only bites in network-restricted CI/sandbox environments. If `npm run
build` ever fails there with a `next/font: error: Failed to fetch` for
Geist, either allow that host in the build environment, or switch
`layout.tsx` to `next/font/local` with vendored font files.

## 4. Deploying to Vercel

- [ ] Import the repo into a new Vercel project (framework preset:
      Next.js — auto-detected).
- [ ] Set the four environment variables from step 1 for the
      Production (and Preview, if used) environment.
- [ ] Confirm build command is `next build` and output is the default
      (no custom `vercel.json` is required for this app).
- [ ] Deploy, then manually smoke-test on the live URL:
  - [ ] Sign up with a real email → confirmation email arrives →
        `/auth/callback` redirects correctly → signed in.
  - [ ] Upload a small CSV → profile renders on `/dashboard`.
  - [ ] `/data-quality` shows the score and issues; approve/reject a fix.
  - [ ] `/insights` generates AI Analyst Notes and Decision-Support
        Recommendations (skip if `GEMINI_API_KEY` isn't set for this
        environment — confirm it fails gracefully instead of crashing).
  - [ ] `/ask-ai` answers a basic question (e.g. "how many rows") without
        hitting Gemini, and a follow-up open-ended question does.
  - [ ] `/reports` exports both PDF and DOCX; confirm the AI Analyst
        Notes and Decision-Support sections appear if generated, and show
        the "visit Insights first" fallback if not.
  - [ ] Sign out → protected routes redirect to `/login`.

## 5. Known limits to keep in mind

- 15 MB / 100,000-row upload limit (`MAX_UPLOAD_BYTES`, `MAX_ROWS` in
  `src/lib/csv-profiler.ts`) — intentional, matches the course handbook's
  "out of scope: processing very large/private datasets."
- No dataset persistence: refreshing after clearing `localStorage`, or
  opening the app in a different browser/device, loses the active
  dataset. This is expected for the current scope, not a bug.
- Gemini responses are session-only until a successful `/insights`
  generation persists them onto the profile (`aiAnalystNotes`,
  `decisionRecommendations`) — see `docs/architecture.md`.

## 6. Course handbook scope reminder

Out of scope for this project (do not add without discussing with the
team first): executing arbitrary uploaded code, processing very
large/private datasets, letting AI invent statistics.
