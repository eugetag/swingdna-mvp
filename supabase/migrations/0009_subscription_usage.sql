-- Subscription tier + monthly AI usage (calendar month, UTC).
-- Limits enforced in app; Stripe not integrated yet.

alter table public.golfer_profiles
  add column if not exists subscription_tier text not null default 'player'
    check (subscription_tier in ('founding', 'player', 'elite'));

alter table public.golfer_profiles
  add column if not exists advanced_ai_analysis_count integer not null default 0
    check (advanced_ai_analysis_count >= 0);

alter table public.golfer_profiles
  add column if not exists swing_analysis_count integer not null default 0
    check (swing_analysis_count >= 0);

alter table public.golfer_profiles
  add column if not exists ai_usage_month_key text not null default (to_char(timezone('utc', now()), 'YYYY-MM'));

comment on column public.golfer_profiles.subscription_tier is 'founding | player | elite — billing via Stripe later';
comment on column public.golfer_profiles.advanced_ai_analysis_count is 'Advanced AI coach runs used this UTC month';
comment on column public.golfer_profiles.swing_analysis_count is 'Swing photo/video analyses used this UTC month';
comment on column public.golfer_profiles.ai_usage_month_key is 'YYYY-MM (UTC) for which month the two counts apply';
