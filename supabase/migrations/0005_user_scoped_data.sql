-- Per-user rows: user_id + RLS for authenticated users only.
-- Run after prior migrations. Deletes legacy rows without user_id (MVP anon data).

alter table public.golfer_profiles
  add column if not exists user_id uuid references auth.users (id) on delete cascade;

alter table public.golf_bag_clubs
  add column if not exists user_id uuid references auth.users (id) on delete cascade;

alter table public.launch_sessions
  add column if not exists user_id uuid references auth.users (id) on delete cascade;

alter table public.launch_shots
  add column if not exists user_id uuid references auth.users (id) on delete cascade;

delete from public.launch_shots where user_id is null;
delete from public.launch_sessions where user_id is null;
delete from public.golf_bag_clubs where user_id is null;
delete from public.golfer_profiles where user_id is null;

alter table public.golfer_profiles alter column user_id set not null;
alter table public.golf_bag_clubs alter column user_id set not null;
alter table public.launch_sessions alter column user_id set not null;
alter table public.launch_shots alter column user_id set not null;

create index if not exists golfer_profiles_user_created_idx on public.golfer_profiles (user_id, created_at desc);
create index if not exists golf_bag_clubs_user_created_idx on public.golf_bag_clubs (user_id, created_at desc);
create index if not exists launch_sessions_user_created_idx on public.launch_sessions (user_id, created_at desc);
create index if not exists launch_shots_user_session_idx on public.launch_shots (user_id, session_id);

-- golfer_profiles policies
drop policy if exists "Allow public insert golfer_profiles" on public.golfer_profiles;
drop policy if exists "Allow public select golfer_profiles" on public.golfer_profiles;

create policy "golfer_profiles_select_own"
on public.golfer_profiles for select to authenticated
using (user_id = auth.uid());

create policy "golfer_profiles_insert_own"
on public.golfer_profiles for insert to authenticated
with check (user_id = auth.uid());

create policy "golfer_profiles_update_own"
on public.golfer_profiles for update to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "golfer_profiles_delete_own"
on public.golfer_profiles for delete to authenticated
using (user_id = auth.uid());

-- golf_bag_clubs policies
drop policy if exists "MVP anon insert golf_bag_clubs" on public.golf_bag_clubs;
drop policy if exists "MVP anon select golf_bag_clubs" on public.golf_bag_clubs;

create policy "golf_bag_clubs_select_own"
on public.golf_bag_clubs for select to authenticated
using (user_id = auth.uid());

create policy "golf_bag_clubs_insert_own"
on public.golf_bag_clubs for insert to authenticated
with check (user_id = auth.uid());

create policy "golf_bag_clubs_update_own"
on public.golf_bag_clubs for update to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "golf_bag_clubs_delete_own"
on public.golf_bag_clubs for delete to authenticated
using (user_id = auth.uid());

-- launch_sessions policies
drop policy if exists "Allow insert sessions for now" on public.launch_sessions;
drop policy if exists "Allow read sessions for now" on public.launch_sessions;

create policy "launch_sessions_select_own"
on public.launch_sessions for select to authenticated
using (user_id = auth.uid());

create policy "launch_sessions_insert_own"
on public.launch_sessions for insert to authenticated
with check (user_id = auth.uid());

create policy "launch_sessions_update_own"
on public.launch_sessions for update to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "launch_sessions_delete_own"
on public.launch_sessions for delete to authenticated
using (user_id = auth.uid());

-- launch_shots policies
drop policy if exists "Allow insert shots for now" on public.launch_shots;
drop policy if exists "Allow read shots for now" on public.launch_shots;

create policy "launch_shots_select_own"
on public.launch_shots for select to authenticated
using (user_id = auth.uid());

create policy "launch_shots_insert_own"
on public.launch_shots for insert to authenticated
with check (user_id = auth.uid());

create policy "launch_shots_update_own"
on public.launch_shots for update to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "launch_shots_delete_own"
on public.launch_shots for delete to authenticated
using (user_id = auth.uid());
