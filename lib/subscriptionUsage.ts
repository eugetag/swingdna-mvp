import type { SupabaseClient } from "@supabase/supabase-js";
import type { GolferProfileRow } from "@/lib/reportAnalytics";
import {
  monthlyLimitsForTier,
  normalizeSubscriptionTier,
  type SubscriptionTier,
} from "@/lib/subscriptionTier";

/** UTC calendar month key `YYYY-MM` (matches `golfer_profiles.ai_usage_month_key`). */
export function currentAiUsageMonthKeyUtc(): string {
  const d = new Date();
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth() + 1;
  return `${y}-${m < 10 ? `0${m}` : m}`;
}

export type UsageSnapshot = {
  tier: SubscriptionTier;
  monthKey: string;
  advancedUsed: number;
  swingUsed: number;
  advancedLimit: number | null;
  swingLimit: number | null;
  advancedRemaining: number | null;
  swingRemaining: number | null;
  canRunAdvancedAi: boolean;
  canRunSwingAnalysis: boolean;
};

function effectiveCounts(row: GolferProfileRow, currentMonth: string): { advanced: number; swing: number } {
  const storedMonth = row.ai_usage_month_key?.trim() || currentMonth;
  if (storedMonth !== currentMonth) {
    return { advanced: 0, swing: 0 };
  }
  return {
    advanced: Math.max(0, row.advanced_ai_analysis_count ?? 0),
    swing: Math.max(0, row.swing_analysis_count ?? 0),
  };
}

export function getUsageSnapshotFromProfile(row: GolferProfileRow): UsageSnapshot {
  const tier = normalizeSubscriptionTier(row.subscription_tier);
  const { advancedAiAnalysis: advLimit, swingAnalysis: swingLimit } = monthlyLimitsForTier(tier);
  const monthKey = currentAiUsageMonthKeyUtc();
  const { advanced, swing } = effectiveCounts(row, monthKey);

  const advancedRemaining =
    advLimit == null ? null : Math.max(0, advLimit - advanced);
  const swingRemaining =
    swingLimit == null ? null : Math.max(0, swingLimit - swing);

  return {
    tier,
    monthKey,
    advancedUsed: advanced,
    swingUsed: swing,
    advancedLimit: advLimit,
    swingLimit,
    advancedRemaining,
    swingRemaining,
    canRunAdvancedAi: advLimit == null || advanced < advLimit,
    canRunSwingAnalysis: swingLimit == null || swing < swingLimit,
  };
}

type ProfileUsageRow = Pick<
  GolferProfileRow,
  | "id"
  | "subscription_tier"
  | "advanced_ai_analysis_count"
  | "swing_analysis_count"
  | "ai_usage_month_key"
>;

async function fetchLatestProfileUsageRow(
  client: SupabaseClient,
  userId: string,
): Promise<{ data: ProfileUsageRow | null; error: string | null }> {
  const { data, error } = await client
    .from("golfer_profiles")
    .select("id, subscription_tier, advanced_ai_analysis_count, swing_analysis_count, ai_usage_month_key")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) return { data: null, error: error.message };
  return { data: data as ProfileUsageRow | null, error: null };
}

function nextCountsAfterIncrement(
  row: ProfileUsageRow,
  which: "advanced" | "swing",
): {
  id: string;
  advanced_ai_analysis_count: number;
  swing_analysis_count: number;
  ai_usage_month_key: string;
} {
  const month = currentAiUsageMonthKeyUtc();
  let advanced = Math.max(0, row.advanced_ai_analysis_count ?? 0);
  let swing = Math.max(0, row.swing_analysis_count ?? 0);
  let mk = row.ai_usage_month_key?.trim() || month;

  if (mk !== month) {
    advanced = 0;
    swing = 0;
    mk = month;
  }

  if (which === "advanced") advanced += 1;
  else swing += 1;

  return {
    id: row.id,
    advanced_ai_analysis_count: advanced,
    swing_analysis_count: swing,
    ai_usage_month_key: mk,
  };
}

export async function incrementAdvancedAiAnalysis(
  client: SupabaseClient,
  userId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { data: row, error: selErr } = await fetchLatestProfileUsageRow(client, userId);
  if (selErr) return { ok: false, error: selErr };
  if (!row?.id) return { ok: false, error: "No golfer profile found to record usage." };

  const next = nextCountsAfterIncrement(row, "advanced");
  const { error } = await client
    .from("golfer_profiles")
    .update({
      advanced_ai_analysis_count: next.advanced_ai_analysis_count,
      swing_analysis_count: next.swing_analysis_count,
      ai_usage_month_key: next.ai_usage_month_key,
      updated_at: new Date().toISOString(),
    })
    .eq("id", row.id)
    .eq("user_id", userId);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function incrementSwingAnalysis(
  client: SupabaseClient,
  userId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { data: row, error: selErr } = await fetchLatestProfileUsageRow(client, userId);
  if (selErr) return { ok: false, error: selErr };
  if (!row?.id) return { ok: false, error: "No golfer profile found to record usage." };

  const next = nextCountsAfterIncrement(row, "swing");
  const { error } = await client
    .from("golfer_profiles")
    .update({
      advanced_ai_analysis_count: next.advanced_ai_analysis_count,
      swing_analysis_count: next.swing_analysis_count,
      ai_usage_month_key: next.ai_usage_month_key,
      updated_at: new Date().toISOString(),
    })
    .eq("id", row.id)
    .eq("user_id", userId);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
