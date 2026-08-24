# Build Log

A chronological record of how this app was built, the decisions made along the way, and every
real bug hit and fixed. Written for whoever picks this project up next.

## 1. Requirements and template analysis

The brief: a PandaDoc-style proposal platform, minus the template builder — one fixed, reused
template instead. Sign in → describe a project → AI drafts a proposal into that template → review
→ publish to a public link → client signs → client pays → celebration screen.

Before writing any code, the source template (`Proposal_Template.docx`) was extracted (unzipped
as a `.docx` is a zip of XML) and its text, structure, colors, and logo were pulled out directly
from `word/document.xml` and `word/media/`, rather than guessed at. That gave an exact palette
(`#B8912B` gold, `#241C13` ink, `#FAF6EC` cream, etc.) and section structure to match pixel-for-pixel
rather than approximate.

Clarifying questions were asked and answered up front rather than assumed:

- **Review before publish** — the AI draft is never live until the owner approves it.
- **Configurable payment** — full price or a deposit %, not a fixed 50%.
- **Built-in signature pad** — no third-party e-sign vendor.
- **Sign-then-pay** — the pay panel is locked until a signature is recorded, enforced server-side.
- **Guided setup** for Supabase, Stripe, and Anthropic accounts, all created during the build.

## 2. Architecture

- **Next.js 16** (App Router, Turbopack in dev) chosen for a single codebase covering the
  authenticated dashboard, the public proposal page, and all API routes, deployed on Netlify.
- **Supabase** for Auth + Postgres + Storage — one backend instead of stitching together separate
  auth/DB/file-storage services.
- **Anthropic API**, called server-side only, using forced tool-use so the model's output is
  validated structured JSON, not freeform text the app has to parse or trust.
- **Stripe Checkout** (hosted page) rather than embedding Stripe Elements — simpler, PCI scope
  stays with Stripe, and it fit the "redirect to pay" flow naturally.
- **Public pages read via the Supabase service-role key**, not the anon key — the public proposal
  page and its sign/pay/status routes all use `lib/supabase/admin.ts`, keeping RLS as the
  authenticated-owner boundary and the service role as the deliberate, audited exception for
  unauthenticated client-facing actions.

## 3. Initial build

Scaffolded with `create-next-app` (TypeScript, Tailwind, App Router), then built out in order:

1. **Database schema** (`supabase/migrations/0001_init.sql`): `proposals`, `proposal_signatures`,
   `proposal_payments`, RLS policies for owner CRUD, and a public `signatures` storage bucket.
2. **Auth**: Supabase email/password, a `proxy.ts` (Next.js 16 renamed `middleware.ts` to
   `proxy.ts` mid-development — see §6) that refreshes the session and redirects
   unauthenticated users away from `/dashboard`.
3. **AI generation** (`lib/anthropic.ts`): a forced tool-use call to `claude-opus-5` with a JSON
   schema mirroring the template's sections.
4. **The template component** (`components/ProposalTemplate.tsx`): the single source of visual
   truth, used both in the live preview while editing and on the public page.
5. **Signature capture** (`components/SignaturePad.tsx`): a canvas-based draw mode plus a typed
   mode, both exporting the same PNG data-URL shape.
6. **Stripe integration**: a Checkout Session created server-side from the proposal's own stored
   price (never trusting a client-supplied amount), and a signature-verified webhook to confirm
   payment.
7. **Celebration screen**: `canvas-confetti` fired once, gated on actually arriving from a
   completed Stripe redirect (not on every future page load of an already-paid proposal).

## 4. Bugs found during local end-to-end testing

Real browser automation (Playwright), not just code review, caught three genuine bugs:

- **`base64url` encoding unsupported.** The `public_token` column's default used
  `encode(gen_random_bytes(12), 'base64url')` — `base64url` wasn't added to Postgres's `encode()`
  until v18, and Supabase's managed Postgres was older. Every insert failed. Fixed by switching to
  `hex` encoding (`supabase/migrations/0001_init.sql`, then patched live via an `alter column`
  before the schema was otherwise finalized).
- **Route collision.** `app/api/proposals/[id]/...` and `app/api/proposals/[token]/...` can't
  coexist — Next.js requires one dynamic-segment name per directory level. Fixed by moving the
  public, token-based routes to `app/api/public/proposals/[token]/...`, which also made the
  authenticated-vs-public split explicit in the URL structure.
- **A real hydration bug.** The proposal editor computed its shareable-link display with
  `typeof window !== "undefined" ? window.location.origin : ...` — a textbook anti-pattern that
  renders different text on the server (no `window`) than on the client, causing a React
  hydration mismatch. Fixed by using the `NEXT_PUBLIC_SITE_URL` env var instead, which is
  identical on server and client since it's inlined at build time.

Anthropic API credits ran out partway through testing. Rather than block on billing, a small
throwaway seed script (never committed) inserted a realistic proposal directly into the database,
bypassing only the AI call — everything downstream (edit, publish, sign, pay, webhook, success
screen) was verified for real regardless.

## 5. Template redesign

The user later supplied a second, more sophisticated template (`Client_Proposal_Template.docx`),
extracted and diffed against the first the same way. It added a Problem Areas / Solution grid, a
"Why Us" section, an expanded 6-step process, itemized per-category pricing, an "Our Team"
section, and an "Agreement at a Glance" summary — but several of its sections turned out to be
identical, non-personalized boilerplate rather than genuinely per-client content (verified by
comparing the same section's wording across both source templates).

Rather than re-run everything through the AI, content was split by what it actually was:

- **`lib/agency-content.ts`** — fixed Dodo Digital company copy (Why Us, Why That Matters, the
  process steps, the promise, the agreement terms), edited once, applied to every proposal.
- **`lib/anthropic.ts`**'s schema shrank from 17 AI-drafted fields to 7 — only the parts that are
  genuinely about the specific client (problem areas, solution benefits, package deliverables, a
  project title, a closing line) go through the model now. Cheaper, faster, and more reliable.
- Per-category pricing is computed from an AI-suggested `price_weight` per category
  (`lib/types.ts`'s `categoryAmounts`), normalized so the line items always sum exactly to the
  proposal's total — no AI arithmetic errors possible.
- The "Our Team" section was dropped per the user's decision (the template's own founder photos
  were generic placeholder initials, not real content).

This surfaced one more real bug: `toLocaleDateString`/`toLocaleString` calls without an explicit
locale/timezone rendered differently on the server (Netlify, UTC) than in a visitor's browser near
a day boundary or with a different default `Intl` locale — another hydration mismatch, this time
caught during the *production* end-to-end test. Fixed by pinning `timeZone: "UTC"` and
`"en-US"` explicitly everywhere `ProposalTemplate` formats a date or number, since that component
renders inside a Client Component (the editor) where server/client divergence is possible.

## 6. Deploying to Netlify

This was the longest part of the build, mostly due to environment-specific issues that only show
up once you actually try to ship:

1. **Netlify CLI login** required a one-time browser OAuth step — not scriptable, so the
   authorization URL was surfaced directly to the user to click through.
2. **`netlify init`'s interactive Git-linking prompt** failed outright in a non-TTY shell
   (`Error [ERR_USE_AFTER_CLOSE]: readline was closed`). Worked around by creating the site
   non-interactively (`netlify sites:create`), linking it (`netlify link --id`), and setting all
   environment variables via `netlify env:set`.
3. **A genuine Windows-only bug in Netlify's edge-function bundler.** Deploying via
   `netlify deploy --build` (which builds locally) failed bundling the `proxy.ts` middleware into
   an Edge Function, with a garbled path
   (`file:///Users/HP/...C:/Users/HP/...`) mixing POSIX and Windows path styles — a bug in
   Netlify's tooling, not the app. It reproduced identically under both Turbopack and webpack
   builds, ruling out a Next.js 16 Turbopack-compatibility theory. The actual fix was to stop
   building locally altogether: linking the GitHub repo for continuous deployment moved the build
   onto Netlify's own Linux infrastructure, where the bug doesn't occur (confirmed — the same
   `netlify.toml` build command succeeded immediately once run on their CI). `netlify.toml` still
   pins `next build --webpack` as a deliberate, deterministic choice, independent of that bug.
4. **Netlify's "visitor access control."** The new team's plan made every site private by
   default, gating it behind a Netlify login page (`app.netlify.com/edge-access`) before a visitor
   could see anything — a blocker for a tool whose entire point is unauthenticated client-facing
   links. Fixed by the user disabling it in the site's dashboard settings.
5. **"Unrecognized Git contributor."** A team-level contributor-verification security setting
   blocked the first CI build even though the pushing account was the repo's own owner. Resolved
   by the user directly in the Netlify dashboard.
6. A stray local `rm -rf .netlify` (clearing build cache before a local test build) also deleted
   the CLI's site-link state file, causing a confusing "No teams available" error on the next
   deploy attempt — simply re-running `netlify link --id <site-id>` fixed it. `.netlify/**` was
   also added to the ESLint ignore list after it briefly caused ESLint to lint Netlify's own
   bundled/minified edge-function output, producing thousands of spurious warnings.

Once linked, `git push` triggers an automatic production deploy — no further manual deploy steps
needed. (The user ultimately triggered the very first successful deploy manually from the
dashboard after fixing the contributor-verification setting; everything since is CI-driven.)

## 7. Security hardening

See [`SECURITY.md`](SECURITY.md) for the full audit. In short: a systematic pass over every API
route, the RLS policies, the storage bucket policy, dependency versions, and git history caught
one critical finding (an overly broad Row Level Security policy that let anyone with the public
anon key — which ships in every page's JavaScript by design — read every proposal in the database
via the Supabase REST API directly, bypassing the app entirely) plus a few smaller hardening
fixes, all addressed in the same pass.

## 8. Switching AI providers: Claude Opus 5 → Gemini

The Anthropic account used throughout this build never had a funded credit balance, which blocked
testing the real generation step end-to-end (confirmed directly against the Anthropic API, not
just in-app — same "credit balance is too low" error). Rather than block further on billing, the
user asked to switch to a genuinely free option instead. ChatGPT/OpenAI was ruled out immediately
since it uses the identical paid-credits API model as Anthropic — switching to it wouldn't have
solved anything. Two real no-cost options were weighed: Groq's free tier (serves actual
open-source models — Llama, etc.) and Google Gemini's free tier (closed model, but with a
genuinely free, no-credit-card-required tier and native structured-JSON output). The user picked
Gemini.

The swap: `lib/anthropic.ts` → `lib/ai.ts`, `@anthropic-ai/sdk` → `@google/genai`, and the
Anthropic tool-use schema rewritten as a Gemini `responseSchema` (JSON mode) — functionally the
same job, forcing the model into the same structured output the app already expected, so nothing
downstream (`app/api/generate-proposal/route.ts`, the `ProposalContent` type, the template
component) needed to change. `ANTHROPIC_API_KEY` became `GEMINI_API_KEY` throughout `.env.example`,
the README, and Netlify's environment variables. User-facing copy that named "Opus 5" specifically
(the create-proposal form, loading states) was generalized to just "AI," so it won't need editing
again if the provider changes a third time.

## Testing approach throughout

At every major milestone, the app was driven with real Playwright browser automation against a
running instance (local dev, then production) — not just `npm run build` succeeding — covering
sign-up/login, AI generation (or a seeded stand-in when Anthropic credits were unavailable),
publish, the public page, both signature modes, a real Stripe test-mode checkout, webhook-driven
status updates, and the success screen. Test data (users, proposals, signatures, payments) was
created via throwaway scripts and cleaned up afterward rather than left in the database, and the
`playwright` package itself was added and removed from `devDependencies` around each verification
pass rather than left as a permanent test-suite dependency, since none was requested.
