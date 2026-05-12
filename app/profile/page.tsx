"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { LoginRequiredNotice } from "@/components/login-required-notice";
import { SiteNav } from "@/components/site-nav";
import { getCurrentUserIdForWrite, useAuthUser } from "@/hooks/use-auth-user";
import {
  BODY_TYPE_LABELS,
  buildGolferProfileWriteFields,
  formatBodyTypeLabel,
  golferProfileRowToFormState,
  initialGolferProfileFormState,
  type BodyTypeId,
  type GolferProfileFormState,
  type GolferProfileInsert,
} from "@/lib/golferProfileInsert";
import type { GolferProfileRow } from "@/lib/reportAnalytics";
import { supabase } from "@/lib/supabaseClient";
import { trimStringish } from "@/lib/trimStringish";

type DominantHand = "right" | "left";

type CommonMiss = "slice" | "hook" | "push" | "pull" | "thin" | "fat";

type PrimaryGoal =
  | "more_distance"
  | "lower_scores"
  | "better_consistency"
  | "fix_slice"
  | "improve_gapping";

const commonMissLabels: Record<CommonMiss, string> = {
  slice: "Slice",
  hook: "Hook",
  push: "Push",
  pull: "Pull",
  thin: "Thin",
  fat: "Fat",
};

const primaryGoalLabels: Record<PrimaryGoal, string> = {
  more_distance: "More distance",
  lower_scores: "Lower scores",
  better_consistency: "Better consistency",
  fix_slice: "Fix slice",
  improve_gapping: "Improve gapping",
};

const shellClass =
  "pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(16,185,129,0.18),transparent_55%),radial-gradient(ellipse_60%_40%_at_100%_0%,rgba(250,204,21,0.08),transparent_50%),radial-gradient(ellipse_50%_35%_at_0%_100%,rgba(56,189,248,0.06),transparent_45%)]";

const fieldClass =
  "w-full rounded-xl border border-white/10 bg-zinc-900/50 px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-emerald-500/45 focus:outline-none focus:ring-1 focus:ring-emerald-500/35";

const luxCardClass =
  "rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-zinc-950/50 p-6 shadow-[0_0_40px_-20px_rgba(16,185,129,0.15)] sm:p-8";

const measurementGroupClass =
  "rounded-xl border border-amber-500/20 bg-gradient-to-br from-amber-500/[0.06] via-zinc-950/30 to-zinc-950/60 p-5";

function getErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "message" in error) {
    const m = (error as { message?: string }).message;
    if (typeof m === "string" && m.trim()) return m;
  }
  if (error instanceof Error && error.message) return error.message;
  return "Something went wrong while saving your profile.";
}

function dash(s: unknown): string {
  return trimStringish(s) || "—";
}

function inchLabel(s: unknown): string {
  const t = trimStringish(s);
  return t ? `${t} in` : "—";
}

export default function ProfilePage() {
  const auth = useAuthUser();
  const [form, setForm] = useState<GolferProfileFormState>(initialGolferProfileFormState);
  const [submitted, setSubmitted] = useState<GolferProfileFormState | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileLoadError, setProfileLoadError] = useState<string | null>(null);
  const [profileLoadedTip, setProfileLoadedTip] = useState(false);

  useEffect(() => {
    if (auth.status !== "signed_in") return;
    const userId = auth.userId;
    let cancelled = false;
    (async () => {
      setProfileLoadError(null);
      setProfileLoading(true);
      const { data, error } = await supabase
        .from("golfer_profiles")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (cancelled) return;
      if (error) {
        setProfileLoadError(error.message);
        setForm(initialGolferProfileFormState);
        setProfileLoadedTip(false);
      } else if (data) {
        setForm(golferProfileRowToFormState(data as GolferProfileRow));
        setProfileLoadedTip(true);
      } else {
        setForm(initialGolferProfileFormState);
        setProfileLoadedTip(false);
      }
      setProfileLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [auth]);

  const summaryRows = useMemo(() => {
    if (!submitted) return [];
    const hand =
      submitted.dominantHand === "right"
        ? "Right"
        : submitted.dominantHand === "left"
          ? "Left"
          : "—";
    const miss =
      submitted.commonMiss in commonMissLabels
        ? commonMissLabels[submitted.commonMiss as CommonMiss]
        : dash(submitted.commonMiss);
    const goal =
      submitted.primaryGoal in primaryGoalLabels
        ? primaryGoalLabels[submitted.primaryGoal as PrimaryGoal]
        : dash(submitted.primaryGoal);
    const dCarry = trimStringish(submitted.driverCarryYards);
    const iCarry = trimStringish(submitted.sevenIronCarryYards);
    const swingSp = trimStringish(submitted.swingSpeedMph);
    const wLbs = trimStringish(submitted.weightLbs);
    const game: { label: string; value: string; wide?: boolean }[] = [
      { label: "Name", value: trimStringish(submitted.name) || "—" },
      { label: "Handicap", value: trimStringish(submitted.handicap) || "—" },
      { label: "Dominant hand", value: hand },
      { label: "Typical score", value: trimStringish(submitted.typicalScore) || "—" },
      {
        label: "Driver carry",
        value: dCarry ? `${dCarry} yds` : "—",
      },
      {
        label: "7-iron carry",
        value: iCarry ? `${iCarry} yds` : "—",
      },
      {
        label: "Swing speed",
        value: swingSp ? `${swingSp} mph` : "—",
      },
      { label: "Common miss", value: miss },
      { label: "Primary goal", value: goal },
      { label: "Practice frequency", value: trimStringish(submitted.practiceFrequency) || "—" },
      { label: "Notes", value: trimStringish(submitted.notes) || "—", wide: true },
    ];
    const meas: { label: string; value: string; wide?: boolean }[] = [
      { label: "Age", value: trimStringish(submitted.age) || "—" },
      { label: "Height", value: inchLabel(submitted.heightInches) },
      { label: "Weight", value: wLbs ? `${wLbs} lbs` : "—" },
      { label: "Body type", value: formatBodyTypeLabel(submitted.bodyType) },
      {
        label: "Flexibility (1–10)",
        value: trimStringish(submitted.flexibilityScore) || "—",
      },
      { label: "Waist", value: inchLabel(submitted.waistInches) },
      { label: "Inseam", value: inchLabel(submitted.inseamInches) },
      { label: "Arm length", value: inchLabel(submitted.armLengthInches) },
      { label: "Wrist-to-floor", value: inchLabel(submitted.wristToFloorInches) },
      { label: "Shoulder width", value: inchLabel(submitted.shoulderWidthInches) },
      { label: "Shoe size", value: trimStringish(submitted.shoeSize) || "—" },
      { label: "Athletic background", value: trimStringish(submitted.athleticBackground) || "—", wide: true },
      { label: "Injury notes", value: trimStringish(submitted.injuryNotes) || "—", wide: true },
      { label: "Fitting notes", value: trimStringish(submitted.fittingNotes) || "—", wide: true },
    ];
    return [...game, ...meas];
  }, [submitted]);

  function update<K extends keyof GolferProfileFormState>(key: K, value: GolferProfileFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaveSuccess(false);
    setSaveError(null);
    setProfileLoadedTip(false);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaveError(null);
    setSaveSuccess(false);

    const userId = await getCurrentUserIdForWrite();
    if (!userId) {
      setSaveError("You need to be logged in to save your profile.");
      return;
    }

    setIsSaving(true);

    try {
      const fields = buildGolferProfileWriteFields(form);

      const { data: existing, error: fetchErr } = await supabase
        .from("golfer_profiles")
        .select("id")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (fetchErr) {
        throw fetchErr;
      }

      if (existing?.id) {
        const { error } = await supabase
          .from("golfer_profiles")
          .update({
            ...fields,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id)
          .eq("user_id", userId);
        if (error) throw error;
      } else {
        const row: GolferProfileInsert = { ...fields, user_id: userId };
        const { error } = await supabase.from("golfer_profiles").insert(row);
        if (error) throw error;
      }

      const { data: refreshed, error: refErr } = await supabase
        .from("golfer_profiles")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!refErr && refreshed) {
        const nextForm = golferProfileRowToFormState(refreshed as GolferProfileRow);
        setForm(nextForm);
        setSubmitted(nextForm);
      } else {
        setSubmitted({ ...form });
      }
      setSaveSuccess(true);
    } catch (err) {
      setSaveError(getErrorMessage(err));
      setSaveSuccess(false);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-zinc-950 text-zinc-100">
      <div aria-hidden className={shellClass} />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(to_bottom,rgba(9,9,11,0.3),rgba(9,9,11,0.95))]"
      />

      <header className="border-b border-white/5 bg-zinc-950/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400/90 to-emerald-700/80 text-sm font-semibold tracking-tight text-zinc-950 shadow-[0_0_24px_rgba(52,211,153,0.35)]">
              S
            </span>
            <span className="font-semibold tracking-tight text-white">
              Swing<span className="text-emerald-400/90">DNA</span>
            </span>
          </Link>
          <SiteNav />
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 pb-24 pt-10 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400/90">
            Player DNA
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Serious golfer profile
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-zinc-400">
            Game benchmarks, body map, and fitting context — saved together for SwingDNA reports and coach-grade
            reads.
          </p>
        </div>

        {auth.status === "loading" ? (
          <div className="mt-10 h-40 animate-pulse rounded-2xl border border-white/10 bg-white/[0.04]" aria-busy />
        ) : auth.status === "signed_out" ? (
          <div className="mt-10 space-y-3">
            <LoginRequiredNotice />
            <p className="text-center text-xs text-zinc-500">
              Your saved profile loads into the form automatically after you sign in.
            </p>
          </div>
        ) : null}

        {auth.status === "signed_in" ? (
          <>
            {profileLoadError ? (
              <div
                className="mt-8 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100"
                role="status"
              >
                Could not load your saved profile: {profileLoadError}
              </div>
            ) : null}

            {profileLoadedTip && !profileLoading && !profileLoadError ? (
              <div
                className="mt-8 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100"
                role="status"
              >
                Loaded your latest saved profile into the form below.
              </div>
            ) : null}

            {profileLoading ? (
              <div
                className="mt-8 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-zinc-400"
                aria-busy
              >
                <span
                  className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-emerald-400/30 border-t-emerald-200"
                  aria-hidden
                />
                Loading your saved profile…
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="mt-10 space-y-10" noValidate>
              <div className={luxCardClass}>
                <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-5">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-emerald-400/90">
                      On-course DNA
                    </p>
                    <h2 className="mt-1 text-xl font-semibold tracking-tight text-white">Game profile</h2>
                    <p className="mt-1 text-xs text-zinc-500">Benchmarks and intent — what you fight and what you chase.</p>
                  </div>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label htmlFor="name" className="mb-1.5 block text-xs font-medium text-zinc-400">
                      Name
                    </label>
                    <input
                      id="name"
                      className={fieldClass}
                      value={form.name}
                      onChange={(e) => update("name", e.target.value)}
                      placeholder="Jordan Smith"
                      autoComplete="name"
                    />
                  </div>
                  <div>
                    <label htmlFor="handicap" className="mb-1.5 block text-xs font-medium text-zinc-400">
                      Handicap
                    </label>
                    <input
                      id="handicap"
                      className={fieldClass}
                      value={form.handicap}
                      onChange={(e) => update("handicap", e.target.value)}
                      placeholder="e.g., 8.4 or +1.2"
                      inputMode="decimal"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="dominant-hand"
                      className="mb-1.5 block text-xs font-medium text-zinc-400"
                    >
                      Dominant hand
                    </label>
                    <select
                      id="dominant-hand"
                      className={`${fieldClass} appearance-none bg-zinc-900/70`}
                      value={form.dominantHand}
                      onChange={(e) =>
                        update("dominantHand", e.target.value as GolferProfileFormState["dominantHand"])
                      }
                    >
                      <option value="">Select …</option>
                      <option value="right">Right</option>
                      <option value="left">Left</option>
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="typical-score"
                      className="mb-1.5 block text-xs font-medium text-zinc-400"
                    >
                      Typical score
                    </label>
                    <input
                      id="typical-score"
                      className={fieldClass}
                      value={form.typicalScore}
                      onChange={(e) => update("typicalScore", e.target.value)}
                      placeholder="e.g., 82"
                      inputMode="numeric"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="driver-carry"
                      className="mb-1.5 block text-xs font-medium text-zinc-400"
                    >
                      Driver carry distance
                    </label>
                    <input
                      id="driver-carry"
                      className={fieldClass}
                      value={form.driverCarryYards}
                      onChange={(e) => update("driverCarryYards", e.target.value)}
                      placeholder="Yards"
                      inputMode="numeric"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="seven-iron"
                      className="mb-1.5 block text-xs font-medium text-zinc-400"
                    >
                      7-iron carry distance
                    </label>
                    <input
                      id="seven-iron"
                      className={fieldClass}
                      value={form.sevenIronCarryYards}
                      onChange={(e) => update("sevenIronCarryYards", e.target.value)}
                      placeholder="Yards"
                      inputMode="numeric"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="swing-speed"
                      className="mb-1.5 block text-xs font-medium text-zinc-400"
                    >
                      Swing speed
                    </label>
                    <input
                      id="swing-speed"
                      className={fieldClass}
                      value={form.swingSpeedMph}
                      onChange={(e) => update("swingSpeedMph", e.target.value)}
                      placeholder="mph"
                      inputMode="decimal"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="common-miss"
                      className="mb-1.5 block text-xs font-medium text-zinc-400"
                    >
                      Common miss
                    </label>
                    <select
                      id="common-miss"
                      className={`${fieldClass} appearance-none bg-zinc-900/70`}
                      value={form.commonMiss}
                      onChange={(e) => update("commonMiss", e.target.value)}
                    >
                      <option value="">Select …</option>
                      {(Object.keys(commonMissLabels) as CommonMiss[]).map((k) => (
                        <option key={k} value={k}>
                          {commonMissLabels[k]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="primary-goal"
                      className="mb-1.5 block text-xs font-medium text-zinc-400"
                    >
                      Primary goal
                    </label>
                    <select
                      id="primary-goal"
                      className={`${fieldClass} appearance-none bg-zinc-900/70`}
                      value={form.primaryGoal}
                      onChange={(e) => update("primaryGoal", e.target.value)}
                    >
                      <option value="">Select …</option>
                      {(Object.keys(primaryGoalLabels) as PrimaryGoal[]).map((k) => (
                        <option key={k} value={k}>
                          {primaryGoalLabels[k]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="practice-frequency"
                      className="mb-1.5 block text-xs font-medium text-zinc-400"
                    >
                      Practice frequency
                    </label>
                    <input
                      id="practice-frequency"
                      className={fieldClass}
                      value={form.practiceFrequency}
                      onChange={(e) => update("practiceFrequency", e.target.value)}
                      placeholder="e.g., 3 range sessions per week"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="notes" className="mb-1.5 block text-xs font-medium text-zinc-400">
                      Notes
                    </label>
                    <textarea
                      id="notes"
                      rows={4}
                      className={`${fieldClass} resize-y`}
                      value={form.notes}
                      onChange={(e) => update("notes", e.target.value)}
                      placeholder="Injuries, coach focus, tournament schedule, swing thoughts…"
                    />
                  </div>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-2xl border border-amber-500/25 bg-gradient-to-b from-amber-500/[0.08] via-zinc-950/80 to-zinc-950 p-6 shadow-[0_0_48px_-24px_rgba(251,191,36,0.25)] sm:p-8">
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-amber-400/10 blur-3xl"
                />
                <div className="relative">
                  <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-amber-500/20 pb-5">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-amber-200/90">
                        Fitting lab
                      </p>
                      <h2 className="mt-1 text-xl font-semibold tracking-tight text-white sm:text-2xl">
                        Player measurements
                      </h2>
                      <p className="mt-1 max-w-xl text-xs leading-relaxed text-amber-100/70">
                        Precise lengths and context sharpen lie, length, and load recommendations — all stored with
                        your profile.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className={measurementGroupClass}>
                      <h3 className="text-sm font-semibold text-white">Physical frame</h3>
                      <p className="mt-1 text-[11px] text-zinc-500">Height in total inches (e.g. 70 for 5&apos;10&quot;).</p>
                      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div>
                          <label htmlFor="age" className="mb-1.5 block text-xs font-medium text-zinc-400">
                            Age
                          </label>
                          <input
                            id="age"
                            className={fieldClass}
                            value={form.age}
                            onChange={(e) => update("age", e.target.value)}
                            placeholder="Years"
                            inputMode="numeric"
                          />
                        </div>
                        <div>
                          <label htmlFor="height" className="mb-1.5 block text-xs font-medium text-zinc-400">
                            Height
                          </label>
                          <input
                            id="height"
                            className={fieldClass}
                            value={form.heightInches}
                            onChange={(e) => update("heightInches", e.target.value)}
                            placeholder="Total in."
                            inputMode="decimal"
                          />
                        </div>
                        <div>
                          <label htmlFor="weight" className="mb-1.5 block text-xs font-medium text-zinc-400">
                            Weight
                          </label>
                          <input
                            id="weight"
                            className={fieldClass}
                            value={form.weightLbs}
                            onChange={(e) => update("weightLbs", e.target.value)}
                            placeholder="lbs"
                            inputMode="decimal"
                          />
                        </div>
                        <div>
                          <label htmlFor="body-type" className="mb-1.5 block text-xs font-medium text-zinc-400">
                            Body type
                          </label>
                          <select
                            id="body-type"
                            className={`${fieldClass} appearance-none bg-zinc-900/70`}
                            value={form.bodyType}
                            onChange={(e) => update("bodyType", e.target.value as BodyTypeId)}
                          >
                            <option value="">Select …</option>
                            {(Object.keys(BODY_TYPE_LABELS) as (keyof typeof BODY_TYPE_LABELS)[]).map((k) => (
                              <option key={k} value={k}>
                                {BODY_TYPE_LABELS[k]}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className={measurementGroupClass}>
                      <h3 className="text-sm font-semibold text-white">Mobility</h3>
                      <div className="mt-4 max-w-xs">
                        <label
                          htmlFor="flex-score"
                          className="mb-1.5 block text-xs font-medium text-zinc-400"
                        >
                          Flexibility score (1–10)
                        </label>
                        <input
                          id="flex-score"
                          className={fieldClass}
                          value={form.flexibilityScore}
                          onChange={(e) => update("flexibilityScore", e.target.value)}
                          placeholder="Self-assessment"
                          inputMode="numeric"
                        />
                      </div>
                    </div>

                    <div className={measurementGroupClass}>
                      <h3 className="text-sm font-semibold text-white">Fitting dimensions</h3>
                      <p className="mt-1 text-[11px] text-zinc-500">All tape measurements in inches unless noted.</p>
                      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {(
                          [
                            ["waistInches", "waist", "Waist"],
                            ["inseamInches", "inseam", "Inseam"],
                            ["armLengthInches", "arm-length", "Arm length"],
                            ["wristToFloorInches", "wrist-floor", "Wrist-to-floor"],
                            ["shoulderWidthInches", "shoulder", "Shoulder width"],
                          ] as const
                        ).map(([key, id, label]) => (
                          <div key={key}>
                            <label htmlFor={id} className="mb-1.5 block text-xs font-medium text-zinc-400">
                              {label}
                            </label>
                            <input
                              id={id}
                              className={fieldClass}
                              value={form[key]}
                              onChange={(e) => update(key, e.target.value)}
                              placeholder="in."
                              inputMode="decimal"
                            />
                          </div>
                        ))}
                        <div>
                          <label htmlFor="shoe-size" className="mb-1.5 block text-xs font-medium text-zinc-400">
                            Shoe size (US)
                          </label>
                          <input
                            id="shoe-size"
                            className={fieldClass}
                            value={form.shoeSize}
                            onChange={(e) => update("shoeSize", e.target.value)}
                            placeholder="e.g. 10.5"
                          />
                        </div>
                      </div>
                    </div>

                    <div className={measurementGroupClass}>
                      <h3 className="text-sm font-semibold text-white">Context & notes</h3>
                      <div className="mt-4 grid gap-4">
                        <div>
                          <label
                            htmlFor="athletic-bg"
                            className="mb-1.5 block text-xs font-medium text-zinc-400"
                          >
                            Athletic background
                          </label>
                          <textarea
                            id="athletic-bg"
                            rows={3}
                            className={`${fieldClass} resize-y`}
                            value={form.athleticBackground}
                            onChange={(e) => update("athleticBackground", e.target.value)}
                            placeholder="Other sports, training history, speed work…"
                          />
                        </div>
                        <div>
                          <label htmlFor="injury-notes" className="mb-1.5 block text-xs font-medium text-zinc-400">
                            Injury notes
                          </label>
                          <textarea
                            id="injury-notes"
                            rows={3}
                            className={`${fieldClass} resize-y`}
                            value={form.injuryNotes}
                            onChange={(e) => update("injuryNotes", e.target.value)}
                            placeholder="Current or relevant past limitations for load / equipment."
                          />
                        </div>
                        <div>
                          <label htmlFor="fitting-notes" className="mb-1.5 block text-xs font-medium text-zinc-400">
                            Fitting notes
                          </label>
                          <textarea
                            id="fitting-notes"
                            rows={3}
                            className={`${fieldClass} resize-y`}
                            value={form.fittingNotes}
                            onChange={(e) => update("fittingNotes", e.target.value)}
                            placeholder="Lie, length, grip, prior builds, brand preferences…"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {saveError ? (
                <div
                  className="rounded-xl border border-red-500/35 bg-red-500/10 px-4 py-3 text-sm text-red-100"
                  role="alert"
                >
                  {saveError}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={isSaving || profileLoading}
                className="w-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 py-3 text-sm font-semibold text-zinc-950 shadow-[0_0_36px_rgba(16,185,129,0.28)] transition enabled:hover:from-emerald-400 enabled:hover:to-emerald-500 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-[240px] sm:px-10"
              >
                {isSaving ? "Saving…" : "Save profile & measurements"}
              </button>
            </form>

            {saveSuccess ? (
              <div
                className="mt-6 rounded-xl border border-emerald-500/35 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100"
                role="status"
                aria-live="polite"
              >
                Profile and measurements saved to SwingDNA. Your data is stored securely.
              </div>
            ) : null}

            {submitted ? (
              <section
                className="mt-10 rounded-2xl border border-emerald-500/30 bg-gradient-to-b from-emerald-500/10 to-zinc-950/70 p-6 sm:p-8"
                aria-live="polite"
              >
                <div className="mb-1 h-px w-12 bg-gradient-to-r from-emerald-400/90 to-transparent" />
                <h2 className="mt-4 text-lg font-semibold text-white">Profile summary</h2>
                <p className="mt-1 text-sm text-zinc-400">
                  Snapshot from your latest save — synced to your golfer profile in Supabase.
                </p>
                <dl className="mt-6 grid gap-x-10 gap-y-4 sm:grid-cols-2">
                  {summaryRows.map(({ label, value, wide }) => (
                    <div key={label} className={wide ? "sm:col-span-2" : undefined}>
                      <dt className="text-xs font-medium uppercase tracking-wider text-zinc-500">{label}</dt>
                      <dd
                        className={`mt-1 text-sm text-zinc-100 ${wide ? "whitespace-pre-wrap" : ""}`}
                      >
                        {value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
            ) : null}
          </>
        ) : null}
      </main>
    </div>
  );
}
