create extension if not exists "uuid-ossp";

create table if not exists plans (
  id uuid primary key default uuid_generate_v4(),
  idea text not null,
  plan_json jsonb not null,
  change_log jsonb,
  created_at timestamptz not null default now(),
  last_synced_at timestamptz
);

create table if not exists tasks (
  id uuid primary key default uuid_generate_v4(),
  plan_id uuid references plans(id) on delete cascade,
  source text check (source in ('asana', 'jira')),
  external_id text,
  payload jsonb,
  created_at timestamptz not null default now()
);

create table if not exists risk_logs (
  id uuid primary key default uuid_generate_v4(),
  plan_id uuid references plans(id) on delete cascade,
  risks jsonb not null,
  changes_summary text,
  created_at timestamptz not null default now()
);
