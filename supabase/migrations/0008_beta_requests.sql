-- Founding Golfer Beta waitlist (public insert only; no public reads).

create table if not exists public.beta_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  handicap text not null,
  launch_monitor text not null,
  golf_goal text not null
);

create index if not exists beta_requests_created_at_idx on public.beta_requests (created_at desc);

alter table public.beta_requests enable row level security;

drop policy if exists "beta_requests_insert_public" on public.beta_requests;
create policy "beta_requests_insert_public"
on public.beta_requests
for insert
to anon, authenticated
with check (true);
