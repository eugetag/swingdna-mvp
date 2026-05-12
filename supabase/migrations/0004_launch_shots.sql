-- launch_shots: per-shot LM data tied to launch_sessions (MVP anon policies).

create table if not exists public.launch_shots (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now(),
  session_id uuid references public.launch_sessions (id) on delete cascade,
  club_used text,
  ball_speed numeric,
  club_speed numeric,
  smash_factor numeric,
  carry_distance numeric,
  total_distance numeric,
  spin_rate numeric,
  launch_angle numeric,
  apex numeric,
  attack_angle numeric,
  club_path numeric,
  face_angle numeric,
  shot_shape text,
  strike_quality text,
  miss_direction text,
  notes text
);

alter table public.launch_shots enable row level security;

drop policy if exists "Allow insert shots for now" on public.launch_shots;
create policy "Allow insert shots for now"
on public.launch_shots
for insert
to anon
with check (true);

drop policy if exists "Allow read shots for now" on public.launch_shots;
create policy "Allow read shots for now"
on public.launch_shots
for select
to anon
using (true);
