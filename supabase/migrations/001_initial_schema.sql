-- CanvaEP — Initial Schema
-- Run this in your Supabase SQL editor

-- ── Enable UUID extension ─────────────────────────────────
create extension if not exists "uuid-ossp";

-- ── team_members ──────────────────────────────────────────
create table if not exists team_members (
  id            uuid primary key default uuid_generate_v4(),
  name          text not null,
  role          text not null,
  location      text,
  type          text not null check (type in ('internal', 'external')),
  skills        jsonb default '[]',
  availability_status text default 'available' check (
    availability_status in ('available', 'busy', 'tentative', 'unavailable')
  ),
  day_rate      integer,          -- externals only, in AUD
  company       text,             -- externals only
  notes         text,
  avatar_url    text,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ── briefs ────────────────────────────────────────────────
create table if not exists briefs (
  id              uuid primary key default uuid_generate_v4(),
  title           text not null,
  requester_name  text,
  requester_role  text,
  approver        text,
  priority        text default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  raw_text        text,
  status          text default 'draft' check (
    status in ('draft', 'needs-interrogation', 'in-progress', 'complete')
  ),
  extracted_info  jsonb default '{}',
  gaps            jsonb default '[]',
  monday_item_id  text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ── project_assignments ───────────────────────────────────
create table if not exists project_assignments (
  id              uuid primary key default uuid_generate_v4(),
  project_id      uuid references briefs(id) on delete cascade,
  team_member_id  uuid references team_members(id) on delete cascade,
  role_on_project text,
  start_date      date,
  end_date        date,
  hours_logged    numeric default 0,
  status          text default 'confirmed' check (
    status in ('proposed', 'confirmed', 'completed', 'cancelled')
  ),
  created_at      timestamptz default now()
);

-- ── external_history ─────────────────────────────────────
create table if not exists external_history (
  id              uuid primary key default uuid_generate_v4(),
  team_member_id  uuid references team_members(id) on delete cascade,
  project_name    text not null,
  shoot_date      date,
  producer_notes  text,
  rating          integer check (rating between 1 and 5),
  created_at      timestamptz default now()
);

-- ── call_sheets ───────────────────────────────────────────
create table if not exists call_sheets (
  id              uuid primary key default uuid_generate_v4(),
  project_id      uuid references briefs(id) on delete set null,
  shoot_date      date not null,
  call_time       time not null,
  wrap_time       time,
  locations       jsonb default '[]',
  -- [{name, address, parking, loadIn, notes}]
  crew            jsonb default '[]',
  -- [{name, role, callTime, phone, type}]
  schedule        jsonb default '[]',
  -- [{time, activity, duration}]
  catering        text,
  emergency_info  jsonb default '{}',
  weather_forecast jsonb default '{}',
  notes           jsonb default '[]',
  status          text default 'draft' check (status in ('draft', 'final', 'sent')),
  canva_doc_id    text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ── Updated-at triggers ───────────────────────────────────
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists team_members_updated_at on team_members;
create trigger team_members_updated_at
  before update on team_members
  for each row execute function update_updated_at();

drop trigger if exists briefs_updated_at on briefs;
create trigger briefs_updated_at
  before update on briefs
  for each row execute function update_updated_at();

drop trigger if exists call_sheets_updated_at on call_sheets;
create trigger call_sheets_updated_at
  before update on call_sheets
  for each row execute function update_updated_at();

-- ── Row-level security (enable, but open for now) ─────────
alter table team_members     enable row level security;
alter table briefs           enable row level security;
alter table project_assignments enable row level security;
alter table external_history enable row level security;
alter table call_sheets      enable row level security;

-- Permissive policies — tighten with auth later
do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'team_members' and policyname = 'Allow all') then
    create policy "Allow all" on team_members for all using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'briefs' and policyname = 'Allow all') then
    create policy "Allow all" on briefs for all using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'project_assignments' and policyname = 'Allow all') then
    create policy "Allow all" on project_assignments for all using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'external_history' and policyname = 'Allow all') then
    create policy "Allow all" on external_history for all using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'call_sheets' and policyname = 'Allow all') then
    create policy "Allow all" on call_sheets for all using (true) with check (true);
  end if;
end $$;
