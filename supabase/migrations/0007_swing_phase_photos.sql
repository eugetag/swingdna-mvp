-- swing_phase_photos + Storage bucket swing-photos (public read for coach AI URLs).

-- ---------------------------------------------------------------------------
-- Table
-- ---------------------------------------------------------------------------
create table if not exists public.swing_phase_photos (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid not null references auth.users (id) on delete cascade,
  phase_name text not null,
  image_url text not null,
  notes text,
  constraint swing_phase_photos_phase_name_check check (
    phase_name in (
      'setup',
      'takeaway',
      'backswing',
      'transition',
      'downswing',
      'impact',
      'follow_through'
    )
  ),
  constraint swing_phase_photos_user_phase_unique unique (user_id, phase_name)
);

create index if not exists swing_phase_photos_user_id_idx on public.swing_phase_photos (user_id);

alter table public.swing_phase_photos enable row level security;

drop policy if exists "swing_phase_photos_select_own" on public.swing_phase_photos;
drop policy if exists "swing_phase_photos_insert_own" on public.swing_phase_photos;
drop policy if exists "swing_phase_photos_update_own" on public.swing_phase_photos;
drop policy if exists "swing_phase_photos_delete_own" on public.swing_phase_photos;

create policy "swing_phase_photos_select_own"
on public.swing_phase_photos for select to authenticated
using (user_id = auth.uid());

create policy "swing_phase_photos_insert_own"
on public.swing_phase_photos for insert to authenticated
with check (user_id = auth.uid());

create policy "swing_phase_photos_update_own"
on public.swing_phase_photos for update to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "swing_phase_photos_delete_own"
on public.swing_phase_photos for delete to authenticated
using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Storage bucket (public read so image URLs work for OpenAI vision + report)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'swing-photos',
  'swing-photos',
  true,
  8388608,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "swing_photos_select_own" on storage.objects;
drop policy if exists "swing_photos_public_read" on storage.objects;
drop policy if exists "swing_photos_insert_own" on storage.objects;
drop policy if exists "swing_photos_update_own" on storage.objects;
drop policy if exists "swing_photos_delete_own" on storage.objects;

-- Public read so coach AI and img tags can load by URL (paths include user UUID).
create policy "swing_photos_public_read"
on storage.objects for select
using (bucket_id = 'swing-photos');

create policy "swing_photos_insert_own"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'swing-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "swing_photos_update_own"
on storage.objects for update to authenticated
using (bucket_id = 'swing-photos' and (storage.foldername(name))[1] = auth.uid()::text)
with check (bucket_id = 'swing-photos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "swing_photos_delete_own"
on storage.objects for delete to authenticated
using (bucket_id = 'swing-photos' and (storage.foldername(name))[1] = auth.uid()::text);
