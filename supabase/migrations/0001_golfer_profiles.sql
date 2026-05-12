-- Apply in Supabase Dashboard → SQL → New query, or via Supabase CLI.
-- Tighten RLS policies before production (tie rows to auth.uid(), etc.).

create table if not exists public.golfer_profiles (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  name text,
  handicap text,
  dominant_hand text check (dominant_hand is null or dominant_hand in ('right', 'left')),
  typical_score text,
  driver_carry integer,
  seven_iron_carry integer,
  swing_speed double precision,
  common_miss text,
  primary_goal text,
  practice_frequency text,
  notes text
);

alter table public.golfer_profiles enable row level security;

drop policy if exists "Allow public insert golfer_profiles" on public.golfer_profiles;
create policy "Allow public insert golfer_profiles"
on public.golfer_profiles
for insert
to anon, authenticated
with check (true);

drop policy if exists "Allow public select golfer_profiles" on public.golfer_profiles;
create policy "Allow public select golfer_profiles"
on public.golfer_profiles
for select
to anon, authenticated
using (true);
