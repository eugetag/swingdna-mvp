import type { Metadata } from "next";
import Link from "next/link";
import { OpenBetaSignupButton } from "@/components/founding-golfer-beta/open-beta-signup-button";
import { SiteNav } from "@/components/site-nav";
import {
  demoAiSwingInsights,
  demoBagClubs,
  demoCaddiePreview,
  demoEquipmentRecommendations,
  demoGappingSummary,
  demoGolfer,
  demoIronShots,
  demoPracticePlan,
  demoSession,
  demoSwingPhases,
} from "./fictional-demo-data";

export const metadata: Metadata = {
  title: "Demo Report | SwingDNA",
  description:
    "Explore an illustrative SwingDNA performance brief — player snapshot, AI insights, gapping, practice plan, equipment notes, and caddie preview. No real user data.",
};

function DispersionPlaceholder() {
  return (
    <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-white/[0.08] bg-zinc-950">
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(ellipse_50%_45%_at_50%_55%,rgba(16,185,129,0.12),transparent_70%)]"
      />
      <svg viewBox="0 0 400 240" className="h-full w-full" aria-label="Illustrative shot dispersion (demo only)">
        <title>Illustrative dispersion</title>
        <rect x="0" y="0" width="400" height="240" fill="transparent" />
        <line x1="200" y1="20" x2="200" y2="220" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
        <line x1="40" y1="120" x2="360" y2="120" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
        <ellipse cx="205" cy="118" rx="72" ry="38" fill="none" stroke="rgba(52,211,153,0.25)" strokeWidth="1.5" />
        {[
          [188, 108],
          [212, 102],
          [198, 125],
          [220, 118],
          [204, 95],
          [230, 128],
          [192, 132],
          [216, 108],
          [208, 122],
          [222, 112],
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="4" fill="rgba(52,211,153,0.55)" stroke="rgba(16,185,129,0.9)" strokeWidth="1" />
        ))}
        <text x="200" y="232" textAnchor="middle" className="fill-zinc-600 text-[9px] font-medium">
          Illustrative 7i carry dispersion (demo)
        </text>
      </svg>
    </div>
  );
}

function InsightCard({
  title,
  body,
  accent,
}: {
  title: string;
  body: string;
  accent: "emerald" | "sky" | "amber";
}) {
  const border =
    accent === "emerald"
      ? "border-emerald-500/25 bg-emerald-500/[0.06]"
      : accent === "sky"
        ? "border-sky-500/25 bg-sky-500/[0.06]"
        : "border-amber-500/25 bg-amber-500/[0.06]";
  const label =
    accent === "emerald"
      ? "text-emerald-300/90"
      : accent === "sky"
        ? "text-sky-300/90"
        : "text-amber-200/90";

  return (
    <article className={`rounded-2xl border p-5 sm:p-6 ${border}`}>
      <p className={`text-[10px] font-semibold uppercase tracking-[0.2em] ${label}`}>AI insight</p>
      <h3 className="mt-2 text-lg font-semibold tracking-tight text-white">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-zinc-300">{body}</p>
    </article>
  );
}

export default function DemoReportPage() {
  const maxCarry = Math.max(...demoBagClubs.map((c) => c.carryYds));

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-zinc-950 text-zinc-100">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_85%_50%_at_50%_-18%,rgba(16,185,129,0.12),transparent_52%),radial-gradient(ellipse_45%_40%_at_100%_15%,rgba(250,204,21,0.06),transparent_45%),radial-gradient(ellipse_40%_35%_at_0%_90%,rgba(56,189,248,0.05),transparent_42%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(to_bottom,rgba(9,9,11,0.25),rgba(9,9,11,0.97))]"
      />

      <header className="border-b border-white/5 bg-zinc-950/75 backdrop-blur-md">
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
        <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-zinc-900/80 via-zinc-950 to-emerald-950/30 px-6 py-10 sm:px-10 sm:py-14">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 top-0 h-72 w-72 rounded-full bg-emerald-500/15 blur-3xl"
          />
          <div className="relative">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-white/15 bg-white/[0.06] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-200/90">
                Demo experience
              </span>
              <span className="text-xs text-zinc-500">Illustrative data only · no account required</span>
            </div>
            <h1 className="mt-5 max-w-3xl text-pretty text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
              Performance brief
            </h1>
            <p className="mt-4 max-w-2xl text-pretty text-base leading-relaxed text-zinc-400 sm:text-lg">
              A premium sample of how SwingDNA reads your game — from launch monitor and bag context to practice and
              on-course strategy. Everything below is fictional for storytelling.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Handicap index", value: demoGolfer.handicapIndex },
                { label: "Driver carry", value: `${demoGolfer.driverCarryYds} yds` },
                { label: "7 iron carry", value: `${demoGolfer.sevenIronCarryYds} yds` },
                { label: "Session shots", value: String(demoSession.shotCount) },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-2xl border border-white/[0.07] bg-black/30 px-4 py-4 backdrop-blur-sm"
                >
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">{s.label}</p>
                  <p className="mt-2 text-xl font-semibold tabular-nums text-white">{s.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Player snapshot */}
        <section className="mt-14 scroll-mt-24" aria-labelledby="snapshot-heading">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-400/90">01</p>
              <h2 id="snapshot-heading" className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Player snapshot
              </h2>
            </div>
          </div>
          <div className="mt-6 rounded-3xl border border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-zinc-950/60 p-6 sm:p-8">
            <div className="flex flex-col gap-6 border-b border-white/[0.06] pb-8 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-sm text-zinc-500">Golfer</p>
                <p className="mt-1 text-2xl font-semibold text-white">{demoGolfer.displayName}</p>
                <p className="mt-1 text-sm text-zinc-400">{demoGolfer.persona}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-zinc-300">
                  {demoGolfer.dominantHand}-handed
                </span>
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-zinc-300">
                  Typical score {demoGolfer.typicalScore}
                </span>
              </div>
            </div>
            <dl className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { k: "Handicap index", v: demoGolfer.handicapIndex },
                { k: "Common miss", v: demoGolfer.commonMiss },
                { k: "Primary goal", v: demoGolfer.primaryGoal },
                { k: "Driver carry", v: `${demoGolfer.driverCarryYds} yards` },
                { k: "3-wood carry", v: `${demoGolfer.threeWoodCarryYds} yards` },
                { k: "5-iron carry", v: `${demoGolfer.fiveIronCarryYds} yards` },
                { k: "7-iron carry", v: `${demoGolfer.sevenIronCarryYds} yards` },
                { k: "Pitching wedge carry", v: `${demoGolfer.pitchingWedgeCarryYds} yards` },
                { k: "Driver swing speed", v: `${demoGolfer.swingSpeedMph} mph (illustrative)` },
                { k: "Practice rhythm", v: demoGolfer.practiceFrequency },
              ].map((row) => (
                <div key={row.k} className="rounded-2xl border border-white/[0.05] bg-black/25 px-4 py-4">
                  <dt className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">{row.k}</dt>
                  <dd className="mt-2 text-sm font-medium leading-snug text-zinc-100">{row.v}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-8 grid gap-8 lg:grid-cols-2">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Measurements</h3>
                <ul className="mt-3 space-y-2 text-sm text-zinc-300">
                  <li>
                    <span className="text-zinc-500">Height </span>
                    {demoGolfer.measurements.height}
                  </li>
                  <li>
                    <span className="text-zinc-500">Weight </span>
                    {demoGolfer.measurements.weightLbs} lbs
                  </li>
                  <li>
                    <span className="text-zinc-500">Wrist-to-floor </span>
                    {demoGolfer.measurements.wristToFloor}
                  </li>
                  <li>
                    <span className="text-zinc-500">Wingspan </span>
                    {demoGolfer.measurements.wingspan}
                  </li>
                  <li>
                    <span className="text-zinc-500">Flexibility (self) </span>
                    {demoGolfer.measurements.flexibility}
                  </li>
                  <li>
                    <span className="text-zinc-500">Context </span>
                    {demoGolfer.measurements.injuryContext}
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Swing notes</h3>
                <p className="mt-3 text-sm leading-relaxed text-zinc-300">{demoGolfer.swingNotes}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Session + bag */}
        <section className="mt-14 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/[0.08] bg-zinc-900/40 p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-300/90">Launch monitor session</p>
            <h3 className="mt-2 text-xl font-semibold text-white">{demoSession.title}</h3>
            <p className="mt-2 text-sm text-zinc-400">
              {demoSession.date} · {demoSession.environment}
            </p>
            <p className="mt-4 text-sm text-zinc-500">{demoSession.launchMonitor}</p>
            <p className="mt-4 text-sm leading-relaxed text-zinc-400">{demoSession.notes}</p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-zinc-300">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-400" aria-hidden />
              {demoSession.shotCount} shots captured (demo)
            </div>
          </div>
          <div className="rounded-3xl border border-white/[0.08] bg-zinc-900/40 p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300/90">Sample bag</p>
            <h3 className="mt-2 text-xl font-semibold text-white">Illustrative club DNA</h3>
            <p className="mt-2 text-sm text-zinc-400">Carry and tendency notes — not a real fitting sheet.</p>
            <ul className="mt-6 space-y-4">
              {demoBagClubs.map((c) => (
                <li
                  key={c.category}
                  className="flex flex-col gap-1 border-b border-white/[0.05] pb-4 last:border-0 last:pb-0 sm:flex-row sm:items-baseline sm:justify-between"
                >
                  <div>
                    <p className="font-medium text-white">{c.category}</p>
                    <p className="text-xs text-zinc-500">{c.brandModel}</p>
                  </div>
                  <div className="text-right text-sm text-zinc-300">
                    <span className="tabular-nums font-semibold text-emerald-200/90">{c.carryYds}</span>
                    <span className="text-zinc-500"> yd carry · </span>
                    <span className="text-zinc-500">{c.confidence}</span>
                    <p className="mt-1 text-xs text-zinc-500">{c.tendency}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Shot table + dispersion */}
        <section className="mt-14">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-400/90">02</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">Session highlights</h2>
          <div className="mt-6 grid gap-6 lg:grid-cols-5 lg:gap-8">
            <div className="lg:col-span-2">
              <DispersionPlaceholder />
            </div>
            <div className="overflow-hidden rounded-3xl border border-white/[0.08] bg-zinc-900/30 lg:col-span-3">
              <div className="border-b border-white/[0.06] px-4 py-3 sm:px-5">
                <p className="text-xs font-medium text-zinc-500">Sample iron window (illustrative)</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[480px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.06] text-[11px] uppercase tracking-wider text-zinc-500">
                      <th className="px-4 py-3 font-medium sm:px-5">Club</th>
                      <th className="px-4 py-3 font-medium sm:px-5">Carry</th>
                      <th className="px-4 py-3 font-medium sm:px-5">Ball spd</th>
                      <th className="px-4 py-3 font-medium sm:px-5">Spin</th>
                      <th className="px-4 py-3 font-medium sm:px-5">Launch</th>
                      <th className="px-4 py-3 font-medium sm:px-5">Shape</th>
                    </tr>
                  </thead>
                  <tbody>
                    {demoIronShots.map((s, i) => (
                      <tr key={`${s.club}-${i}`} className="border-b border-white/[0.04] text-zinc-300 last:border-0">
                        <td className="px-4 py-3 font-medium text-white sm:px-5">{s.club}</td>
                        <td className="px-4 py-3 tabular-nums sm:px-5">{s.carryYds} yd</td>
                        <td className="px-4 py-3 tabular-nums sm:px-5">{s.ballSpeedMph}</td>
                        <td className="px-4 py-3 tabular-nums sm:px-5">{s.spinRpm}</td>
                        <td className="px-4 py-3 tabular-nums sm:px-5">{s.launchDeg}°</td>
                        <td className="px-4 py-3 text-zinc-400 sm:px-5">{s.shape}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* AI swing insights */}
        <section className="mt-16" aria-labelledby="ai-swing-heading">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-400/90">03</p>
          <h2 id="ai-swing-heading" className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            AI swing insights
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-400">
            Narrative-first reads — the kind of language you can take to the range without a decoder ring.
          </p>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {demoAiSwingInsights.map((ins) => (
              <InsightCard key={ins.title} title={ins.title} body={ins.body} accent={ins.accent} />
            ))}
          </div>
        </section>

        {/* Gapping */}
        <section className="mt-16" aria-labelledby="gapping-heading">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-400/90">04</p>
          <h2 id="gapping-heading" className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Club gapping analysis
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-zinc-300 sm:text-base">{demoGappingSummary}</p>
          <div className="mt-8 space-y-4 rounded-3xl border border-white/[0.08] bg-zinc-900/40 p-6 sm:p-8">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Carry ladder (demo)</p>
            <div className="space-y-5">
              {demoBagClubs.map((c) => (
                <div key={c.category}>
                  <div className="flex justify-between text-xs text-zinc-400">
                    <span className="font-medium text-zinc-200">{c.category}</span>
                    <span className="tabular-nums text-emerald-200/90">{c.carryYds} yd</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400/90"
                      style={{ width: `${(c.carryYds / maxCarry) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Practice + equipment */}
        <section className="mt-16 grid gap-8 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-zinc-950/60 p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-400/90">05</p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-white sm:text-2xl">Practice plan</h2>
            <p className="mt-3 text-sm text-zinc-400">This week — illustrative block plan.</p>
            <ol className="mt-8 space-y-5">
              {demoPracticePlan.map((b, i) => (
                <li key={b.block} className="flex gap-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10 text-sm font-semibold text-emerald-200">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-white">{b.block}</p>
                    <p className="mt-1 text-xs font-medium uppercase tracking-wider text-zinc-500">{b.duration}</p>
                    <p className="mt-2 text-sm leading-relaxed text-zinc-300">{b.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div className="rounded-3xl border border-white/[0.08] bg-zinc-900/40 p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-200/90">06</p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-white sm:text-2xl">Equipment recommendations</h2>
            <p className="mt-3 text-sm text-zinc-400">Illustrative notes — not a substitute for an in-person fitting.</p>
            <ul className="mt-8 space-y-4">
              {demoEquipmentRecommendations.map((line) => (
                <li key={line} className="flex gap-3 text-sm leading-relaxed text-zinc-300">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400/80" aria-hidden />
                  {line}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Caddie */}
        <section className="mt-16" aria-labelledby="caddie-heading">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-200/90">07</p>
          <h2 id="caddie-heading" className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            AI caddie preview
          </h2>
          <div className="mt-6 rounded-3xl border border-amber-500/25 bg-gradient-to-br from-amber-500/[0.1] via-zinc-950/90 to-zinc-950 p-6 sm:p-10">
            <p className="text-sm leading-relaxed text-zinc-200 sm:text-base">{demoCaddiePreview}</p>
          </div>
        </section>

        {/* Swing phases */}
        <section className="mt-16" aria-labelledby="phases-heading">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-300/90">08</p>
          <h2 id="phases-heading" className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Swing phase cards
          </h2>
          <p className="mt-3 max-w-2xl text-sm text-zinc-400">
            Placeholder frames for sequence capture — demo visuals only, not real uploads.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {demoSwingPhases.map((p) => (
              <article
                key={p.phase}
                className="overflow-hidden rounded-2xl border border-sky-500/20 bg-gradient-to-b from-sky-500/[0.08] via-zinc-950/80 to-zinc-950"
              >
                <div className="aspect-[4/3] bg-[linear-gradient(145deg,rgba(56,189,248,0.15),rgba(9,9,11,0.9))]">
                  <div className="flex h-full w-full flex-col justify-end p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-sky-200/80">{p.phase}</p>
                    <p className="mt-2 text-xs leading-relaxed text-zinc-300">{p.note}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* CTAs */}
        <section className="mt-20 rounded-3xl border border-white/[0.1] bg-gradient-to-br from-zinc-900/90 via-zinc-950 to-emerald-950/40 px-6 py-12 text-center sm:px-10">
          <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">Build your real brief</h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-zinc-400">
            Join the Founding Golfer Beta or start your profile — your data stays yours, and your report gets sharper
            every session you log.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap">
            <OpenBetaSignupButton className="inline-flex h-12 min-w-[220px] items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 px-8 text-sm font-semibold text-zinc-950 shadow-[0_0_32px_rgba(16,185,129,0.28)] transition hover:from-emerald-400 hover:to-emerald-500">
              Join Founding Golfer Beta
            </OpenBetaSignupButton>
            <Link
              href="/profile"
              className="inline-flex h-12 min-w-[220px] items-center justify-center rounded-full border border-white/15 bg-white/[0.05] px-8 text-sm font-semibold text-white transition hover:border-white/25 hover:bg-white/[0.1]"
            >
              Create your SwingDNA profile
            </Link>
          </div>
          <p className="mt-8 text-xs text-zinc-600">
            This page uses fictional numbers and copy for marketing purposes only.
          </p>
        </section>
      </main>

      <footer className="border-t border-white/5 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
          <p className="text-sm text-zinc-500">© {new Date().getFullYear()} SwingDNA · Demo report</p>
          <Link href="/how-it-works" className="text-sm font-medium text-zinc-400 transition hover:text-white">
            How it works
          </Link>
        </div>
      </footer>
    </div>
  );
}
