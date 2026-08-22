-- Dodo Digital proposal platform: core schema

create extension if not exists "pgcrypto";

create table if not exists proposals (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,

  client_name text not null,
  business_name text not null,
  client_email text,

  package_name text not null,
  price_total numeric(12, 2) not null default 0,
  deposit_percent integer not null default 100 check (deposit_percent between 1 and 100),
  revisions_rounds integer not null default 2,
  delivery_timeline text not null default '',

  brief_text text not null default '',
  content jsonb not null default '{}'::jsonb,

  status text not null default 'draft'
    check (status in ('draft', 'published', 'viewed', 'signed', 'paid')),
  public_token text not null unique default encode(gen_random_bytes(12), 'hex'),

  created_at timestamptz not null default now(),
  published_at timestamptz,
  viewed_at timestamptz,
  signed_at timestamptz,
  paid_at timestamptz
);

create index if not exists proposals_owner_id_idx on proposals (owner_id);
create index if not exists proposals_public_token_idx on proposals (public_token);

create table if not exists proposal_signatures (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid not null references proposals (id) on delete cascade,
  signer_name text not null,
  signature_image_url text not null,
  signed_at timestamptz not null default now(),
  ip_address text,
  user_agent text
);

create index if not exists proposal_signatures_proposal_id_idx on proposal_signatures (proposal_id);

create table if not exists proposal_payments (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid not null references proposals (id) on delete cascade,
  stripe_session_id text not null unique,
  stripe_payment_intent_id text,
  amount numeric(12, 2) not null,
  currency text not null default 'usd',
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create index if not exists proposal_payments_proposal_id_idx on proposal_payments (proposal_id);

-- Row Level Security

alter table proposals enable row level security;
alter table proposal_signatures enable row level security;
alter table proposal_payments enable row level security;

-- Owners can fully manage their own proposals.
create policy "Owners can select their own proposals"
  on proposals for select
  using (auth.uid() = owner_id);

create policy "Owners can insert their own proposals"
  on proposals for insert
  with check (auth.uid() = owner_id);

create policy "Owners can update their own proposals"
  on proposals for update
  using (auth.uid() = owner_id);

create policy "Owners can delete their own proposals"
  on proposals for delete
  using (auth.uid() = owner_id);

-- Anonymous clients can read a published proposal only via its public token.
create policy "Anyone can read a published proposal by token"
  on proposals for select
  to anon
  using (status <> 'draft');

-- Owners can read signatures/payments for their own proposals.
create policy "Owners can select signatures for their proposals"
  on proposal_signatures for select
  using (
    exists (
      select 1 from proposals
      where proposals.id = proposal_signatures.proposal_id
        and proposals.owner_id = auth.uid()
    )
  );

create policy "Owners can select payments for their proposals"
  on proposal_payments for select
  using (
    exists (
      select 1 from proposals
      where proposals.id = proposal_payments.proposal_id
        and proposals.owner_id = auth.uid()
    )
  );

-- No anon/owner INSERT/UPDATE policies on proposals (beyond owner CRUD above) or on
-- signatures/payments: all status transitions, signing, and payment writes happen
-- server-side via API routes using the service-role key, which bypasses RLS.

-- Storage bucket for signature images, publicly readable (images only, no listing of other buckets).
insert into storage.buckets (id, name, public)
values ('signatures', 'signatures', true)
on conflict (id) do nothing;

create policy "Signature images are publicly readable"
  on storage.objects for select
  to public
  using (bucket_id = 'signatures');
