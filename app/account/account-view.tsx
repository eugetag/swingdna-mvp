"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { AuthPageShell } from "@/components/auth-page-shell";
import type { GolferProfileRow } from "@/lib/reportAnalytics";
import { getUsageSnapshotFromProfile } from "@/lib/subscriptionUsage";
import { supabase } from "@/lib/supabaseClient";

export function AccountView({ email }: { email: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usage, setUsage] = useState<ReturnType<typeof getUsageSnapshotFromProfile> | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || cancelled) return;
      const { data, error: qErr } = await supabase
        .from("golfer_profiles")
        .select("subscription_tier, advanced_ai_analysis_count, swing_analysis_count, ai_usage_month_key")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (cancelled) return;
      if (qErr || !data) {
        setUsage(null);
        return;
      }
      setUsage(getUsageSnapshotFromProfile(data as GolferProfileRow));
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSignOut() {
    setError(null);
    setLoading(true);
    try {
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) {
        setError(signOutError.message);
        return;
      }
      router.refresh();
      router.push("/");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthPageShell title="Your account" subtitle="Signed in with Supabase Auth.">
      <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-zinc-950/40 p-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Email</p>
        <p className="mt-2 break-all font-mono text-sm text-white">{email || "—"}</p>
      </div>

      {usage ? (
        <div className="mt-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.06] p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-300/90">Plan & usage</p>
          <p className="mt-2 text-sm capitalize text-white">{usage.tier}</p>
          <dl className="mt-4 space-y-2 text-sm text-zinc-400">
            <div className="flex justify-between gap-4">
              <dt>Advanced AI (this month)</dt>
              <dd className="shrink-0 tabular-nums text-zinc-200">
                {usage.advancedLimit == null ? "Unlimited" : `${usage.advancedUsed} / ${usage.advancedLimit}`}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Swing analyses (this month)</dt>
              <dd className="shrink-0 tabular-nums text-zinc-200">
                {usage.swingLimit == null ? "Unlimited" : `${usage.swingUsed} / ${usage.swingLimit}`}
              </dd>
            </div>
            <div className="flex justify-between gap-4 text-xs text-zinc-500">
              <dt>Usage month (UTC)</dt>
              <dd className="shrink-0 font-mono">{usage.monthKey}</dd>
            </div>
          </dl>
          <Link
            href="/#pricing"
            className="mt-4 inline-block text-xs font-medium text-emerald-300/90 underline-offset-4 hover:underline"
          >
            View membership tiers
          </Link>
        </div>
      ) : (
        <p className="mt-5 text-xs text-zinc-500">
          Save a golfer profile to attach a subscription tier and track AI usage.
        </p>
      )}
      {error ? (
        <div className="mt-5 rounded-xl border border-red-500/35 bg-red-500/10 px-4 py-3 text-sm text-red-100" role="alert">
          {error}
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => void handleSignOut()}
        disabled={loading}
        className="mt-8 w-full rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-100 disabled:opacity-50"
      >
        {loading ? "Signing out…" : "Log out"}
      </button>
    </AuthPageShell>
  );
}
