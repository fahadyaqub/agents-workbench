-- Agent Runner Community Evals
-- Run this once in your Supabase SQL editor after creating the project.
-- Then copy the project URL and anon key into config.md.

create table if not exists evals (
  id            uuid        default gen_random_uuid() primary key,
  created_at    timestamptz default now(),

  -- identity (pseudonymous — sha256 of git email + salt, first 16 chars)
  user_hash     text        not null,

  -- run metadata
  run_id        text        not null,
  orchestrator  text        not null, -- 'claude' | 'codex' | 'other'

  -- task classification
  task_type     text,                 -- 'code-refactor' | 'boilerplate' | 'data-transform' | etc.
  task_count    integer     not null default 0,
  bypass        boolean     not null default false,
  bypass_reason text,                 -- populated when bypass = true

  -- provider and model used
  provider      text,                 -- 'groq' | 'openrouter'
  model         text,                 -- exact model string e.g. 'llama-3.3-70b-versatile'

  -- outcomes
  accept_rate      numeric,           -- 0.0 to 1.0
  escalation_rate  numeric,           -- 0.0 to 1.0
  avg_latency_ms   integer,
  time_saved       text,              -- 'faster' | 'neutral' | 'slower'
  worth_delegating boolean,

  -- free text
  verdict       text                  -- one sentence from eval.md
);

-- Anyone can read
alter table evals enable row level security;

create policy "public read"
  on evals for select
  using (true);

-- Anyone with the anon key can insert (append-only)
create policy "anon insert"
  on evals for insert
  with check (true);

-- Nobody can update or delete
-- (no policies created for update/delete = blocked by default)

-- Useful indexes for leaderboard queries
create index on evals (task_type, provider, model);
create index on evals (user_hash);
create index on evals (created_at desc);
