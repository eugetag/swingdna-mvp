"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { LoginRequiredNotice } from "@/components/login-required-notice";
import { SiteNav } from "@/components/site-nav";
import { getCurrentUserIdForWrite, useAuthUser } from "@/hooks/use-auth-user";
import {
  buildLaunchSessionInsert,
  buildLaunchShotInserts,
  type LaunchSessionInsert,
  type LaunchShotInsert,
} from "@/lib/launchSessionRows";
import { supabase } from "@/lib/supabaseClient";

type Environment = "indoor" | "outdoor";

type LaunchMonitorType =
  | "trackman"
  | "gcquad"
  | "gc3"
  | "flightscope_x3"
  | "flightscope_mevo_plus"
  | "fullswing_kit"
  | "skytrak"
  | "uneekor"
  | "foresight_quadmax"
  | "other";

const LAUNCH_MONITOR_OPTIONS: { id: LaunchMonitorType; label: string }[] = [
  { id: "trackman", label: "TrackMan" },
  { id: "gcquad", label: "Foresight GCQuad" },
  { id: "gc3", label: "Foresight GC3" },
  { id: "flightscope_x3", label: "FlightScope X3" },
  { id: "flightscope_mevo_plus", label: "FlightScope MEVO+" },
  { id: "fullswing_kit", label: "FullSwing KIT" },
  { id: "skytrak", label: "SkyTrak" },
  { id: "uneekor", label: "Uneekor (QED / EYE XO)" },
  { id: "foresight_quadmax", label: "Foresight QuadMAX" },
  { id: "other", label: "Other / manual capture" },
];

const CLUB_OPTIONS = [
  "Driver",
  "3-wood",
  "5-wood",
  "7-wood",
  "2-hybrid",
  "3-hybrid",
  "4-hybrid",
  "5-hybrid",
  "4-iron",
  "5-iron",
  "6-iron",
  "7-iron",
  "8-iron",
  "9-iron",
  "PW",
  "GW / AW",
  "SW",
  "LW",
  "Putter",
  "Other",
] as const;

type ClubOption = (typeof CLUB_OPTIONS)[number];

const SHOT_SHAPE_OPTIONS = [
  { id: "straight", label: "Straight" },
  { id: "fade", label: "Fade" },
  { id: "draw", label: "Draw" },
  { id: "slice", label: "Slice" },
  { id: "hook", label: "Hook" },
  { id: "push", label: "Push" },
  { id: "pull", label: "Pull" },
  { id: "push_fade", label: "Push fade" },
  { id: "pull_draw", label: "Pull draw" },
] as const;

type ShotShapeId = (typeof SHOT_SHAPE_OPTIONS)[number]["id"];

const STRIKE_QUALITY_OPTIONS = [
  { id: "pure", label: "Pure / flush" },
  { id: "solid", label: "Solid" },
  { id: "thin", label: "Thin" },
  { id: "fat", label: "Fat" },
  { id: "heel", label: "Heel" },
  { id: "toe", label: "Toe" },
  { id: "high_face", label: "High face" },
  { id: "low_face", label: "Low face" },
  { id: "heel_toe", label: "Heel–toe" },
] as const;

type StrikeQualityId = (typeof STRIKE_QUALITY_OPTIONS)[number]["id"];

const MISS_DIRECTION_OPTIONS = [
  { id: "online", label: "Online" },
  { id: "left", label: "Left" },
  { id: "right", label: "Right" },
  { id: "short", label: "Short" },
  { id: "long", label: "Long" },
  { id: "left_short", label: "Left + short" },
  { id: "right_short", label: "Right + short" },
  { id: "left_long", label: "Left + long" },
  { id: "right_long", label: "Right + long" },
] as const;

type MissDirectionId = (typeof MISS_DIRECTION_OPTIONS)[number]["id"];

type SessionMeta = {
  title: string;
  date: string;
  environment: Environment;
  launchMonitor: LaunchMonitorType | "";
  notes: string;
};

type ShotDraft = {
  club: ClubOption | "";
  ballSpeed: string;
  clubSpeed: string;
  smashFactor: string;
  carryYards: string;
  totalYards: string;
  spinRpm: string;
  launchAngle: string;
  apexYards: string;
  attackAngle: string;
  clubPath: string;
  faceAngle: string;
  shotShape: ShotShapeId | "";
  strikeQuality: StrikeQualityId | "";
  missDirection: MissDirectionId | "";
  shotNotes: string;
};

type LoggedShot = ShotDraft & { id: string; sequence: number };

const initialSession: SessionMeta = {
  title: "",
  date: new Date().toISOString().slice(0, 10),
  environment: "indoor",
  launchMonitor: "",
  notes: "",
};

const initialShot: ShotDraft = {
  club: "",
  ballSpeed: "",
  clubSpeed: "",
  smashFactor: "",
  carryYards: "",
  totalYards: "",
  spinRpm: "",
  launchAngle: "",
  apexYards: "",
  attackAngle: "",
  clubPath: "",
  faceAngle: "",
  shotShape: "",
  strikeQuality: "",
  missDirection: "",
  shotNotes: "",
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
  return "Could not save this session. Check your connection and Supabase policies.";
}

function newId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function lmLabel(id: LaunchMonitorType | ""): string {
  if (!id) return "—";
  return LAUNCH_MONITOR_OPTIONS.find((x) => x.id === id)?.label ?? id;
}

function shapeLabel(id: ShotShapeId | ""): string {
  if (!id) return "—";
  return SHOT_SHAPE_OPTIONS.find((x) => x.id === id)?.label ?? id;
}

function strikeLabel(id: StrikeQualityId | ""): string {
  if (!id) return "—";
  return STRIKE_QUALITY_OPTIONS.find((x) => x.id === id)?.label ?? id;
}

function missLabel(id: MissDirectionId | ""): string {
  if (!id) return "—";
  return MISS_DIRECTION_OPTIONS.find((x) => x.id === id)?.label ?? id;
}

export default function SessionsPage() {
  const auth = useAuthUser();
  const [session, setSession] = useState<SessionMeta>(initialSession);
  const [shotDraft, setShotDraft] = useState<ShotDraft>(initialShot);
  const [shots, setShots] = useState<LoggedShot[]>([]);
  const [isSavingSession, setIsSavingSession] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const nextSequence = useMemo(() => shots.length + 1, [shots.length]);

  const updateSession = useCallback(<K extends keyof SessionMeta>(key: K, value: SessionMeta[K]) => {
    setSaveSuccess(false);
    setSaveError(null);
    setSession((prev) => ({ ...prev, [key]: value }));
  }, []);

  const updateShot = useCallback(<K extends keyof ShotDraft>(key: K, value: ShotDraft[K]) => {
    setSaveSuccess(false);
    setSaveError(null);
    setShotDraft((prev) => ({ ...prev, [key]: value }));
  }, []);

  function handleAddShot(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!shotDraft.club) return;
    setSaveSuccess(false);
    setSaveError(null);
    setShots((prev) => [
      ...prev,
      { ...shotDraft, id: newId(), sequence: prev.length + 1 },
    ]);
    setShotDraft(initialShot);
  }

  function removeShot(id: string) {
    setSaveSuccess(false);
    setSaveError(null);
    setShots((prev) =>
      prev
        .filter((s) => s.id !== id)
        .map((s, i) => ({ ...s, sequence: i + 1 })),
    );
  }

  async function handleSaveSessionToSupabase() {
    setSaveError(null);
    setSaveSuccess(false);

    if (!session.title.trim()) {
      setSaveError("Add a session title before saving.");
      return;
    }
    if (!session.date) {
      setSaveError("Select a session date.");
      return;
    }
    if (!session.launchMonitor) {
      setSaveError("Select a launch monitor.");
      return;
    }

    if (auth.status !== "signed_in") {
      setSaveError("You need to be logged in to save sessions and shots.");
      return;
    }

    const userId = await getCurrentUserIdForWrite();
    if (!userId) {
      setSaveError("You need to be logged in to save sessions and shots.");
      return;
    }

    setIsSavingSession(true);

    try {
      const sessionBase = buildLaunchSessionInsert({
        title: session.title.trim(),
        date: session.date,
        environment: session.environment,
        launchMonitorLabel: lmLabel(session.launchMonitor),
        notes: session.notes,
      });
      const sessionRow: LaunchSessionInsert = { ...sessionBase, user_id: userId };

      const { data: createdSession, error: sessionError } = await supabase
        .from("launch_sessions")
        .insert(sessionRow)
        .select("id")
        .single();

      if (sessionError) {
        throw sessionError;
      }

      const sessionId = createdSession?.id;
      if (!sessionId) {
        throw new Error("No session id returned from Supabase.");
      }

      if (shots.length > 0) {
        const shotSnapshots = shots.map((s) => ({
          club: s.club,
          ballSpeed: s.ballSpeed,
          clubSpeed: s.clubSpeed,
          smashFactor: s.smashFactor,
          carryYards: s.carryYards,
          totalYards: s.totalYards,
          spinRpm: s.spinRpm,
          launchAngle: s.launchAngle,
          apexYards: s.apexYards,
          attackAngle: s.attackAngle,
          clubPath: s.clubPath,
          faceAngle: s.faceAngle,
          shotShapeLabel: s.shotShape ? shapeLabel(s.shotShape) : "",
          strikeQualityLabel: s.strikeQuality ? strikeLabel(s.strikeQuality) : "",
          missDirectionLabel: s.missDirection ? missLabel(s.missDirection) : "",
          shotNotes: s.shotNotes,
        }));

        const shotBases = buildLaunchShotInserts(shotSnapshots, sessionId);
        const shotRows: LaunchShotInsert[] = shotBases.map((r) => ({ ...r, user_id: userId }));
        const { error: shotsError } = await supabase.from("launch_shots").insert(shotRows);

        if (shotsError) {
          throw shotsError;
        }
      }

      setSaveSuccess(true);
    } catch (err) {
      setSaveError(getErrorMessage(err));
      setSaveSuccess(false);
    } finally {
      setIsSavingSession(false);
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
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
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

      <main className="mx-auto max-w-6xl px-4 pb-24 pt-10 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400/90">
            Launch monitor lab
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Session log
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-zinc-400">
            Capture range or simulator blocks with full LM fields — build a shot journal you can export
            later.
          </p>
          <p className="mt-2 text-xs text-zinc-500">
            {shots.length === 0
              ? "No shots logged yet."
              : `${shots.length} shot${shots.length === 1 ? "" : "s"} · next #${nextSequence}`}
          </p>
        </div>

        {auth.status === "loading" ? (
          <div className="mt-10 h-48 animate-pulse rounded-2xl border border-white/10 bg-white/[0.04]" aria-busy />
        ) : null}
        {auth.status === "signed_out" ? (
          <div className="mt-10">
            <LoginRequiredNotice />
          </div>
        ) : null}

        {auth.status === "signed_in" ? (
          <>
        {/* Session header */}
        <section className="mt-10 rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-transparent p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-white">Session details</h2>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-zinc-400">
              {session.environment === "indoor" ? "Indoor" : "Outdoor"}
            </span>
          </div>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <div className="sm:col-span-2 lg:col-span-2">
              <label htmlFor="session-title" className="mb-1.5 block text-xs font-medium text-zinc-400">
                Session title
              </label>
              <input
                id="session-title"
                className={fieldClass}
                value={session.title}
                onChange={(e) => updateSession("title", e.target.value)}
                placeholder="e.g., Driver speed block · Wedges 80y"
              />
            </div>
            <div>
              <label htmlFor="session-date" className="mb-1.5 block text-xs font-medium text-zinc-400">
                Date
              </label>
              <input
                id="session-date"
                type="date"
                className={`${fieldClass} scheme-dark`}
                value={session.date}
                onChange={(e) => updateSession("date", e.target.value)}
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <span className="mb-2 block text-xs font-medium text-zinc-400">Environment</span>
              <div className="inline-flex rounded-full border border-white/10 bg-zinc-900/60 p-1">
                <button
                  type="button"
                  onClick={() => updateSession("environment", "indoor")}
                  className={
                    session.environment === "indoor"
                      ? "rounded-full bg-white px-5 py-2 text-sm font-semibold text-zinc-950 shadow-sm"
                      : "rounded-full px-5 py-2 text-sm font-medium text-zinc-400 transition hover:text-white"
                  }
                >
                  Indoor
                </button>
                <button
                  type="button"
                  onClick={() => updateSession("environment", "outdoor")}
                  className={
                    session.environment === "outdoor"
                      ? "rounded-full bg-white px-5 py-2 text-sm font-semibold text-zinc-950 shadow-sm"
                      : "rounded-full px-5 py-2 text-sm font-medium text-zinc-400 transition hover:text-white"
                  }
                >
                  Outdoor
                </button>
              </div>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="lm-type" className="mb-1.5 block text-xs font-medium text-zinc-400">
                Launch monitor
              </label>
              <select
                id="lm-type"
                className={`${fieldClass} appearance-none bg-zinc-900/70`}
                value={session.launchMonitor}
                onChange={(e) =>
                  updateSession("launchMonitor", e.target.value as SessionMeta["launchMonitor"])
                }
              >
                <option value="">Select …</option>
                {LAUNCH_MONITOR_OPTIONS.map((lm) => (
                  <option key={lm.id} value={lm.id}>
                    {lm.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <label htmlFor="session-notes" className="mb-1.5 block text-xs font-medium text-zinc-400">
                Session notes
              </label>
              <textarea
                id="session-notes"
                rows={3}
                className={`${fieldClass} resize-y`}
                value={session.notes}
                onChange={(e) => updateSession("notes", e.target.value)}
                placeholder="Intent, ball type, tee height, wind callouts, anything the numbers do not carry."
              />
            </div>
          </div>

          {saveError ? (
            <div
              className="mt-6 rounded-xl border border-red-500/35 bg-red-500/10 px-4 py-3 text-sm text-red-100"
              role="alert"
            >
              {saveError}
            </div>
          ) : null}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-zinc-500">
              Saves this session and every shot in the log below to Supabase ({shots.length} shot
              {shots.length === 1 ? "" : "s"}).
            </p>
            <button
              type="button"
              onClick={() => void handleSaveSessionToSupabase()}
              disabled={isSavingSession}
              className="shrink-0 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 px-8 py-3 text-sm font-semibold text-zinc-950 shadow-[0_0_36px_rgba(16,185,129,0.28)] transition enabled:hover:from-emerald-400 enabled:hover:to-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSavingSession ? "Saving…" : "Save session & shots"}
            </button>
          </div>

          {saveSuccess ? (
            <div
              className="mt-4 rounded-xl border border-emerald-500/35 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100"
              role="status"
              aria-live="polite"
            >
              Session saved to Supabase
              {shots.length > 0
                ? ` with ${shots.length} shot${shots.length === 1 ? "" : "s"}.`
                : "."}
            </div>
          ) : null}
        </section>

        {/* Shot entry */}
        <form
          onSubmit={handleAddShot}
          className="mt-8 space-y-6 rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent p-6 sm:p-8"
        >
          <h2 className="text-lg font-semibold text-white">Log a shot</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label htmlFor="club" className="mb-1.5 block text-xs font-medium text-zinc-400">
                Club used
              </label>
              <select
                id="club"
                className={`${fieldClass} appearance-none bg-zinc-900/70`}
                value={shotDraft.club}
                onChange={(e) => updateShot("club", e.target.value as ClubOption | "")}
                required
              >
                <option value="">Select …</option>
                {CLUB_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="ball-speed" className="mb-1.5 block text-xs font-medium text-zinc-400">
                Ball speed (mph)
              </label>
              <input
                id="ball-speed"
                type="number"
                step="0.1"
                className={fieldClass}
                value={shotDraft.ballSpeed}
                onChange={(e) => updateShot("ballSpeed", e.target.value)}
                placeholder="165.2"
              />
            </div>
            <div>
              <label htmlFor="club-speed" className="mb-1.5 block text-xs font-medium text-zinc-400">
                Club speed (mph)
              </label>
              <input
                id="club-speed"
                type="number"
                step="0.1"
                className={fieldClass}
                value={shotDraft.clubSpeed}
                onChange={(e) => updateShot("clubSpeed", e.target.value)}
                placeholder="112.4"
              />
            </div>
            <div>
              <label htmlFor="smash" className="mb-1.5 block text-xs font-medium text-zinc-400">
                Smash factor
              </label>
              <input
                id="smash"
                type="number"
                step="0.01"
                className={fieldClass}
                value={shotDraft.smashFactor}
                onChange={(e) => updateShot("smashFactor", e.target.value)}
                placeholder="1.47"
              />
            </div>
            <div>
              <label htmlFor="carry" className="mb-1.5 block text-xs font-medium text-zinc-400">
                Carry (yds)
              </label>
              <input
                id="carry"
                type="number"
                step="0.1"
                className={fieldClass}
                value={shotDraft.carryYards}
                onChange={(e) => updateShot("carryYards", e.target.value)}
                placeholder="268"
              />
            </div>
            <div>
              <label htmlFor="total" className="mb-1.5 block text-xs font-medium text-zinc-400">
                Total (yds)
              </label>
              <input
                id="total"
                type="number"
                step="0.1"
                className={fieldClass}
                value={shotDraft.totalYards}
                onChange={(e) => updateShot("totalYards", e.target.value)}
                placeholder="288"
              />
            </div>
            <div>
              <label htmlFor="spin" className="mb-1.5 block text-xs font-medium text-zinc-400">
                Spin rate (rpm)
              </label>
              <input
                id="spin"
                type="number"
                step="1"
                className={fieldClass}
                value={shotDraft.spinRpm}
                onChange={(e) => updateShot("spinRpm", e.target.value)}
                placeholder="2450"
              />
            </div>
            <div>
              <label htmlFor="launch" className="mb-1.5 block text-xs font-medium text-zinc-400">
                Launch angle (°)
              </label>
              <input
                id="launch"
                type="number"
                step="0.1"
                className={fieldClass}
                value={shotDraft.launchAngle}
                onChange={(e) => updateShot("launchAngle", e.target.value)}
                placeholder="10.8"
              />
            </div>
            <div>
              <label htmlFor="apex" className="mb-1.5 block text-xs font-medium text-zinc-400">
                Apex (yds)
              </label>
              <input
                id="apex"
                type="number"
                step="0.1"
                className={fieldClass}
                value={shotDraft.apexYards}
                onChange={(e) => updateShot("apexYards", e.target.value)}
                placeholder="32"
              />
            </div>
            <div>
              <label htmlFor="aoa" className="mb-1.5 block text-xs font-medium text-zinc-400">
                Attack angle (°)
              </label>
              <input
                id="aoa"
                type="number"
                step="0.1"
                className={fieldClass}
                value={shotDraft.attackAngle}
                onChange={(e) => updateShot("attackAngle", e.target.value)}
                placeholder="-2.1"
              />
            </div>
            <div>
              <label htmlFor="path" className="mb-1.5 block text-xs font-medium text-zinc-400">
                Club path (°)
              </label>
              <input
                id="path"
                type="number"
                step="0.1"
                className={fieldClass}
                value={shotDraft.clubPath}
                onChange={(e) => updateShot("clubPath", e.target.value)}
                placeholder="1.4"
              />
            </div>
            <div>
              <label htmlFor="face" className="mb-1.5 block text-xs font-medium text-zinc-400">
                Face angle (°)
              </label>
              <input
                id="face"
                type="number"
                step="0.1"
                className={fieldClass}
                value={shotDraft.faceAngle}
                onChange={(e) => updateShot("faceAngle", e.target.value)}
                placeholder="0.8"
              />
            </div>
            <div>
              <label htmlFor="shot-shape" className="mb-1.5 block text-xs font-medium text-zinc-400">
                Shot shape
              </label>
              <select
                id="shot-shape"
                className={`${fieldClass} appearance-none bg-zinc-900/70`}
                value={shotDraft.shotShape}
                onChange={(e) => updateShot("shotShape", e.target.value as ShotShapeId | "")}
              >
                <option value="">Select …</option>
                {SHOT_SHAPE_OPTIONS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="strike" className="mb-1.5 block text-xs font-medium text-zinc-400">
                Strike quality
              </label>
              <select
                id="strike"
                className={`${fieldClass} appearance-none bg-zinc-900/70`}
                value={shotDraft.strikeQuality}
                onChange={(e) =>
                  updateShot("strikeQuality", e.target.value as StrikeQualityId | "")
                }
              >
                <option value="">Select …</option>
                {STRIKE_QUALITY_OPTIONS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="miss" className="mb-1.5 block text-xs font-medium text-zinc-400">
                Miss direction
              </label>
              <select
                id="miss"
                className={`${fieldClass} appearance-none bg-zinc-900/70`}
                value={shotDraft.missDirection}
                onChange={(e) =>
                  updateShot("missDirection", e.target.value as MissDirectionId | "")
                }
              >
                <option value="">Select …</option>
                {MISS_DIRECTION_OPTIONS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <label htmlFor="shot-notes" className="mb-1.5 block text-xs font-medium text-zinc-400">
                Shot notes
              </label>
              <textarea
                id="shot-notes"
                rows={2}
                className={`${fieldClass} resize-y`}
                value={shotDraft.shotNotes}
                onChange={(e) => updateShot("shotNotes", e.target.value)}
                placeholder="Feel, start line, wind, tee, anything qualitative."
              />
            </div>
          </div>
          <button
            type="submit"
            className="rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 px-10 py-3 text-sm font-semibold text-zinc-950 shadow-[0_0_36px_rgba(16,185,129,0.28)] transition hover:from-emerald-400 hover:to-emerald-500"
          >
            Add shot to session
          </button>
        </form>

        {/* Shot log */}
        <section className="mt-14" aria-label="Logged shots">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-white">Shot log</h2>
              <p className="mt-1 text-xs text-zinc-500">
                {session.title.trim() || "Untitled session"}
                {session.launchMonitor ? ` · ${lmLabel(session.launchMonitor)}` : ""}
                {session.date ? ` · ${session.date}` : ""}
              </p>
            </div>
            <p className="text-sm text-zinc-500">{shots.length} shots</p>
          </div>

          {shots.length === 0 ? (
            <div className="mt-10 rounded-2xl border border-dashed border-white/15 bg-zinc-900/20 px-6 py-16 text-center">
              <p className="text-sm text-zinc-400">
                Log your first shot above. Each add appends to this session with a running number.
              </p>
            </div>
          ) : (
            <>
              {/* Mobile / small: cards */}
              <ul className="mt-8 grid gap-4 lg:hidden">
                {shots.map((s) => (
                  <li
                    key={s.id}
                    className="group rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-zinc-950/40 p-5"
                  >
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div>
                        <p className="font-mono text-xs text-emerald-400/90">#{s.sequence}</p>
                        <h3 className="text-lg font-semibold text-white">{s.club}</h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeShot(s.id)}
                        className="shrink-0 rounded-lg border border-white/10 px-2.5 py-1 text-xs font-medium text-zinc-400 transition hover:border-red-500/40 hover:text-red-300"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="mb-3 h-px w-10 bg-gradient-to-r from-emerald-400/80 to-transparent" />
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                      <StatRow label="Ball / club" value={`${fmt(s.ballSpeed)} / ${fmt(s.clubSpeed)} mph`} />
                      <StatRow label="Smash" value={fmt(s.smashFactor)} />
                      <StatRow label="Carry / total" value={`${fmt(s.carryYards)} / ${fmt(s.totalYards)} yd`} />
                      <StatRow label="Spin" value={s.spinRpm ? `${s.spinRpm} rpm` : "—"} />
                      <StatRow label="Launch / apex" value={`${deg(s.launchAngle)} / ${fmt(s.apexYards)} yd`} />
                      <StatRow
                        label="AoA / path / face"
                        value={`${deg(s.attackAngle)} / ${deg(s.clubPath)} / ${deg(s.faceAngle)}`}
                      />
                      <StatRow label="Shape" value={shapeLabel(s.shotShape)} />
                      <StatRow label="Strike" value={strikeLabel(s.strikeQuality)} />
                      <StatRow label="Miss" value={missLabel(s.missDirection)} wide />
                    </div>
                    {s.shotNotes.trim() ? (
                      <p className="mt-3 border-t border-white/5 pt-3 text-xs leading-relaxed text-zinc-400">
                        {s.shotNotes.trim()}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>

              {/* Desktop: table */}
              <div className="mt-8 hidden overflow-x-auto rounded-2xl border border-white/10 lg:block">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b border-white/10 bg-zinc-900/50 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    <tr>
                      <th className="whitespace-nowrap px-4 py-3">#</th>
                      <th className="whitespace-nowrap px-4 py-3">Club</th>
                      <th className="whitespace-nowrap px-4 py-3">Ball</th>
                      <th className="whitespace-nowrap px-4 py-3">Club</th>
                      <th className="whitespace-nowrap px-4 py-3">Sm</th>
                      <th className="whitespace-nowrap px-4 py-3">Carry</th>
                      <th className="whitespace-nowrap px-4 py-3">Tot</th>
                      <th className="whitespace-nowrap px-4 py-3">Spin</th>
                      <th className="whitespace-nowrap px-4 py-3">LA</th>
                      <th className="whitespace-nowrap px-4 py-3">Apex</th>
                      <th className="whitespace-nowrap px-4 py-3">AoA</th>
                      <th className="whitespace-nowrap px-4 py-3">Path</th>
                      <th className="whitespace-nowrap px-4 py-3">Face</th>
                      <th className="whitespace-nowrap px-4 py-3">Shape</th>
                      <th className="whitespace-nowrap px-4 py-3">Strike</th>
                      <th className="whitespace-nowrap px-4 py-3">Miss</th>
                      <th className="min-w-[140px] px-4 py-3">Notes</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {shots.map((s) => (
                      <tr key={s.id} className="text-zinc-200 hover:bg-white/[0.03]">
                        <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-emerald-300/90">
                          {s.sequence}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 font-medium text-white">{s.club}</td>
                        <td className="whitespace-nowrap px-4 py-3 tabular-nums">{fmt(s.ballSpeed)}</td>
                        <td className="whitespace-nowrap px-4 py-3 tabular-nums">{fmt(s.clubSpeed)}</td>
                        <td className="whitespace-nowrap px-4 py-3 tabular-nums">{fmt(s.smashFactor)}</td>
                        <td className="whitespace-nowrap px-4 py-3 tabular-nums">{fmt(s.carryYards)}</td>
                        <td className="whitespace-nowrap px-4 py-3 tabular-nums">{fmt(s.totalYards)}</td>
                        <td className="whitespace-nowrap px-4 py-3 tabular-nums">{s.spinRpm || "—"}</td>
                        <td className="whitespace-nowrap px-4 py-3 tabular-nums">{deg(s.launchAngle)}</td>
                        <td className="whitespace-nowrap px-4 py-3 tabular-nums">{fmt(s.apexYards)}</td>
                        <td className="whitespace-nowrap px-4 py-3 tabular-nums">{deg(s.attackAngle)}</td>
                        <td className="whitespace-nowrap px-4 py-3 tabular-nums">{deg(s.clubPath)}</td>
                        <td className="whitespace-nowrap px-4 py-3 tabular-nums">{deg(s.faceAngle)}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-zinc-300">{shapeLabel(s.shotShape)}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-zinc-300">{strikeLabel(s.strikeQuality)}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-zinc-300">{missLabel(s.missDirection)}</td>
                        <td className="max-w-[200px] px-4 py-3 text-xs text-zinc-400">
                          {s.shotNotes.trim() || "—"}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">
                          <button
                            type="button"
                            onClick={() => removeShot(s.id)}
                            className="rounded-lg border border-white/10 px-2 py-1 text-xs font-medium text-zinc-400 transition hover:border-red-500/40 hover:text-red-300"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>
          </>
        ) : null}
      </main>
    </div>
  );
}

function fmt(v: string): string {
  return v.trim() === "" ? "—" : v;
}

function deg(v: string): string {
  if (v.trim() === "") return "—";
  return `${v}°`;
}

function StatRow({
  label,
  value,
  wide,
}: {
  label: string;
  value: string;
  wide?: boolean;
}) {
  return (
    <div className={wide ? "col-span-2" : undefined}>
      <div className="text-zinc-500">{label}</div>
      <div className="font-medium text-zinc-200">{value}</div>
    </div>
  );
}
