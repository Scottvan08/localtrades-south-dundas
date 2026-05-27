create extension if not exists pgcrypto;

create table if not exists providers (
  id uuid primary key default gen_random_uuid(),
  business_name text not null,
  sms_number text not null unique,
  contact_name text,
  categories text[] not null default '{}',
  towns_served text[] not null default '{}',
  serves_all_sdg boolean not null default false,
  accepts_leads boolean not null default true,
  paused boolean not null default false,
  priority integer not null default 0,
  opt_out_at timestamptz,
  paused_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  lead_type text not null default 'matching',
  routing_mode text not null default 'sms_matching',
  reroute_allowed boolean not null default true,
  service text not null,
  urgency text,
  town text,
  property_type text,
  details text,
  budget_range text,
  contact_name text,
  contact text,
  preferred_contact text,
  availability text,
  photo_count integer not null default 0,
  photo_metadata jsonb not null default '[]'::jsonb,
  selected_provider_id text,
  selected_provider_name text,
  routing_policy jsonb not null default '{}'::jsonb,
  ai_summary text,
  score integer,
  intent text,
  snapshot jsonb not null default '{}'::jsonb,
  status text not null default 'new',
  claimed_provider_id uuid references providers(id),
  claimed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table leads add column if not exists lead_type text not null default 'matching';
alter table leads add column if not exists routing_mode text not null default 'sms_matching';
alter table leads add column if not exists reroute_allowed boolean not null default true;
alter table leads add column if not exists routing_policy jsonb not null default '{}'::jsonb;

create table if not exists routing_attempts (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  provider_id uuid not null references providers(id),
  token text not null unique,
  token_expires_at timestamptz not null,
  status text not null default 'sent',
  timeout_minutes integer not null default 12,
  sms_body text,
  responded_at timestamptz,
  claimed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads(id) on delete set null,
  provider_id uuid references providers(id) on delete set null,
  direction text not null,
  channel text not null default 'sms',
  body text not null,
  provider_message_id text,
  status text,
  status_payload jsonb,
  created_at timestamptz not null default now()
);

create index if not exists providers_lead_match_idx on providers using gin (categories, towns_served);
create index if not exists routing_attempts_token_idx on routing_attempts (token);
create index if not exists routing_attempts_open_idx on routing_attempts (provider_id, status, created_at desc);
create index if not exists leads_status_idx on leads (status, created_at desc);
