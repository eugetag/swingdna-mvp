"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LoginRequiredNotice } from "@/components/login-required-notice";
import { SiteNav } from "@/components/site-nav";
import { UpgradePrompt } from "@/components/subscription/upgrade-prompt";
import { useAuthUser } from "@/hooks/use-auth-user";
import type { GolfCoachInsights } from "@/lib/golfCoachAnalysis";
import {
  avgBagConfidence,
  buildDnaRead,
  buildEquipmentNotes,
  buildGappingBullets,
  buildNextSessionPlan,
  buildPracticePriorities,
  buildSwingInsights,
  buildTendencyCards,
  computeSessionAggregates,
  deriveStrongestScore,
  deriveWeakestScore,
  fetchReportBundle,
  hasAnyReportData,
  profileHasMeasurementData,
  type GolfBagClubRow,
  type GolferProfileRow,
  type LaunchSessionRow,
  type LaunchShotRow,
  type ReportBundle,
  sessionHighlightCards,
} from "@/lib/reportAnalytics";
import { formatBodyTypeLabel } from "@/lib/golferProfileInsert";
import { getUsageSnapshotFromProfile, incrementAdvancedAiAnalysis } from "@/lib/subscriptionUsage";
import { supabase } from "@/lib/supabaseClient";
import { trimStringish } from "@/lib/trimStringish";

function getErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "message" in error) {
    const m = (error as { message?: string }).message;
    if (typeof m === "string" && m.trim()) return m;
  }
  if (error instanceof Error && error.message) return error.message;
  return "Could not load report data.";
}

/** Normalize Supabase fields that may be string, number, or other JSON scalars for display. */
function toNonEmptyDisplayString(v: unknown): string | null {
  if (v == null) return null;
  if (typeof v === "number") {
    if (!Number.isFinite(v)) return null;
    const s = String(v).trim();
    return s ? s : null;
  }
  const s = trimStringish(v);
  return s ? s : null;
}

function optionalDash(v: unknown): string {
  return toNonEmptyDisplayString(v) ?? "—";
}

function optionalFallback(v: unknown, fallback: string): string {
  return toNonEmptyDisplayString(v) ?? fallback;
}

function fmt1(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return "—";
  return n.toFixed(1);
}

function fmt0(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return "—";
  return Math.round(n).toString();
}

function fmtHand(h: unknown): string {
  const raw = toNonEmptyDisplayString(h);
  if (!raw) return "—";
  return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
}

function ScoreBadge({ score, label }: { score: number; label?: string }) {
  const tone =
    score >= 8
      ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-200"
      : score >= 7
        ? "border-sky-500/35 bg-sky-500/10 text-sky-100"
        : "border-amber-500/35 bg-amber-500/10 text-amber-100";
  return (
    <span
      className={`inline-flex flex-col items-center justify-center rounded-xl border px-3 py-2 ${tone}`}
      title={label}
    >
      <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Score</span>
      <span className="font-mono text-xl font-semibold tabular-nums leading-none">{score.toFixed(1)}</span>
      <span className="text-[10px] text-zinc-500">/10</span>
    </span>
  );
}

function SeverityPill({ severity }: { severity: "High" | "Med" | "Low" }) {
  const cls =
    severity === "High"
      ? "border-red-500/35 bg-red-500/10 text-red-200"
      : severity === "Med"
        ? "border-amber-500/35 bg-amber-500/10 text-amber-100"
        : "border-emerald-500/30 bg-emerald-500/10 text-emerald-100";
  return (
    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${cls}`}>
      {severity}
    </span>
  );
}

function Section({
  id,
  eyebrow,
  title,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <div className="mb-4 flex items-end justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400/90">{eyebrow}</p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-white sm:text-2xl">{title}</h2>
        </div>
      </div>
      {children}
    </section>
  );
}

function Card({
  children,
  className = "",
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <div
      id={id}
      className={`rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-zinc-950/40 p-5 sm:p-6 ${className}`}
    >
      {children}
    </div>
  );
}

function Shell() {
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(16,185,129,0.18),transparent_55%),radial-gradient(ellipse_60%_40%_at_100%_0%,rgba(250,204,21,0.08),transparent_50%),radial-gradient(ellipse_50%_35%_at_0%_100%,rgba(56,189,248,0.06),transparent_45%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(to_bottom,rgba(9,9,11,0.3),rgba(9,9,11,0.95))]"
      />
    </>
  );
}

function isRecord(x: unknown): x is Record<string, unknown> {
  return x != null && typeof x === "object" && !Array.isArray(x);
}

function asStringList(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.map((x) => trimStringish(x)).filter(Boolean);
}

function parseApiInsightsPayload(json: unknown): GolfCoachInsights {
  if (!isRecord(json)) {
    throw new Error("Invalid response from analysis service.");
  }
  const insights = json.insights;
  if (!isRecord(insights)) {
    throw new Error("Missing insights in response.");
  }
  return {
    executiveSummary: trimStringish(insights.executiveSummary),
    swingTendencies: asStringList(insights.swingTendencies),
    clubGappingObservations: asStringList(insights.clubGappingObservations),
    consistencyAnalysis: asStringList(insights.consistencyAnalysis),
    distanceObservations: asStringList(insights.distanceObservations),
    practiceRecommendations: asStringList(insights.practiceRecommendations),
    equipmentRecommendations: asStringList(insights.equipmentRecommendations),
    courseStrategySuggestions: asStringList(insights.courseStrategySuggestions),
  };
}

function CoachAiInsightList({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div className="border-t border-white/[0.06] pt-5 first:border-t-0 first:pt-0">
      <h4 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-200/80">{title}</h4>
      <ul className="mt-3 space-y-2.5">
        {items.map((line, i) => (
          <li key={`${title}-${i}`} className="flex gap-3 text-sm leading-relaxed text-zinc-300">
            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-amber-400/70" aria-hidden />
            <span>{line}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CoachAiLoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-5" aria-busy="true" aria-label="Generating coach analysis">
      <div className="h-4 w-full max-w-2xl rounded bg-white/10" />
      <div className="h-4 w-full max-w-xl rounded bg-white/[0.07]" />
      <div className="grid gap-4 pt-2 sm:grid-cols-2">
        <div className="h-24 rounded-xl bg-white/[0.05]" />
        <div className="h-24 rounded-xl bg-white/[0.05]" />
        <div className="h-24 rounded-xl bg-white/[0.05]" />
        <div className="h-24 rounded-xl bg-white/[0.05]" />
      </div>
    </div>
  );
}

function ProfileStat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3.5 shadow-sm shadow-black/20">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">{label}</p>
      <div className="mt-1.5 text-sm font-medium leading-snug text-zinc-100">{children}</div>
    </div>
  );
}

function ProfileShowcase({
  profile,
  dnaRead,
  bagAvgConf,
}: {
  profile: GolferProfileRow | null;
  dnaRead: string;
  bagAvgConf: number | null;
}) {
  return (
    <section id="profile" className="scroll-mt-24">
      <div className="mb-4 border-b border-white/10 pb-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400/90">Player</p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight text-white sm:text-2xl">Profile</h2>
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Card className="relative overflow-hidden">
            <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl" aria-hidden />
            {profile != null ? (
              <>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Player name</p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                  {optionalFallback(profile.name, "—")}
                </p>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <ProfileStat label="Handicap">{optionalDash(profile.handicap)}</ProfileStat>
                  <ProfileStat label="Dominant hand">{fmtHand(profile.dominant_hand)}</ProfileStat>
                  <ProfileStat label="Typical score">{optionalDash(profile.typical_score)}</ProfileStat>
                  <ProfileStat label="Driver carry">
                    {profile.driver_carry != null ? `${fmt0(profile.driver_carry)} yd` : "—"}
                  </ProfileStat>
                  <ProfileStat label="7 iron carry">
                    {profile.seven_iron_carry != null ? `${fmt0(profile.seven_iron_carry)} yd` : "—"}
                  </ProfileStat>
                  <ProfileStat label="Swing speed">
                    {profile.swing_speed != null ? `${fmt1(profile.swing_speed)} mph` : "—"}
                  </ProfileStat>
                  <ProfileStat label="Common miss">{optionalDash(profile.common_miss)}</ProfileStat>
                  <ProfileStat label="Primary goal">{optionalDash(profile.primary_goal)}</ProfileStat>
                  <ProfileStat label="Practice frequency">{optionalDash(profile.practice_frequency)}</ProfileStat>
                </div>
                <div className="mt-5 border-t border-white/10 pt-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">Notes</p>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-300">
                    {optionalFallback(profile.notes, "No notes on file.")}
                  </p>
                </div>
              </>
            ) : (
              <p className="text-sm text-zinc-500">No golfer profile saved yet.</p>
            )}
          </Card>
        </div>
        <Card className="flex flex-col">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">DNA read</p>
          <p className="mt-3 flex-1 text-sm leading-relaxed text-zinc-300">{dnaRead}</p>
          <div className="mt-6 rounded-xl border border-white/10 bg-zinc-900/50 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Avg bag confidence</p>
            <div className="mt-2 flex items-end gap-2">
              <span className="font-mono text-3xl font-semibold text-emerald-300">
                {bagAvgConf != null ? bagAvgConf.toFixed(1) : "—"}
              </span>
              <span className="pb-1 text-xs text-zinc-500">/10</span>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}

function MeasurementsShowcase({ profile }: { profile: GolferProfileRow | null }) {
  const has = profileHasMeasurementData(profile);
  return (
    <section id="measurements" className="scroll-mt-24">
      <div className="mb-4 border-b border-amber-500/20 pb-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-amber-200/90">Fitting lab</p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight text-white sm:text-2xl">Player measurements</h2>
        <p className="mt-1 text-xs text-zinc-500">Anthropometrics & context from your saved profile</p>
      </div>
      {!profile ? (
        <Card>
          <p className="text-sm text-zinc-500">No profile loaded.</p>
        </Card>
      ) : !has ? (
        <Card className="relative overflow-hidden border-amber-500/15 bg-gradient-to-br from-amber-500/[0.05] to-zinc-950/60">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-16 h-36 w-36 rounded-full bg-amber-400/10 blur-3xl"
          />
          <p className="relative text-sm leading-relaxed text-zinc-400">
            No measurements on file. Add your frame, lengths, and fitting notes on the{" "}
            <Link href="/profile" className="font-medium text-amber-200/90 underline-offset-2 hover:underline">
              Profile
            </Link>{" "}
            page to unlock richer equipment reads here and in Coach AI.
          </p>
        </Card>
      ) : (
        <div className="relative overflow-hidden rounded-2xl border border-amber-500/25 bg-gradient-to-b from-amber-500/[0.07] via-zinc-950/80 to-zinc-950 p-6 sm:p-8 shadow-[0_0_48px_-28px_rgba(251,191,36,0.22)]">
          <div
            aria-hidden
            className="pointer-events-none absolute -left-20 top-0 h-48 w-48 rounded-full bg-amber-500/10 blur-3xl"
          />
          <div className="relative grid gap-8 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-200/80">Frame</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <ProfileStat label="Age">{profile.age != null ? fmt0(profile.age) : "—"}</ProfileStat>
                <ProfileStat label="Height">
                  {profile.height != null ? `${fmt1(profile.height)} in` : "—"}
                </ProfileStat>
                <ProfileStat label="Weight">
                  {profile.weight != null ? `${fmt1(profile.weight)} lbs` : "—"}
                </ProfileStat>
                <ProfileStat label="Body type">{formatBodyTypeLabel(profile.body_type)}</ProfileStat>
                <ProfileStat label="Flexibility (1–10)">
                  {profile.flexibility_score != null ? String(profile.flexibility_score) : "—"}
                </ProfileStat>
              </div>
              <h3 className="pt-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-200/80">
                Fitting tape
              </h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <ProfileStat label="Waist">
                  {profile.waist_measurement != null ? `${fmt1(profile.waist_measurement)} in` : "—"}
                </ProfileStat>
                <ProfileStat label="Inseam">
                  {profile.inseam != null ? `${fmt1(profile.inseam)} in` : "—"}
                </ProfileStat>
                <ProfileStat label="Arm length">
                  {profile.arm_length != null ? `${fmt1(profile.arm_length)} in` : "—"}
                </ProfileStat>
                <ProfileStat label="Wrist-to-floor">
                  {profile.wrist_to_floor != null ? `${fmt1(profile.wrist_to_floor)} in` : "—"}
                </ProfileStat>
                <ProfileStat label="Shoulder width">
                  {profile.shoulder_width != null ? `${fmt1(profile.shoulder_width)} in` : "—"}
                </ProfileStat>
                <ProfileStat label="Shoe size (US)">{optionalDash(profile.shoe_size)}</ProfileStat>
              </div>
            </div>
            <div className="flex flex-col gap-4 rounded-xl border border-white/10 bg-black/25 p-5">
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Context</h3>
              <div className="flex-1 space-y-4 text-sm leading-relaxed text-zinc-300">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                    Athletic background
                  </p>
                  <p className="mt-1.5">{optionalFallback(profile.athletic_background, "—")}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Injury notes</p>
                  <p className="mt-1.5">{optionalFallback(profile.injury_notes, "—")}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Fitting notes</p>
                  <p className="mt-1.5">{optionalFallback(profile.fitting_notes, "—")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function BagShowcaseTable({ clubs }: { clubs: GolfBagClubRow[] }) {
  return (
    <section id="bag" className="scroll-mt-24">
      <div className="mb-4 border-b border-white/10 pb-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400/90">Equipment</p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight text-white sm:text-2xl">Saved bag</h2>
      </div>
      <Card className="overflow-hidden p-0">
        {clubs.length === 0 ? (
          <p className="p-6 text-sm text-zinc-500">No clubs in your bag yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-zinc-900/70 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                  <th className="whitespace-nowrap px-4 py-3.5">Club</th>
                  <th className="whitespace-nowrap px-4 py-3.5">Brand / model</th>
                  <th className="whitespace-nowrap px-4 py-3.5">Loft</th>
                  <th className="whitespace-nowrap px-4 py-3.5">Flex</th>
                  <th className="whitespace-nowrap px-4 py-3.5">Carry</th>
                  <th className="whitespace-nowrap px-4 py-3.5">Total</th>
                  <th className="whitespace-nowrap px-4 py-3.5">Shot shape</th>
                  <th className="whitespace-nowrap px-4 py-3.5 text-right">Confidence</th>
                </tr>
              </thead>
              <tbody className="text-zinc-200">
                {clubs.map((c, row) => (
                  <tr
                    key={c.id}
                    className={`border-b border-white/[0.04] transition-colors hover:bg-white/[0.04] ${row % 2 === 1 ? "bg-black/15" : ""}`}
                  >
                    <td className="px-4 py-3 font-medium text-white">{c.club_type ?? "—"}</td>
                    <td className="px-4 py-3 text-zinc-300">{[c.brand, c.model].filter(Boolean).join(" ") || "—"}</td>
                    <td className="px-4 py-3 font-mono text-xs tabular-nums text-zinc-400">
                      {toNonEmptyDisplayString(c.loft as string | number | null | undefined) ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-zinc-400">{optionalDash(c.flex)}</td>
                    <td className="px-4 py-3 font-mono text-xs tabular-nums">
                      {c.carry_distance != null ? `${fmt0(c.carry_distance)} yd` : "—"}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs tabular-nums text-zinc-400">
                      {c.total_distance != null ? `${fmt0(c.total_distance)} yd` : "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-zinc-400">{optionalDash(c.shot_shape_tendency)}</td>
                    <td className="px-4 py-3 text-right font-mono text-xs tabular-nums text-emerald-300/90">
                      {c.confidence_rating != null ? `${c.confidence_rating}/10` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </section>
  );
}

function ShotsShowcaseTable({
  shots,
  hasSession,
}: {
  shots: LaunchShotRow[];
  hasSession: boolean;
}) {
  return (
    <section id="shots" className="scroll-mt-24">
      <div className="mb-4 border-b border-white/10 pb-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400/90">Launch monitor</p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight text-white sm:text-2xl">Session shots</h2>
        <p className="mt-1 text-xs text-zinc-500">Latest session · ordered by created_at ascending</p>
      </div>
      <Card className="overflow-hidden p-0 ring-1 ring-white/[0.06]">
        {shots.length > 0 ? (
          <div className="max-h-[min(28rem,70vh)] overflow-auto">
            <table className="w-full min-w-[880px] border-collapse text-left text-sm">
              <thead className="sticky top-0 z-[1] border-b border-white/10 bg-zinc-950/95 backdrop-blur-sm">
                <tr className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                  <th className="whitespace-nowrap px-4 py-3.5">Club</th>
                  <th className="whitespace-nowrap px-4 py-3.5">Carry</th>
                  <th className="whitespace-nowrap px-4 py-3.5">Ball mph</th>
                  <th className="whitespace-nowrap px-4 py-3.5">Club mph</th>
                  <th className="whitespace-nowrap px-4 py-3.5">Smash</th>
                  <th className="whitespace-nowrap px-4 py-3.5">Spin</th>
                  <th className="whitespace-nowrap px-4 py-3.5">Miss</th>
                  <th className="whitespace-nowrap px-4 py-3.5">Shape</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05] text-zinc-200">
                {shots.map((s) => (
                  <tr key={s.id} className="transition-colors hover:bg-emerald-500/[0.06]">
                    <td className="px-4 py-3 font-medium text-white">{s.club_used ?? "—"}</td>
                    <td className="px-4 py-3 font-mono text-xs tabular-nums">{fmt0(s.carry_distance)}</td>
                    <td className="px-4 py-3 font-mono text-xs tabular-nums">{fmt1(s.ball_speed)}</td>
                    <td className="px-4 py-3 font-mono text-xs tabular-nums">{fmt1(s.club_speed)}</td>
                    <td className="px-4 py-3 font-mono text-xs tabular-nums">
                      {s.smash_factor != null ? s.smash_factor.toFixed(2) : "—"}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs tabular-nums text-zinc-400">{fmt0(s.spin_rate)}</td>
                    <td className="px-4 py-3 text-xs text-zinc-400">{s.miss_direction ?? "—"}</td>
                    <td className="px-4 py-3 text-xs text-zinc-400">{s.shot_shape ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="p-6 text-sm text-zinc-500">
            {hasSession
              ? "No shots returned for this session_id."
              : "No latest session — shots were not loaded."}
          </p>
        )}
      </Card>
    </section>
  );
}

function CalculatedMetricsBlock({
  agg,
}: {
  agg: ReturnType<typeof computeSessionAggregates>;
}) {
  return (
    <section id="metrics" className="scroll-mt-24">
      <div className="mb-4 border-b border-white/10 pb-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400/90">Computed</p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight text-white sm:text-2xl">Calculated metrics</h2>
        <p className="mt-1 text-xs text-zinc-500">From launch_shots for the latest session only</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Avg carry", value: agg.avgCarry != null ? `${fmt1(agg.avgCarry)} yd` : "—" },
          { label: "Avg ball speed", value: agg.avgBallSpeed != null ? `${fmt1(agg.avgBallSpeed)} mph` : "—" },
          { label: "Avg club speed", value: agg.avgClubSpeed != null ? `${fmt1(agg.avgClubSpeed)} mph` : "—" },
          { label: "Avg smash factor", value: agg.avgSmash != null ? agg.avgSmash.toFixed(2) : "—" },
          { label: "Avg spin rate", value: agg.avgSpin != null ? `${fmt0(agg.avgSpin)} rpm` : "—" },
          { label: "Common miss direction", value: agg.commonMissDirection ?? "—" },
          { label: "Most used club", value: agg.mostUsedClub ?? "—" },
          { label: "Total shots", value: String(agg.shotCount) },
        ].map((m) => (
          <Card key={m.label} className="!p-4">
            <p className="text-xs text-zinc-500">{m.label}</p>
            <p className="mt-1 font-mono text-lg font-semibold text-white">{m.value}</p>
          </Card>
        ))}
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Card className="!p-4">
          <p className="text-xs text-zinc-500">Strongest club (avg carry)</p>
          <p className="mt-1 text-sm font-semibold text-white">
            {agg.strongestClubByCarry?.club ?? "—"}
            {agg.strongestClubByCarry != null ? (
              <span className="ml-2 font-mono text-emerald-300/90">{fmt1(agg.strongestClubByCarry.avgCarry)} yd</span>
            ) : null}
          </p>
        </Card>
        <Card className="!p-4">
          <p className="text-xs text-zinc-500">Weakest club (carry consistency)</p>
          <p className="mt-1 text-sm font-semibold text-white">
            {agg.weakestClubByConsistency?.club ?? "—"}
            {agg.weakestClubByConsistency != null ? (
              <span className="ml-2 font-mono text-amber-200/90">
                CV {(agg.weakestClubByConsistency.cv * 100).toFixed(0)}%
              </span>
            ) : null}
          </p>
        </Card>
      </div>
    </section>
  );
}

function DeveloperDebugPanel({
  bundle,
  supabaseErrors,
}: {
  bundle: ReportBundle;
  supabaseErrors: string[];
}) {
  return (
    <details className="mb-10 rounded-2xl border border-white/[0.06] bg-zinc-900/25 text-sm text-zinc-500">
      <summary className="cursor-pointer list-none px-5 py-4 font-medium text-zinc-400 transition hover:bg-white/[0.03] hover:text-zinc-300 [&::-webkit-details-marker]:hidden">
        <span className="inline-flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-zinc-600" aria-hidden />
          Developer debug
        </span>
      </summary>
      <div className="border-t border-white/[0.06] px-5 py-4">
        <dl className="grid gap-3 font-mono text-xs text-zinc-400 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="text-zinc-600">Profile found</dt>
            <dd className="mt-1 text-zinc-300">{bundle.profile != null ? "yes" : "no"}</dd>
          </div>
          <div>
            <dt className="text-zinc-600">Clubs found</dt>
            <dd className="mt-1 text-zinc-300">{bundle.bagClubs.length}</dd>
          </div>
          <div>
            <dt className="text-zinc-600">Session found</dt>
            <dd className="mt-1 text-zinc-300">{bundle.latestSession != null ? "yes" : "no"}</dd>
          </div>
          <div>
            <dt className="text-zinc-600">Shots found</dt>
            <dd className="mt-1 text-zinc-300">{bundle.sessionShots.length}</dd>
          </div>
          <div>
            <dt className="text-zinc-600">Swing phase photos</dt>
            <dd className="mt-1 text-zinc-300">{bundle.swingPhasePhotos.length}</dd>
          </div>
        </dl>
        {supabaseErrors.length > 0 ? (
          <div className="mt-4 rounded-xl border border-amber-500/25 bg-amber-500/5 px-4 py-3 text-amber-100/90">
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-200/80">Supabase errors</p>
            <ul className="mt-2 space-y-1.5 font-mono text-[11px] leading-relaxed">
              {supabaseErrors.map((err, i) => (
                <li key={`${i}-${err.slice(0, 80)}`}>{err}</li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="mt-4 text-xs text-zinc-600">No Supabase errors on these queries.</p>
        )}
      </div>
    </details>
  );
}

function AiCoachBlock({
  aiLoading,
  aiError,
  aiInsights,
}: {
  aiLoading: boolean;
  aiError: string | null;
  aiInsights: GolfCoachInsights | null;
}) {
  if (!aiLoading && !aiError && !aiInsights) return null;
  return (
    <section id="ai-coach" className="mb-12 scroll-mt-24">
      <div className="mb-4 flex items-end justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-200/90">Coach intelligence</p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-white sm:text-2xl">Tour caddie report</h2>
        </div>
      </div>

      {aiError ? (
        <div
          className="mb-5 rounded-2xl border border-red-500/40 bg-red-500/10 px-5 py-4 text-sm text-red-100"
          role="alert"
        >
          {aiError}
        </div>
      ) : null}

      {aiLoading || aiInsights ? (
        <div className="relative overflow-hidden rounded-2xl border border-amber-500/25 bg-gradient-to-br from-amber-950/25 via-zinc-950/90 to-zinc-950 p-6 shadow-[0_0_80px_-20px_rgba(251,191,36,0.18)] sm:p-8">
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/45 to-transparent"
            aria-hidden
          />
          <div className="pointer-events-none absolute -right-24 -top-24 h-48 w-48 rounded-full bg-amber-500/10 blur-3xl" aria-hidden />

          {aiLoading ? (
            <CoachAiLoadingSkeleton />
          ) : aiInsights ? (
            <div className="relative">
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-zinc-500">Executive read</p>
              <p className="mt-3 text-base font-medium leading-relaxed text-zinc-100 sm:text-lg">
                {aiInsights.executiveSummary || "—"}
              </p>
              <div className="mt-8 space-y-8">
                <CoachAiInsightList title="Swing tendencies" items={aiInsights.swingTendencies} />
                <CoachAiInsightList title="Club gapping" items={aiInsights.clubGappingObservations} />
                <CoachAiInsightList title="Consistency" items={aiInsights.consistencyAnalysis} />
                <CoachAiInsightList title="Distance" items={aiInsights.distanceObservations} />
                <CoachAiInsightList title="Practice" items={aiInsights.practiceRecommendations} />
                <CoachAiInsightList title="Equipment" items={aiInsights.equipmentRecommendations} />
                <CoachAiInsightList title="Course strategy" items={aiInsights.courseStrategySuggestions} />
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

function LoadingDashboard() {
  return (
    <div className="animate-pulse space-y-8">
      <div className="h-10 w-2/3 max-w-md rounded-lg bg-white/10" />
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="h-64 rounded-2xl bg-white/5 lg:col-span-2" />
        <div className="h-64 rounded-2xl bg-white/5" />
      </div>
      <div className="h-48 rounded-2xl bg-white/5" />
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="h-32 rounded-2xl bg-white/5" />
        <div className="h-32 rounded-2xl bg-white/5" />
        <div className="h-32 rounded-2xl bg-white/5" />
      </div>
    </div>
  );
}

const emptyReportBundle: ReportBundle = {
  profile: null,
  bagClubs: [],
  latestSession: null,
  sessionShots: [],
  swingPhasePhotos: [],
};

export default function ReportPage() {
  const auth = useAuthUser();
  const [bundle, setBundle] = useState<ReportBundle | null>(null);
  const [supabaseErrors, setSupabaseErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiInsights, setAiInsights] = useState<GolfCoachInsights | null>(null);
  const aiRequestGen = useRef(0);
  const aiAnalyzingRef = useRef(false);

  useEffect(() => {
    if (auth.status === "loading") {
      setLoading(true);
      return;
    }

    if (auth.status === "signed_out") {
      setBundle(emptyReportBundle);
      setSupabaseErrors([]);
      setLoadError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadError(null);
      setSupabaseErrors([]);
      try {
        const { bundle: nextBundle, supabaseErrors: sbErrs } = await fetchReportBundle(
          supabase,
          auth.userId,
        );
        if (!cancelled) {
          setBundle(nextBundle);
          setSupabaseErrors(sbErrs);
        }
      } catch (e) {
        if (!cancelled) {
          setLoadError(getErrorMessage(e));
          setBundle(emptyReportBundle);
          setSupabaseErrors([getErrorMessage(e)]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [auth]);

  useEffect(() => {
    setAiInsights(null);
    setAiError(null);
    setAiLoading(false);
    aiRequestGen.current += 1;
    aiAnalyzingRef.current = false;
  }, [bundle?.latestSession?.id, bundle?.profile?.id, bundle?.swingPhasePhotos?.length]);

  const usageSnapshot = useMemo(() => {
    if (!bundle?.profile) return null;
    return getUsageSnapshotFromProfile(bundle.profile);
  }, [
    bundle?.profile?.id,
    bundle?.profile?.subscription_tier,
    bundle?.profile?.advanced_ai_analysis_count,
    bundle?.profile?.swing_analysis_count,
    bundle?.profile?.ai_usage_month_key,
  ]);

  const runAnalyzeWithAi = useCallback(async () => {
    const authUserId = auth.status === "signed_in" ? auth.userId : null;
    if (!bundle || aiAnalyzingRef.current) return;
    if (bundle.profile) {
      const snap = getUsageSnapshotFromProfile(bundle.profile);
      if (!snap.canRunAdvancedAi) {
        aiAnalyzingRef.current = false;
        return;
      }
    }
    aiAnalyzingRef.current = true;
    const gen = ++aiRequestGen.current;
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile: bundle.profile,
          bag: bundle.bagClubs,
          session: bundle.latestSession,
          shots: bundle.sessionShots,
          swingPhasePhotos: bundle.swingPhasePhotos,
        }),
      });
      const json: unknown = await res.json().catch(() => null);
      if (!res.ok) {
        const msg =
          json && isRecord(json) && typeof json.error === "string" && json.error.trim()
            ? json.error.trim()
            : `Analysis request failed (${res.status}).`;
        throw new Error(msg);
      }
      const insights = parseApiInsightsPayload(json);
      if (aiRequestGen.current === gen) {
        setAiInsights(insights);
      }
      if (authUserId && bundle.profile) {
        const inc = await incrementAdvancedAiAnalysis(supabase, authUserId);
        if (inc.ok) {
          const { bundle: nextBundle, supabaseErrors: sb2 } = await fetchReportBundle(supabase, authUserId);
          if (aiRequestGen.current === gen) {
            setBundle(nextBundle);
            if (sb2.length) {
              setSupabaseErrors((prev) => Array.from(new Set([...prev, ...sb2])));
            }
          }
        }
      }
    } catch (e) {
      if (aiRequestGen.current === gen) {
        setAiInsights(null);
        setAiError(getErrorMessage(e));
      }
    } finally {
      aiAnalyzingRef.current = false;
      if (aiRequestGen.current === gen) {
        setAiLoading(false);
      }
    }
  }, [bundle, auth]);

  const agg = useMemo(
    () => computeSessionAggregates(bundle?.sessionShots ?? []),
    [bundle?.sessionShots],
  );

  const bagAvgConf = useMemo(() => (bundle ? avgBagConfidence(bundle.bagClubs) : null), [bundle]);

  const tendencies = useMemo(
    () => buildTendencyCards(bundle?.profile ?? null, agg, bundle?.sessionShots ?? []),
    [bundle?.profile, bundle?.sessionShots, agg],
  );

  const swingLines = useMemo(() => buildSwingInsights(agg, bundle?.sessionShots ?? []), [agg, bundle?.sessionShots]);

  const gapping = useMemo(
    () => buildGappingBullets(bundle?.bagClubs ?? []),
    [bundle?.bagClubs],
  );

  const practice = useMemo(
    () => buildPracticePriorities(bundle?.profile ?? null, agg, agg.weakestClubByConsistency),
    [bundle?.profile, agg],
  );

  const equipment = useMemo(() => buildEquipmentNotes(bundle?.bagClubs ?? []), [bundle?.bagClubs]);

  const nextPlan = useMemo(() => buildNextSessionPlan(agg), [agg]);

  const highlights = useMemo(() => sessionHighlightCards(agg), [agg]);

  const dnaRead = useMemo(
    () => buildDnaRead(bundle?.profile ?? null, agg, bagAvgConf),
    [bundle?.profile, agg, bagAvgConf],
  );

  const generatedLabel = bundle?.latestSession?.created_at
    ? new Date(bundle.latestSession.created_at).toISOString().slice(0, 10)
    : new Date().toISOString().slice(0, 10);

  const displayName = optionalFallback(bundle?.profile?.name, "Your performance report");

  const strongestWhy = agg.strongestClubByCarry
    ? `${agg.strongestClubByCarry.club} leads this session at ${fmt1(agg.strongestClubByCarry.avgCarry)} yd carry (${agg.strongestClubByCarry.count} shots).`
    : "Log carry by club in Sessions to rank strongest ball-speed windows.";

  const weakestWhy = agg.weakestClubByConsistency
    ? `${agg.weakestClubByConsistency.club} shows the highest carry volatility (CV ${(agg.weakestClubByConsistency.cv * 100).toFixed(0)}%, n=${agg.weakestClubByConsistency.count}).`
    : "Need at least two carry samples per club to score consistency — add more reps per club in one session.";

  const hasData = bundle != null && hasAnyReportData(bundle);
  const needsLogin = auth.status === "signed_out";
  const dataReady = !loading && bundle != null && !needsLogin;

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-zinc-950 text-zinc-100">
      <Shell />

      <header className="border-b border-white/5 bg-zinc-950/70 backdrop-blur-md">
        <div className="mx-auto flex min-w-0 max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400/90 to-emerald-700/80 text-sm font-semibold tracking-tight text-zinc-950 shadow-[0_0_24px_rgba(52,211,153,0.35)]">
              S
            </span>
            <span className="font-semibold tracking-tight text-white">
              Swing<span className="text-emerald-400/90">DNA</span>
            </span>
          </Link>
          <SiteNav />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-24 pt-10 sm:px-6 lg:px-8">
        {loadError ? (
          <div
            className="mb-8 rounded-2xl border border-red-500/35 bg-red-500/10 px-5 py-4 text-sm text-red-100"
            role="alert"
          >
            {loadError}
          </div>
        ) : null}

        {needsLogin ? (
          <div className="mb-10">
            <LoginRequiredNotice />
          </div>
        ) : null}

        {loading ? (
          <LoadingDashboard />
        ) : dataReady ? (
          <>
            <div className="mb-12 space-y-14">
              <ProfileShowcase profile={bundle.profile} dnaRead={dnaRead} bagAvgConf={bagAvgConf} />
              <MeasurementsShowcase profile={bundle.profile} />
              <BagShowcaseTable clubs={bundle.bagClubs} />
              <ShotsShowcaseTable
                shots={bundle.sessionShots}
                hasSession={bundle.latestSession != null}
              />
              <CalculatedMetricsBlock agg={agg} />
            </div>

            {usageSnapshot && bundle.profile && !usageSnapshot.canRunAdvancedAi ? (
              <div className="mb-6">
                <UpgradePrompt kind="advanced-ai" />
              </div>
            ) : null}

            <div className="mb-10 flex flex-col gap-4 rounded-2xl border border-white/10 bg-zinc-900/40 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <div className="min-w-0">
                <p className="text-sm leading-relaxed text-zinc-400">
                  Get a Tour-level coach read on the profile, bag, and session data loaded above.
                </p>
                {usageSnapshot && bundle.profile ? (
                  <p className="mt-2 text-xs text-zinc-500">
                    Advanced AI this month:{" "}
                    {usageSnapshot.advancedLimit == null ? (
                      <span className="text-emerald-400/90">unlimited</span>
                    ) : (
                      <>
                        <span className="tabular-nums text-zinc-300">
                          {usageSnapshot.advancedUsed}/{usageSnapshot.advancedLimit}
                        </span>
                        <span className="text-zinc-600"> · Resets UTC monthly</span>
                      </>
                    )}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => void runAnalyzeWithAi()}
                disabled={
                  aiLoading ||
                  Boolean(usageSnapshot && bundle.profile && !usageSnapshot.canRunAdvancedAi)
                }
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-amber-400/35 bg-gradient-to-r from-amber-500/20 to-amber-600/10 px-5 py-2.5 text-sm font-semibold text-amber-100 shadow-[0_0_28px_-8px_rgba(251,191,36,0.45)] transition hover:border-amber-300/50 hover:from-amber-500/30 hover:text-white disabled:pointer-events-none disabled:opacity-50"
              >
                {aiLoading ? (
                  <>
                    <span
                      className="h-4 w-4 animate-spin rounded-full border-2 border-amber-200/30 border-t-amber-100"
                      aria-hidden
                    />
                    Analyzing…
                  </>
                ) : (
                  "Analyze With AI"
                )}
              </button>
            </div>

            <AiCoachBlock aiLoading={aiLoading} aiError={aiError} aiInsights={aiInsights} />

            {!hasData ? (
              <div className="rounded-2xl border border-dashed border-white/15 bg-zinc-900/30 px-8 py-20 text-center">
                <p className="text-lg font-semibold text-white">No report data yet</p>
                <p className="mx-auto mt-3 max-w-md text-sm text-zinc-400">
                  Save a golfer profile, add clubs to your bag, and log a launch monitor session with shots. The
                  sections above show what loaded from Supabase.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  <Link
                    href="/profile"
                    className="rounded-full border border-white/15 bg-white/5 px-5 py-2 text-sm font-medium text-white transition hover:bg-white/10"
                  >
                    Profile
                  </Link>
                  <Link
                    href="/bag"
                    className="rounded-full border border-white/15 bg-white/5 px-5 py-2 text-sm font-medium text-white transition hover:bg-white/10"
                  >
                    Bag
                  </Link>
                  <Link
                    href="/sessions"
                    className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-100"
                  >
                    Sessions
                  </Link>
                </div>
              </div>
            ) : (
              <>
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400/90">
                  AI performance report
                </p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">{displayName}</h1>
                <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                  Live synthesis from your Supabase profile, bag, and latest LM session — refreshed each time you open
                  this page.
                </p>
              </div>
              <Card className="lg:max-w-sm lg:shrink-0">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs text-zinc-500">Generated</p>
                    <p className="font-mono text-sm text-white">{generatedLabel}</p>
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-medium text-zinc-400">
                    SwingDNA · live
                  </span>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-zinc-500">
                  {agg.shotCount} shot{agg.shotCount === 1 ? "" : "s"} in latest session · {bundle!.bagClubs.length}{" "}
                  bag slot{bundle!.bagClubs.length === 1 ? "" : "s"} saved
                </p>
              </Card>
            </div>

            <nav
              className="mt-8 flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-zinc-900/30 p-2 text-xs sm:text-sm"
              aria-label="Report sections"
            >
              {[
                ["profile", "Profile"],
                ["measurements", "Measurements"],
                ["bag", "Bag"],
                ["shots", "Shots"],
                ["metrics", "Metrics"],
                ["ai-coach", "Coach AI"],
                ["session", "Session"],
                ["tendencies", "Tendencies"],
                ["strong", "Strong"],
                ["weak", "Weak"],
                ["gapping", "Gapping"],
                ["swing", "Swing"],
                ["practice", "Practice"],
                ["equipment", "Equipment"],
                ["next", "Next"],
              ].map(([id, label]) => (
                <a
                  key={id}
                  href={`#${id}`}
                  className="rounded-full border border-transparent px-3 py-1.5 text-zinc-400 transition hover:border-white/15 hover:bg-white/5 hover:text-white"
                >
                  {label}
                </a>
              ))}
            </nav>

            <div className="mt-12 space-y-14">
              <Section id="session" eyebrow="Launch monitor" title="Session summary">
                <div className="grid gap-5 lg:grid-cols-3">
                  <Card className="lg:col-span-2">
                    <h3 className="text-lg font-semibold text-white">
                      {optionalFallback(bundle!.latestSession?.session_title, "Untitled session")}
                    </h3>
                    <p className="mt-2 text-sm text-zinc-400">
                      {(bundle!.latestSession?.session_date != null
                        ? String(bundle!.latestSession.session_date)
                        : "—") +
                        " · " +
                        optionalDash(bundle!.latestSession?.environment) +
                        " · " +
                        optionalDash(bundle!.latestSession?.launch_monitor)}
                    </p>
                    <p className="mt-4 text-sm leading-relaxed text-zinc-300">
                      {optionalFallback(bundle!.latestSession?.notes, "No session notes on file.")}
                    </p>
                    <p className="mt-4 text-xs text-zinc-500">
                      <span className="font-medium text-zinc-400">Shots in report:</span> {agg.shotCount}
                    </p>
                  </Card>
                  <div className="grid gap-3">
                    {highlights.map((h) => (
                      <Card key={h.label} className="!p-4">
                        <p className="text-xs text-zinc-500">{h.label}</p>
                        <p className="mt-1 font-mono text-lg font-semibold text-white">{h.value}</p>
                        <p className="mt-1 text-xs text-emerald-300/90">{h.delta}</p>
                      </Card>
                    ))}
                  </div>
                </div>
              </Section>

              <Section id="tendencies" eyebrow="Diagnostics" title="Key tendencies">
                <ul className="grid gap-4 lg:grid-cols-3">
                  {tendencies.map((t) => (
                    <li key={t.title}>
                      <Card className="h-full">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-base font-semibold leading-snug text-white">{t.title}</h3>
                          <SeverityPill severity={t.severity} />
                        </div>
                        <p className="mt-3 text-sm leading-relaxed text-zinc-400">{t.detail}</p>
                      </Card>
                    </li>
                  ))}
                </ul>
              </Section>

              <div className="grid gap-8 lg:grid-cols-2">
                <Section id="strong" eyebrow="Session signal" title="Strongest club">
                  <ul className="space-y-4">
                    <li>
                      <Card className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0 flex-1">
                          <h3 className="text-lg font-semibold text-white">
                            {agg.strongestClubByCarry?.club ?? "—"}
                          </h3>
                          <p className="mt-2 text-sm leading-relaxed text-zinc-400">{strongestWhy}</p>
                        </div>
                        <ScoreBadge
                          score={deriveStrongestScore(agg.strongestClubByCarry, agg.avgCarry)}
                          label="Derived session score"
                        />
                      </Card>
                    </li>
                  </ul>
                </Section>

                <Section id="weak" eyebrow="Risk" title="Weakest club (consistency)">
                  <ul className="space-y-4">
                    <li>
                      <Card className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0 flex-1">
                          <h3 className="text-lg font-semibold text-white">
                            {agg.weakestClubByConsistency?.club ?? "—"}
                          </h3>
                          <p className="mt-2 text-sm leading-relaxed text-zinc-400">{weakestWhy}</p>
                        </div>
                        <ScoreBadge score={deriveWeakestScore(agg.weakestClubByConsistency)} label="Consistency risk" />
                      </Card>
                    </li>
                  </ul>
                </Section>
              </div>

              <Section id="gapping" eyebrow="Yardage book" title="Distance gapping insights">
                <Card>
                  <p className="text-sm leading-relaxed text-zinc-300">{gapping.summary}</p>
                  <ul className="mt-5 space-y-3">
                    {gapping.bullets.map((b) => (
                      <li key={b} className="flex gap-3 text-sm text-zinc-400">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500/80" />
                        {b}
                      </li>
                    ))}
                  </ul>
                </Card>
              </Section>

              <Section id="swing" eyebrow="Motion" title="Swing / impact pattern insights">
                <Card>
                  <ul className="space-y-4">
                    {swingLines.map((line) => (
                      <li key={line} className="flex gap-3 text-sm leading-relaxed text-zinc-300">
                        <span className="mt-0.5 font-mono text-xs text-emerald-500/90">▸</span>
                        {line}
                      </li>
                    ))}
                  </ul>
                </Card>
              </Section>

              <Section id="practice" eyebrow="Training" title="Practice priorities">
                <ol className="grid gap-4 lg:grid-cols-3">
                  {practice.map((p) => (
                    <li key={p.rank}>
                      <Card className="relative h-full overflow-hidden pt-8">
                        <span className="absolute left-5 top-4 font-mono text-xs font-semibold text-emerald-400/90">
                          #{p.rank}
                        </span>
                        <h3 className="text-base font-semibold text-white">{p.title}</h3>
                        <p className="mt-2 text-sm leading-relaxed text-zinc-400">{p.detail}</p>
                      </Card>
                    </li>
                  ))}
                </ol>
              </Section>

              <Section id="equipment" eyebrow="Gear" title="Equipment recommendations">
                <Card>
                  <ul className="space-y-3">
                    {equipment.map((line) => (
                      <li key={line} className="flex gap-3 text-sm text-zinc-300">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400/80" />
                        {line}
                      </li>
                    ))}
                  </ul>
                </Card>
              </Section>

              <Section id="next" eyebrow="Plan" title="Next session plan">
                <div className="grid gap-5 lg:grid-cols-3">
                  <Card className="lg:col-span-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Target duration</p>
                    <p className="mt-2 font-mono text-2xl font-semibold text-white">{nextPlan.duration}</p>
                    <p className="mt-3 text-xs leading-relaxed text-zinc-500">
                      Built from your latest session size and club usage.
                    </p>
                  </Card>
                  <Card className="lg:col-span-2">
                    <h3 className="text-base font-semibold text-white">Block outline</h3>
                    <ol className="mt-4 space-y-3">
                      {nextPlan.blocks.map((b, i) => (
                        <li key={b} className="flex gap-3 text-sm text-zinc-300">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/10 bg-zinc-900 font-mono text-xs text-emerald-300">
                            {i + 1}
                          </span>
                          <span className="pt-0.5">{b}</span>
                        </li>
                      ))}
                    </ol>
                  </Card>
                </div>
              </Section>
            </div>

            <div className="mt-16 rounded-2xl border border-emerald-500/25 bg-gradient-to-br from-emerald-500/10 to-zinc-950/60 p-6 text-center sm:p-8">
              <p className="text-sm font-medium text-white">Keep your data fresh</p>
              <p className="mx-auto mt-2 max-w-lg text-xs text-zinc-400">
                Re-save profile after swing changes, update bag carries after fittings, and log mixed LM blocks for
                sharper reads.
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <Link
                  href="/profile"
                  className="rounded-full border border-white/15 bg-white/5 px-5 py-2 text-sm font-medium text-white transition hover:bg-white/10"
                >
                  Profile
                </Link>
                <Link
                  href="/bag"
                  className="rounded-full border border-white/15 bg-white/5 px-5 py-2 text-sm font-medium text-white transition hover:bg-white/10"
                >
                  Bag
                </Link>
                <Link
                  href="/sessions"
                  className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-100"
                >
                  Sessions
                </Link>
              </div>
            </div>
          </>
            )}
            <DeveloperDebugPanel bundle={bundle} supabaseErrors={supabaseErrors} />
          </>
        ) : null}
      </main>
    </div>
  );
}
