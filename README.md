# Dodo Digital Proposals

A proposal generation platform: sign in, describe a project in a paragraph, let Claude Opus 5
draft the full proposal into the fixed Dodo Digital template, review/edit it, publish it to a
shareable public link, and let the client sign and pay right on that page.

## Stack

- **Next.js 16** (App Router, TypeScript, Tailwind CSS) — deployed on Netlify
- **Supabase** — Auth + Postgres + Storage (signature images)
- **Anthropic API** — Claude Opus 5 drafts proposal copy
- **Stripe** — Checkout for signature-gated payment

## 1. Local setup

```bash
npm install
cp .env.example .env.local   # then fill in the values below
npm run dev
```

## 2. Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL Editor, run the contents of [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) once. It creates the `proposals`, `proposal_signatures`, and `proposal_payments` tables, their RLS policies, and a public `signatures` storage bucket.
3. In **Project Settings → API**, copy into `.env.local`:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `publishable` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `secret` key → `SUPABASE_SERVICE_ROLE_KEY` (server-only — never expose this to the browser)
4. In **Authentication → Providers**, email/password sign-in is enabled by default — that's all this app uses. You can turn off "Confirm email" under **Authentication → Sign In / Providers → Email** while testing, if you'd rather skip the confirmation email step.

## 3. Anthropic (Claude Opus 5)

1. Create a key at [console.anthropic.com](https://console.anthropic.com) → **API Keys**. This is separate from any Claude Code / Claude.ai subscription.
2. Set it as `ANTHROPIC_API_KEY`.

## 4. Stripe

1. Create an account at [stripe.com](https://stripe.com) (test mode is on by default — use it until you're ready to go live).
2. **Developers → API keys** → copy the **Secret key** into `STRIPE_SECRET_KEY`.
3. For local webhook testing, install the [Stripe CLI](https://stripe.com/docs/stripe-cli) and run:

   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

   It prints a `whsec_...` value — set that as `STRIPE_WEBHOOK_SECRET` locally.
4. For production, once deployed, add a webhook endpoint in **Developers → Webhooks** pointing at `https://<your-site>/api/webhooks/stripe`, listening for `checkout.session.completed`, and set its signing secret as `STRIPE_WEBHOOK_SECRET` in your Netlify environment variables.
5. Test payments with card `4242 4242 4242 4242`, any future expiry, any CVC.

## 5. Deploying to Netlify

1. Push this repo to GitHub/GitLab/Bitbucket and connect it in Netlify. The `netlify.toml` already configures `@netlify/plugin-nextjs`.
2. In **Site configuration → Environment variables**, add everything from `.env.example` with your real values.
3. Set `NEXT_PUBLIC_SITE_URL` to your Netlify URL (or custom domain) — it's used to build Stripe's success/cancel redirect links.
4. Deploy, then finish step 4.4 above (production Stripe webhook) using the live URL.

## How it works

- `/login`, `/signup` — Supabase Auth.
- `/dashboard` — your proposals, with status badges (Draft → Published → Viewed → Signed → Paid).
- `/dashboard/new` — enter deal terms + a 1–2 paragraph brief; Opus 5 drafts the proposal.
- `/dashboard/[id]/edit` — review/edit the draft with a live preview; Publish generates the public link.
- `/p/[token]` — the public, unauthenticated proposal page. Client signs (draw or type), then pays via Stripe Checkout, then sees a confetti success screen.
