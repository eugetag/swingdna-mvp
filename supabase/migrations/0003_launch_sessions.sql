-- launch_sessions: LM practice blocks (MVP anon policies).

create table if not exists public.launch_sessions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now(),
  session_title text,
  session_date date,
  environment text,
  launch_monitor text,
  notes text
);

alter table public.launch_sessions enable row level security;

drop policy if exists "Allow insert sessions for now" on public.launch_sessions;
create policy "Allow insert sessions for now"
on public.launch_sessions
for insert
to anon
with check (true);

drop policy if exists "Allow read sessions for now" on public.launch_sessions;
create policy "Allow read sessions for now"
on public.launch_sessions
for select
to anon
using (true);
