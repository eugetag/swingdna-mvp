import type { Metadata } from "next";
import Link from "next/link";
import { OpenBetaSignupButton } from "@/components/founding-golfer-beta/open-beta-signup-button";
import { SiteNav } from "@/components/site-nav";

export const metadata: Metadata = {
  title: "How It Works | SwingDNA",
  description:
    "SwingDNA fuses launch monitor data, player measurements, club specs, swing positions, and AI into one personalized coaching and caddie system.",
};

const showcaseFeatures = [
  {
    title: "AI Coach + Caddie",
    body: "Narrative briefs that read like a Tour caddie and coach in one channel — priorities, yardages, and what to rehearse.",
  },
  {
    title: "Launch Monitor Intelligence",
    body: "Spin, launch, dispersion, and trends fused across sessions so outliers surface before they cost you strokes.",
  },
  {
    title: "SwingDNA Positions",
    body: "Phase-by-phase swing context so the model sees setup, transition, and delivery — not a single frozen frame.",
  },
  {
    title: "Club Gapping Analysis",
    body: "Carry windows, overlaps, and scoring-club coverage mapped to how you actually play the course.",
  },
  {
    title: "Player Measurement Intelligence",
    body: "Wingspan, wrist-to-floor, and mobility signals inform swing and equipment recommendations.",
  },
  {
    title: "Practice Recommendations",
    body: "Block plans and drills sequenced to your fault signature, time on the range, and upcoming rounds.",
  },
  {
    title: "Injury + Mobility Context",
    body: "Physical constraints shape the advice — no cookie-cutter swings that ignore how your body moves today.",
  },
  {
    title: "Session History & Trends",
    body: "Trajectory of ball flight, confidence, and dispersion over time — proof the work is compounding.",
  },
] as const;

function ProfileIcon() {
  return (
    <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 12a4 4 0 100-8 4 4 0 000 8zM4 20a8 8 0 0116 0"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M8 8V6a4 4 0 118 0v2M5 10h14v10a2 2 0 01-2 2H7a2 2 0 01-2-2V10z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SessionIcon() {
  return (
    <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 7h16M4 12h10M4 17h6M18 15l2 2 4-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IntelligenceIcon() {
  return (
    <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3zM5 19h14"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const processSteps = [
  {
    step: "01",
    title: "Build Your Golfer Profile",
    body: "Add your measurements, flexibility, injuries, tendencies, and goals so SwingDNA understands how YOU move and play.",
    icon: ProfileIcon,
  },
  {
    step: "02",
    title: "Add Your Equipment",
    body: "Track your clubs, distances, shot tendencies, confidence levels, and fitting notes.",
    icon: BagIcon,
  },
  {
    step: "03",
    title: "Log Sessions + Swing Positions",
    body: "Upload launch monitor data and swing phase photos to give the AI deeper context.",
    icon: SessionIcon,
  },
  {
    step: "04",
    title: "Get AI Performance Intelligence",
    body: "Receive Tour-level coaching insights, gapping analysis, practice recommendations, and strategy guidance.",
    icon: IntelligenceIcon,
  },
] as const;

function HeroDashboardMockup() {
  return (
    <div className="relative mx-auto w-full max-w-3xl lg:max-w-none">
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-emerald-500/20 via-transparent to-amber-400/10 blur-2xl"
      />
      <div className="relative overflow-hidden rounded-[1.75rem] border border-white/[0.08] bg-gradient-to-b from-zinc-800/40 to-zinc-950/90 p-px shadow-[0_32px_120px_-24px_rgba(0,0,0,0.85)]">
        <div className="rounded-[1.65rem] bg-zinc-950/95 p-4 sm:p-6">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
              </div>
              <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-600">Command</span>
            </div>
            <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-300/90">
              Live sync
            </span>
          </div>
          <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_1.15fr] lg:gap-6">
            <div className="space-y-4">
              <div className="rounded-2xl border border-white/[0.06] bg-zinc-900/50 p-4">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Bag DNA</p>
                <div className="mt-4 flex h-28 items-end justify-between gap-1.5 px-1">
                  {[40, 72, 55, 88, 64, 48, 76].map((h, i) => (
                    <div
                      key={i}
                      className="w-full max-w-[2rem] rounded-t-sm bg-gradient-to-t from-emerald-600/30 to-emerald-400/70"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-white/[0.06] bg-zinc-900/40 p-4">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Session load</p>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-800">
                  <div className="h-full w-[78%] rounded-full bg-gradient-to-r from-emerald-500 to-teal-400" />
                </div>
                <p className="mt-2 text-xs text-zinc-500">Last import · Trackman CSV</p>
              </div>
            </div>
            <div className="relative rounded-2xl border border-white/[0.06] bg-gradient-to-br from-zinc-900/80 to-zinc-950 p-4 sm:p-5">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">AI brief</p>
              <p className="mt-3 text-sm leading-relaxed text-zinc-300">
                Priority fault: <span className="text-emerald-300/95">early extension</span> under pressure. Gapping
                clean at 125–155; consider 4i vs hybrid on firm approaches.
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="rounded-xl border border-white/[0.05] bg-black/30 px-3 py-2.5">
                  <p className="text-[10px] text-zinc-500">Confidence</p>
                  <p className="mt-0.5 text-lg font-semibold tabular-nums text-white">+12%</p>
                </div>
                <div className="rounded-xl border border-white/[0.05] bg-black/30 px-3 py-2.5">
                  <p className="text-[10px] text-zinc-500">Dispersion</p>
                  <p className="mt-0.5 text-lg font-semibold tabular-nums text-emerald-300">−8 yds</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute -left-2 top-[18%] z-10 hidden sm:block lg:-left-6">
        <div className="rounded-2xl border border-white/10 bg-zinc-900/90 px-4 py-3 shadow-2xl backdrop-blur-md">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Carry efficiency</p>
          <p className="mt-1 text-lg font-semibold text-emerald-300">+4.2%</p>
        </div>
      </div>
      <div className="pointer-events-none absolute -right-2 top-[42%] z-10 hidden sm:block lg:-right-4">
        <div className="rounded-2xl border border-white/10 bg-zinc-900/90 px-4 py-3 shadow-2xl backdrop-blur-md">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">DNA match</p>
          <p className="mt-1 text-lg font-semibold text-white">94</p>
        </div>
      </div>
      <div className="pointer-events-none absolute -bottom-2 left-1/2 z-10 hidden -translate-x-1/2 sm:block">
        <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-950/80 px-4 py-2 shadow-xl backdrop-blur-md">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-40" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          <span className="text-xs font-medium text-emerald-200/90">Analyzer running</span>
        </div>
      </div>
    </div>
  );
}

function FakeAnalyzerPanel({ variant }: { variant: "a" | "b" }) {
  const lines =
    variant === "a"
      ? [
          { dim: false, text: "→ fusion: launch_monitor + swing_phases [OK]" },
          { dim: true, text: "  session_id: lm_2025_04_18_range_01" },
          { dim: false, text: "→ golfer_context: wrist_floor 35\" | mobility: thoracic B+" },
          { dim: false, text: "→ fault_rank: #1 early_extension (pressure_index 0.78)" },
          { dim: true, text: "  evidence: P6–P7 shaft shallow vs baseline -2.1°" },
          { dim: false, text: "→ gapping: gap_125_155_yds [healthy] | 4i vs 4h [recommend hybrid firm]" },
          { dim: false, text: "→ practice_block: 20min | tempo_wedges + exit_path_gate" },
        ]
      : [
          { dim: false, text: "→ caddie_mode: on_course | wind: L→R 6mph" },
          { dim: true, text: "  target: pin_high_right | club_suggestion: 8i" },
          { dim: false, text: "→ dispersion_model: tighten 3yds vs 14d avg (confidence 0.82)" },
          { dim: false, text: "→ strategy: favor center_green — short_right dead" },
          { dim: true, text: "  historical_miss: push_block 12% this round" },
          { dim: false, text: "→ output: coach_narrative + yardage_book_patch [queued]" },
        ];

  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#07080a] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
          <span className="font-mono text-[11px] text-zinc-500">swingdna-analyze</span>
          <span className="rounded border border-white/10 bg-white/[0.04] px-1.5 py-0.5 font-mono text-[10px] text-zinc-400">
            v2.4
          </span>
        </div>
        <span className="font-mono text-[10px] text-emerald-500/80">streaming</span>
      </div>
      <div className="max-h-[220px] overflow-hidden p-4 font-mono text-[11px] leading-relaxed sm:max-h-[260px] sm:text-xs">
        {lines.map((line, i) => (
          <p key={i} className={line.dim ? "text-zinc-600" : "text-zinc-400"}>
            <span className="text-emerald-500/50">›</span> {line.text}
          </p>
        ))}
        <p className="mt-2 animate-pulse text-emerald-400/70">▌</p>
      </div>
    </div>
  );
}

export default function HowItWorksPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-zinc-950 text-zinc-100">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_90%_55%_at_50%_-15%,rgba(16,185,129,0.14),transparent_50%),radial-gradient(ellipse_50%_40%_at_100%_20%,rgba(250,204,21,0.06),transparent_45%),radial-gradient(ellipse_45%_35%_at_0%_80%,rgba(56,189,248,0.05),transparent_40%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(to_bottom,rgba(9,9,11,0.2),rgba(9,9,11,0.97))]"
      />

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

      <main>
        {/* Hero */}
        <section className="relative px-4 pb-20 pt-12 sm:px-6 sm:pb-28 sm:pt-16 lg:px-8 lg:pb-36 lg:pt-20">
          <div className="mx-auto max-w-6xl">
            <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16 xl:gap-20">
              <div className="max-w-xl lg:max-w-none">
                <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-300/90">
                  <span className="h-1 w-1 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
                  Performance intelligence
                </p>
                <h1 className="mt-6 text-pretty text-4xl font-semibold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-[3.25rem] xl:text-6xl">
                  Your AI Golf Performance Intelligence Platform.
                </h1>
                <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-zinc-400 sm:text-xl">
                  SwingDNA combines launch monitor data, player measurements, club specs, swing positions, and AI
                  analysis into one personalized coaching and caddie system.
                </p>
                <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                  <OpenBetaSignupButton className="inline-flex h-12 min-w-[180px] items-center justify-center rounded-full bg-white px-8 text-sm font-semibold text-zinc-950 shadow-lg transition hover:bg-zinc-100">
                    Request access
                  </OpenBetaSignupButton>
                  <Link
                    href="#demo-report"
                    className="inline-flex h-12 min-w-[180px] items-center justify-center rounded-full border border-white/15 bg-white/[0.04] px-8 text-sm font-semibold text-white transition hover:border-white/25 hover:bg-white/[0.08]"
                  >
                    View demo report
                  </Link>
                </div>
              </div>
              <HeroDashboardMockup />
            </div>
          </div>
        </section>

        {/* Cinematic divider */}
        <div className="relative h-px w-full overflow-hidden bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* How it works — 4 steps */}
        <section className="px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-400/90">The loop</p>
              <h2 className="mt-4 text-pretty text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
                How it works
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-zinc-400">
                Four disciplined steps. One continuous model of your game — built to feel inevitable, not
                overwhelming.
              </p>
            </div>
            <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:mt-20 lg:grid-cols-4 lg:gap-6">
              {processSteps.map((item) => {
                const StepIcon = item.icon;
                return (
                <article
                  key={item.step}
                  className="group relative flex flex-col rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.05] to-transparent p-6 transition duration-500 hover:border-emerald-500/25 hover:shadow-[0_0_0_1px_rgba(16,185,129,0.12),0_24px_48px_-24px_rgba(0,0,0,0.6)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="font-mono text-xs text-zinc-600">{item.step}</span>
                    <div className="rounded-xl border border-white/10 bg-zinc-950/80 p-2.5 text-emerald-400/90 transition group-hover:border-emerald-500/30 group-hover:text-emerald-300">
                      <StepIcon />
                    </div>
                  </div>
                  <h3 className="mt-6 text-lg font-semibold tracking-tight text-white">{item.title}</h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-zinc-400">{item.body}</p>
                  <div className="mt-6 h-px w-full bg-gradient-to-r from-emerald-500/40 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
                </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* Feature showcase */}
        <section className="border-y border-white/[0.04] bg-zinc-950/50 px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <div className="max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-400/90">Capability map</p>
                <h2 className="mt-4 text-pretty text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  Built for players who want the whole picture
                </h2>
              </div>
              <p className="max-w-md text-sm leading-relaxed text-zinc-500 lg:text-right">
                Every module feeds the same intelligence core — not siloed dashboards you abandon after week one.
              </p>
            </div>
            <ul className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {showcaseFeatures.map((f) => (
                <li
                  key={f.title}
                  className="rounded-2xl border border-white/[0.06] bg-zinc-900/30 p-6 transition hover:border-white/12 hover:bg-zinc-900/50"
                >
                  <div className="h-px w-8 bg-gradient-to-r from-emerald-400/80 to-transparent" />
                  <h3 className="mt-5 text-base font-semibold text-white">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-500">{f.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Why SwingDNA + demo report */}
        <section id="demo-report" className="scroll-mt-24 px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 lg:items-start">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-500">Why SwingDNA</p>
                <h2 className="mt-4 text-pretty text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
                  More Than Swing Analysis.
                </h2>
                <p className="mt-6 text-lg leading-relaxed text-zinc-400">
                  Most tools stop at a trace or a number. SwingDNA keeps reasoning — connecting ball flight, body,
                  equipment, and intent so the guidance sounds like someone who has walked your fairways with you.
                </p>
                <ul className="mt-10 space-y-4 text-sm text-zinc-400">
                  {[
                    "Narrative you can take to the range, not jargon you Google later.",
                    "Equipment and gapping decisions grounded in your actual dispersion.",
                    "A caddie layer that respects wind, miss patterns, and how you score.",
                  ].map((t) => (
                    <li key={t} className="flex gap-3">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500/80" />
                      {t}
                    </li>
                  ))}
                </ul>
                <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                  <OpenBetaSignupButton className="inline-flex h-11 items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 text-sm font-semibold text-zinc-950 shadow-[0_0_28px_rgba(16,185,129,0.25)] transition hover:from-emerald-400 hover:to-emerald-500">
                    Join the beta
                  </OpenBetaSignupButton>
                  <Link
                    href="/report"
                    className="inline-flex h-11 items-center justify-center rounded-full border border-white/15 px-6 text-sm font-medium text-zinc-200 transition hover:border-white/25 hover:bg-white/[0.05]"
                  >
                    Open live report
                  </Link>
                </div>
              </div>
              <div className="space-y-5">
                <p className="text-center text-[10px] font-semibold uppercase tracking-[0.3em] text-zinc-600 sm:text-left">
                  Simulated analyzer output
                </p>
                <FakeAnalyzerPanel variant="a" />
                <FakeAnalyzerPanel variant="b" />
              </div>
            </div>
          </div>
        </section>

        {/* Bottom CTA strip */}
        <section className="border-t border-white/[0.06] px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-400/80">SwingDNA</p>
            <p className="mx-auto mt-4 max-w-2xl text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              The quiet edge is knowing what to work on — before the round tells you.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <OpenBetaSignupButton className="inline-flex h-12 min-w-[200px] items-center justify-center rounded-full bg-white px-8 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-100">
                Request access
              </OpenBetaSignupButton>
              <Link
                href="/"
                className="text-sm font-medium text-zinc-500 underline-offset-4 transition hover:text-white hover:underline"
              >
                Back to home
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/5 px-4 py-8 sm:px-6 lg:px-8">
        <p className="mx-auto max-w-6xl text-center text-sm text-zinc-600">
          © {new Date().getFullYear()} SwingDNA. AI golf performance intelligence.
        </p>
      </footer>
    </div>
  );
}
