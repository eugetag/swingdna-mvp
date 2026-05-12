-- Player measurements on golfer_profiles (nullable for backward compatibility).

alter table public.golfer_profiles
  add column if not exists age integer,
  add column if not exists height double precision,
  add column if not exists weight double precision,
  add column if not exists body_type text,
  add column if not exists flexibility_score integer,
  add column if not exists waist_measurement double precision,
  add column if not exists inseam double precision,
  add column if not exists arm_length double precision,
  add column if not exists wrist_to_floor double precision,
  add column if not exists shoulder_width double precision,
  add column if not exists shoe_size text,
  add column if not exists athletic_background text,
  add column if not exists injury_notes text,
  add column if not exists fitting_notes text;

comment on column public.golfer_profiles.height is 'Total height in inches (e.g. 70 for 5''10")';
comment on column public.golfer_profiles.weight is 'Body weight in pounds';
comment on column public.golfer_profiles.waist_measurement is 'Waist in inches (fitting)';
comment on column public.golfer_profiles.inseam is 'Inseam in inches';
comment on column public.golfer_profiles.arm_length is 'Arm length in inches (fitting)';
comment on column public.golfer_profiles.wrist_to_floor is 'Wrist-to-floor in inches';
comment on column public.golfer_profiles.shoulder_width is 'Shoulder width in inches';
comment on column public.golfer_profiles.flexibility_score is 'Self-reported 1–10';

alter table public.golfer_profiles
  drop constraint if exists golfer_profiles_flexibility_score_range;

alter table public.golfer_profiles
  add constraint golfer_profiles_flexibility_score_range
  check (flexibility_score is null or (flexibility_score >= 1 and flexibility_score <= 10));
