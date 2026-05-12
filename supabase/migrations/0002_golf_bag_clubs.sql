-- golf_bag_clubs: one row per club in the player's bag (MVP — tighten RLS before production).

create table if not exists public.golf_bag_clubs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  club_type text,
  brand text,
  model text,
  loft text,
  shaft text,
  flex text,
  carry_distance numeric,
  total_distance numeric,
  shot_shape_tendency text,
  confidence_rating numeric
);

comment on table public.golf_bag_clubs is 'Golf bag clubs saved from SwingDNA /bag (MVP anon policies).';

alter table public.golf_bag_clubs enable row level security;

-- Temporary MVP: allow anon + authenticated read/write for prototyping.
drop policy if exists "MVP anon insert golf_bag_clubs" on public.golf_bag_clubs;
create policy "MVP anon insert golf_bag_clubs"
on public.golf_bag_clubs
for insert
to anon, authenticated
with check (true);

drop policy if exists "MVP anon select golf_bag_clubs" on public.golf_bag_clubs;
create policy "MVP anon select golf_bag_clubs"
on public.golf_bag_clubs
for select
to anon, authenticated
using (true);
