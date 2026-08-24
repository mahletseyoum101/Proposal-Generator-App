# Dodo Digital Proposals

A proposal generation platform, purpose-built for Dodo Digital. Sign in, describe a project in a
paragraph, let AI (Google Gemini) draft the client-specific parts of the proposal into a fixed,
professionally designed template, review and edit it, publish it to a shareable public link, and
let the client sign and pay right on that page — ending in a confetti success screen.

**Live app:** [dodo-digital-proposals.netlify.app](https://dodo-digital-proposals.netlify.app)

Related docs: [`BUILD_LOG.md`](BUILD_LOG.md) (how this was built, step by step) ·
[`SECURITY.md`](SECURITY.md) (security audit and hardening notes)

## What it does

1. **Sign in** (Supabase Auth) and land on a **dashboard** listing every proposal you've created,
   with a status badge (Draft → Published → Viewed → Signed → Paid).
2. **Create a proposal**: enter the deal terms (client, package, price, deposit %, timeline,
   revisions) and a 1–2 paragraph brief describing the project. Gemini drafts the
   client-specific sections — problem areas, solution benefits, package deliverables, a project
   title, and a closing line — while the surrounding company copy (why us, our process, the
   promise, the agreement summary) stays fixed and consistent across every proposal.
3. **Review and edit** the draft with a live preview, then **Publish** to get a shareable,
   unauthenticated public URL.
4. The **client opens the link** — no login required — reads the full proposal, **signs**
   (drawn or typed signature), and once signed, **pays** via Stripe Checkout (full amount or a
   configurable deposit). A webhook confirms the payment server-side and the page shows a
   celebratory success screen.

## Stack

- **Next.js 16** (App Router, TypeScript, Tailwind CSS) — deployed on Netlify
- **Supabase** — Auth (email/password), Postgres (with Row Level Security), Storage (signature images)
- **Google Gemini API** (`gemini-2.5-flash`, free tier) — drafts the client-specific proposal content
- **Stripe** — Checkout Sessions + webhook for signature-gated payment

## Project layout

```text
app/
  login/, signup/            Auth pages
  dashboard/                 Authenticated: proposal list, create form, edit/review + publish
  p/[token]/                 Public: the proposal page (view, sign, pay)
  api/
    generate-proposal/       POST — calls Gemini, creates a draft proposal (authenticated)
    proposals/[id]/          PATCH/publish — owner-only edits (authenticated, RLS-scoped)
    public/proposals/[token]/  sign, checkout, status — public, service-role-backed
    webhooks/stripe/         Stripe webhook (signature-verified)
components/
  ProposalTemplate.tsx       The single source of visual truth for a proposal
  SignaturePad.tsx           Draw/type signature capture
  CelebrationAnimation.tsx   Confetti on payment success
  editor/                    Review/edit form controls for the dashboard
lib/
  agency-content.ts          Fixed Dodo Digital company copy, shared by every proposal
  ai.ts                      Gemini call + structured-output schema
  stripe.ts, types.ts
  supabase/{client,server,admin,middleware}.ts   Browser / server / service-role clients
supabase/migrations/         Postgres schema, RLS policies, storage bucket (run in order)
proxy.ts                      Auth-gate for /dashboard (Next.js 16's middleware convention)
```

## Local setup

```bash
npm install
cp .env.example .env.local   # then fill in the values below
npm run dev
```

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL Editor, run each file in [`supabase/migrations/`](supabase/migrations/) **in order** (`0001_init.sql`, then `0002_remove_anon_policies.sql`, etc.). They create the `proposals`, `proposal_signatures`, and `proposal_payments` tables, their RLS policies, and a public `signatures` storage bucket.
3. In **Project Settings → API**, copy into `.env.local`:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `publishable` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `secret` key → `SUPABASE_SERVICE_ROLE_KEY` (server-only — never expose this to the browser)
4. Email/password sign-in is enabled by default under **Authentication → Providers** — that's all this app uses. You can turn off "Confirm email" while testing, if you'd rather skip the confirmation email step.

### 2. Google Gemini

1. Create a free API key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey) — no credit card required for the free tier.
2. Set it as `GEMINI_API_KEY`.

### 3. Stripe

1. Create an account at [stripe.com](https://stripe.com) (test mode is on by default — use it until you're ready to go live).
2. **Developers → API keys** → copy the **Secret key** into `STRIPE_SECRET_KEY`.
3. For local webhook testing, install the [Stripe CLI](https://stripe.com/docs/stripe-cli) and run:

   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

   It prints a `whsec_...` value — set that as `STRIPE_WEBHOOK_SECRET` locally.
4. For production, add a webhook endpoint in **Developers → Webhooks** pointing at `https://<your-site>/api/webhooks/stripe`, listening for `checkout.session.completed` and `checkout.session.async_payment_succeeded`, and set its signing secret as `STRIPE_WEBHOOK_SECRET` in your Netlify environment variables.
5. Test payments with card `4242 4242 4242 4242`, any future expiry, any CVC.

### 4. Deploying to Netlify

1. Push this repo to GitHub and link it under **Site configuration → Build & deploy → Continuous deployment** in the Netlify dashboard (this runs builds on Netlify's own Linux infrastructure — see [`BUILD_LOG.md`](BUILD_LOG.md) for why that matters on Windows).
2. In **Site configuration → Environment variables**, add everything from `.env.example` with your real values.
3. Set `NEXT_PUBLIC_SITE_URL` to your Netlify URL (or custom domain) — it's used to build Stripe's success/cancel redirect links.
4. If your Netlify team has "Visitor access control" enabled (common on trial/team plans), turn it off for this site — client-facing proposal links must be viewable with no login.
5. Deploy, then finish step 3.4 above (production Stripe webhook) using the live URL.

## Editing the fixed company copy

Sections like "Why Us," "Why That Matters," the process steps, the promise, and the agreement
summary are the same on every proposal by design — Gemini only drafts the sections that are
genuinely client-specific (see `lib/ai.ts`'s schema). To change the standing copy for
every future proposal, edit [`lib/agency-content.ts`](lib/agency-content.ts) directly; no
database change or regeneration needed.
