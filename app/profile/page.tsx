"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { LoginRequiredNotice } from "@/components/login-required-notice";
import { SiteNav } from "@/components/site-nav";
import { getCurrentUserIdForWrite, useAuthUser } from "@/hooks/use-auth-user";
import { buildGolferProfileInsert, type GolferProfileInsert } from "@/lib/golferProfileInsert";
import { supabase } from "@/lib/supabaseClient";

type DominantHand = "right" | "left";

type CommonMiss = "slice" | "hook" | "push" | "pull" | "thin" | "fat";

type PrimaryGoal =
  | "more_distance"
  | "lower_scores"
  | "better_consistency"
  | "fix_slice"
  | "improve_gapping";

type GolferProfile = {
  name: string;
  handicap: string;
  dominantHand: DominantHand | "";
  typicalScore: string;
  driverCarryYards: string;
  sevenIronCarryYards: string;
  swingSpeedMph: string;
  commonMiss: CommonMiss | "";
  primaryGoal: PrimaryGoal | "";
  practiceFrequency: string;
  notes: string;
};

const initialForm: GolferProfile = {
  name: "",
  handicap: "",
  dominantHand: "",
  typicalScore: "",
  driverCarryYards: "",
  sevenIronCarryYards: "",
  swingSpeedMph: "",
  commonMiss: "",
  primaryGoal: "",
  practiceFrequency: "",
  notes: "",
};

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

function getErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "message" in error) {
    const m = (error as { message?: string }).message;
    if (typeof m === "string" && m.trim()) return m;
  }
  if (error instanceof Error && error.message) return error.message;
  return "Something went wrong while saving your profile.";
}

export default function ProfilePage() {
  const auth = useAuthUser();
  const [form, setForm] = useState<GolferProfile>(initialForm);
  const [submitted, setSubmitted] = useState<GolferProfile | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const summaryRows = useMemo(() => {
    if (!submitted) return [];
    const hand =
      submitted.dominantHand === "right"
        ? "Right"
        : submitted.dominantHand === "left"
          ? "Left"
          : "—";
    const miss =
      submitted.commonMiss && commonMissLabels[submitted.commonMiss]
        ? commonMissLabels[submitted.commonMiss]
        : "—";
    const goal =
      submitted.primaryGoal && primaryGoalLabels[submitted.primaryGoal]
        ? primaryGoalLabels[submitted.primaryGoal]
        : "—";
    return [
      { label: "Name", value: submitted.name.trim() || "—" },
      { label: "Handicap", value: submitted.handicap.trim() || "—" },
      { label: "Dominant hand", value: hand },
      { label: "Typical score", value: submitted.typicalScore.trim() || "—" },
      {
        label: "Driver carry",
        value: submitted.driverCarryYards.trim()
          ? `${submitted.driverCarryYards.trim()} yds`
          : "—",
      },
      {
        label: "7-iron carry",
        value: submitted.sevenIronCarryYards.trim()
          ? `${submitted.sevenIronCarryYards.trim()} yds`
          : "—",
      },
      {
        label: "Swing speed",
        value: submitted.swingSpeedMph.trim() ? `${submitted.swingSpeedMph.trim()} mph` : "—",
      },
      { label: "Common miss", value: miss },
      { label: "Primary goal", value: goal },
      { label: "Practice frequency", value: submitted.practiceFrequency.trim() || "—" },
      { label: "Notes", value: submitted.notes.trim() || "—" },
    ];
  }, [submitted]);

  function update<K extends keyof GolferProfile>(key: K, value: GolferProfile[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaveSuccess(false);
    setSaveError(null);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaveError(null);
    setSaveSuccess(false);
    setIsSaving(true);

    try {
      const userId = await getCurrentUserIdForWrite();
      if (!userId) {
        setSaveError("You need to be logged in to save your profile.");
        return;
      }
      const row: GolferProfileInsert = { ...buildGolferProfileInsert(form), user_id: userId };
      const { error } = await supabase.from("golfer_profiles").insert(row);

      if (error) {
        throw error;
      }

      setSubmitted({ ...form });
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
        <div className="mx-auto flex max-w-2xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:max-w-3xl lg:px-8">
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

      <main className="mx-auto max-w-2xl px-4 pb-20 pt-10 sm:px-6 lg:max-w-3xl lg:px-8">
        <div className="max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400/90">
            Player DNA
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Serious golfer profile
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-zinc-400">
            Tune your benchmarks and tendencies — this becomes the baseline for SwingDNA analysis.
          </p>
        </div>

        {auth.status === "loading" ? (
          <div className="mt-10 h-40 animate-pulse rounded-2xl border border-white/10 bg-white/[0.04]" aria-busy />
        ) : auth.status === "signed_out" ? (
          <div className="mt-10">
            <LoginRequiredNotice />
          </div>
        ) : null}

        {auth.status === "signed_in" ? (
          <>
        <form
          onSubmit={handleSubmit}
          className="mt-10 space-y-6 rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-transparent p-6 sm:p-8"
          noValidate
        >
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
                  update("dominantHand", e.target.value as GolferProfile["dominantHand"])
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
                onChange={(e) => update("commonMiss", e.target.value as GolferProfile["commonMiss"])}
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
                onChange={(e) => update("primaryGoal", e.target.value as GolferProfile["primaryGoal"])}
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
            disabled={isSaving}
            className="w-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 py-3 text-sm font-semibold text-zinc-950 shadow-[0_0_36px_rgba(16,185,129,0.28)] transition enabled:hover:from-emerald-400 enabled:hover:to-emerald-500 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-[200px] sm:px-10"
          >
            {isSaving ? "Saving…" : "Save profile"}
          </button>
        </form>

        {saveSuccess ? (
          <div
            className="mt-6 rounded-xl border border-emerald-500/35 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100"
            role="status"
            aria-live="polite"
          >
            Profile saved to SwingDNA. Your data is stored securely.
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
              {summaryRows.map(({ label, value }) => (
                <div
                  key={label}
                  className={label === "Notes" ? "sm:col-span-2" : undefined}
                >
                  <dt className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                    {label}
                  </dt>
                  <dd
                    className={`mt-1 text-sm text-zinc-100 ${label === "Notes" ? "whitespace-pre-wrap" : ""}`}
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
