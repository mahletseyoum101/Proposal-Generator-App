# Security Audit

A full pass over every server-side entry point (API routes, RLS policies, storage policies,
secret handling, dependencies, and git history), done deliberately rather than as a diff review,
since the ask was "make sure there are no vulnerabilities in the app" rather than "review the
latest change."

## Findings

### 1. CRITICAL — Overly broad RLS policy leaked every proposal via the public anon key

**Where:** `supabase/migrations/0001_init.sql`, the `"Anyone can read a published proposal by
token"` policy on `proposals`.

**The bug:** the policy granted the `anon` role `SELECT` on any row where `status <> 'draft'`,
with no filter tying it to a specific `public_token`. `NEXT_PUBLIC_SUPABASE_ANON_KEY` is, by
design, shipped in every page's JavaScript bundle — anyone can extract it. With that key, a call
directly to Supabase's REST API (`GET /rest/v1/proposals?select=*`, bypassing the Next.js app
entirely) would return **every non-draft proposal in the database**: client names, business
names, pricing, brief text, and — critically — every proposal's `public_token`, letting an
attacker enumerate and open every "unguessable" client link in the system.

**Why it existed:** written defensively during initial schema design as a fallback anon-read
path, but the app was built to always use the service-role client
(`lib/supabase/admin.ts`) for the public proposal page and all `/api/public/*` routes instead —
confirmed by grepping every `.from("proposals")` call site. The policy was dead code from the
app's perspective, but very much live from the database's.

**Fix:** `supabase/migrations/0002_remove_anon_policies.sql` drops the policy. Zero functional
impact — nothing in the app ever relied on it. **This migration must be run manually in the
Supabase SQL Editor** (the app's credentials can't run DDL); see `README.md`.

### 2. MODERATE — Storage policy allowed enumerating every client's signature image

**Where:** the `"Signature images are publicly readable"` policy on `storage.objects`.

**The bug:** the `signatures` bucket is created with `public: true`, which already lets the app
serve a signature image by its exact, known path with no RLS policy needed at all — public
buckets serve objects directly, bypassing RLS. The additional `SELECT` policy therefore only
added the ability to **list** the bucket's contents via the Storage API, exposing every client's
e-signature (a piece of personal data) to anyone with the anon key.

**Fix:** dropped in the same migration as finding 1.

### 3. LOW–MODERATE — Stripe webhook could mark a proposal paid before payment cleared

**Where:** `app/api/webhooks/stripe/route.ts`.

**The bug:** the handler treated `checkout.session.completed` as proof of payment. For delayed
payment methods (bank debits, etc.), that event can fire while `payment_status` is still
`unpaid`/pending — actual settlement is reported later via
`checkout.session.async_payment_succeeded`. The original code would have marked a proposal "paid"
prematurely for any such method.

**Fix:** now checks `session.payment_status === "paid"` explicitly, and also listens for
`checkout.session.async_payment_succeeded` so delayed methods still complete correctly instead of
silently never finishing. The live Stripe webhook endpoint's subscribed events were updated to
match.

### 4. LOW — Signature upload endpoint accepted unvalidated, unbounded input

**Where:** `app/api/public/proposals/[token]/sign/route.ts` — this route is intentionally
public/unauthenticated (anyone with a proposal's link can sign it).

**The bug:** `signatureDataUrl` was decoded and uploaded to public storage with no check that it
was actually PNG image data, and no size limit — a caller could have uploaded an arbitrarily
large payload, or non-image bytes mislabeled as `image/png`, into a publicly-served bucket.

**Fix:** the request now must match `data:image/png;base64,...` exactly, the base64 payload is
capped before decoding, and the decoded bytes are checked against the real PNG magic-byte
signature before upload.

## Verified, no issue found

- **No XSS vector for proposal content.** `dangerouslySetInnerHTML` is not used anywhere in the
  codebase (grep-verified) — all AI-drafted and user-edited content renders through React's
  default (auto-escaping) JSX interpolation, including on the public, unauthenticated page.
- **Service-role key can't leak into the client bundle.** Every `createAdminClient()` call site is
  either a Route Handler (always server-only in the App Router) or a Server Component with no
  `"use client"` directive (grep-verified across the whole codebase). It also isn't
  `NEXT_PUBLIC_`-prefixed, so even an accidental import wouldn't get inlined into client
  JavaScript by Next.js's build.
- **IDOR protection on the dashboard.** `/dashboard/[id]/edit` queries by `id` alone with no
  explicit owner check in the query — but it uses the RLS-scoped authenticated client, so
  Postgres itself enforces `auth.uid() = owner_id`; requesting another user's proposal ID returns
  no row, not someone else's data.
- **Payment amount is never trusted from the client.** The Checkout Session amount is computed
  server-side from the proposal's own stored `price_total`/`deposit_percent` — there is no code
  path where a client-supplied price reaches Stripe.
- **Sign-before-pay is enforced server-side**, not just hidden in the UI — the checkout route
  returns 403 if the proposal hasn't been signed yet, independent of what the client sends.
- **Webhook signature verification** is checked before any event is trusted
  (`stripe.webhooks.constructEvent`), so forged webhook calls can't mark proposals as paid.
- **No secrets in git history.** Every API key handled during this build (Supabase, Stripe,
  Gemini) lives only in `.env.local` (gitignored) and in Netlify's environment variable store —
  confirmed via `git log -p | grep` across the full history that no real key value was ever
  committed.
- **Dependencies:** `npm audit` reports 0 known vulnerabilities across the full dependency tree.

## Recommendations (not fixed — lower priority / product decisions)

- **No rate limiting** on the public `sign`/`checkout` routes or the authenticated
  `generate-proposal` route. Anyone with a valid proposal link could hammer those endpoints; the
  worst case today is wasted Stripe/DB/Gemini calls, not a data or auth breach. Worth adding
  (e.g. Netlify's rate-limiting or a simple IP/token-bucket check) before high-traffic use.
- **No explicit Content-Security-Policy or other custom security headers.** Netlify and Next.js
  set some sensible defaults automatically (`Strict-Transport-Security`,
  `X-Content-Type-Options: nosniff`, confirmed via response headers on the live site), but there's
  no app-defined CSP. Consider adding one via `next.config.ts` headers if third-party script risk
  ever becomes a concern.
- **Proposal briefs are passed to the AI without prompt-injection hardening.** The caller is
  always the authenticated proposal owner writing about their own client, and the AI's output is
  reviewed before publishing — this isn't exploitable against the app or other users, just worth
  knowing if the "who can submit a brief" trust model ever changes (e.g. multi-seat teams).
- **CSRF protection relies on browser `SameSite` cookie defaults** rather than an explicit
  double-submit token. Reasonable for this app's risk profile (state-changing requests all
  require an authenticated session cookie, which modern browsers won't attach cross-site to a
  non-navigation request by default), but call it out if a stricter posture is ever needed.
