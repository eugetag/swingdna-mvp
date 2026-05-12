import type { Metadata } from "next";
import Link from "next/link";
import { SiteNav } from "@/components/site-nav";

export const metadata: Metadata = {
  title: "SwingDNA | AI Golf Performance",
  description:
    "Serious swing analysis powered by video, launch monitor data, club specs, and AI — with practice plans and gapping optimization.",
};

const features = [
  {
    title: "Swing video intelligence",
    body: "Upload rounds and range sessions. Our models read plane, tempo, and impact patterns frame by frame.",
  },
  {
    title: "Launch monitor fusion",
    body: "Ingest Trackman, GCQuad, or FlightScope exports. Spin, launch, and dispersion meet your on-camera motion.",
  },
  {
    title: "Club DNA library",
    body: "Shaft profiles, lofts, lies, and builds — so recommendations respect your bag, not a generic fitting chart.",
  },
  {
    title: "AI performance briefs",
    body: "Clear diagnostics on what is costing you strokes and why, with coach-grade language you can act on.",
  },
  {
    title: "Practice prescriptions",
    body: "Drills and block plans tailored to your fault signature, time available, and upcoming rounds.",
  },
  {
    title: "Gapping & bag math",
    body: "Optimize carry windows, eliminate redundancies, and build a scoring set that fits your yardage book.",
  },
];

const steps = [
  {
    step: "01",
    title: "Connect your data",
    body: "Drop in swing videos and launch monitor files. Add club specs in minutes.",
  },
  {
    step: "02",
    title: "Model your DNA",
    body: "We fuse biomechanics, ball flight, and equipment context into a single player fingerprint.",
  },
  {
    step: "03",
    title: "Train with clarity",
    body: "Receive AI briefs, prioritized fixes, and practice blocks — then iterate with fresh uploads.",
  },
];

const plans = [
  {
    name: "Player",
    price: "$29",
    period: "/mo",
    blurb: "For dedicated amateurs dialing in one club at a time.",
    highlights: ["5 swing analyses / mo", "Launch monitor import", "Practice plan builder"],
    featured: false,
  },
  {
    name: "Competitor",
    price: "$79",
    period: "/mo",
    blurb: "For tournament golfers who want the full bag and gapping picture.",
    highlights: [
      "Unlimited video + LM fusion",
      "Club gapping optimizer",
      "Priority model refresh",
    ],
    featured: true,
  },
  {
    name: "Academy",
    price: "Custom",
    period: "",
    blurb: "For coaches and facilities training rosters at scale.",
    highlights: ["Multi-athlete workspace", "White-label reports", "API & integrations"],
    featured: false,
  },
];

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-zinc-950 text-zinc-100">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(16,185,129,0.18),transparent_55%),radial-gradient(ellipse_60%_40%_at_100%_0%,rgba(250,204,21,0.08),transparent_50%),radial-gradient(ellipse_50%_35%_at_0%_100%,rgba(56,189,248,0.06),transparent_45%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(to_bottom,rgba(9,9,11,0.3),rgba(9,9,11,0.95))]"
      />

      <header className="border-b border-white/5 bg-zinc-950/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400/90 to-emerald-700/80 text-sm font-semibold tracking-tight text-zinc-950 shadow-[0_0_24px_rgba(52,211,153,0.35)]">
              S
            </span>
            <span className="font-semibold tracking-tight text-white">
              Swing<span className="text-emerald-400/90">DNA</span>
            </span>
          </Link>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 md:gap-x-8">
            <SiteNav />
            <nav
              className="hidden items-center gap-8 text-sm text-zinc-400 md:flex"
              aria-label="Page sections"
            >
              <a href="#features" className="transition hover:text-white">
                Features
              </a>
              <a href="#how" className="transition hover:text-white">
                How it works
              </a>
              <a href="#pricing" className="transition hover:text-white">
                Pricing
              </a>
            </nav>
          </div>
          <div className="flex shrink-0 items-center gap-3">
              <Link
                href="/bag"
              className="hidden text-sm text-zinc-400 transition hover:text-white sm:inline"
            >
                Manage bag
              </Link>
            <a
              href="#cta"
              className="rounded-full bg-white px-4 py-2 text-sm font-medium text-zinc-950 shadow-sm transition hover:bg-zinc-100"
            >
              Request access
            </a>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative px-4 pb-24 pt-16 sm:px-6 sm:pt-24 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="flex max-w-3xl flex-col gap-8">
              <p className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium tracking-wide text-emerald-300/90">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]" />
                AI performance lab for serious golfers
              </p>
              <h1 className="text-4xl font-semibold leading-[1.08] tracking-tight text-white sm:text-5xl sm:leading-[1.07] lg:text-6xl">
                Decode your swing.{" "}
                <span className="bg-gradient-to-r from-emerald-300 via-emerald-400 to-amber-200/90 bg-clip-text text-transparent">
                  Own your bag.
                </span>
              </h1>
              <p className="max-w-2xl text-lg leading-relaxed text-zinc-400 sm:text-xl">
                SwingDNA merges video, launch monitor data, and club specs into one AI layer — surfacing{" "}
                <span className="text-zinc-200">what to fix</span>,{" "}
                <span className="text-zinc-200">how to practice it</span>, and{" "}
                <span className="text-zinc-200">how to gap your set</span> for lower scores under pressure.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href="/profile"
                  className="inline-flex h-12 items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 px-8 text-sm font-semibold text-zinc-950 shadow-[0_0_40px_rgba(16,185,129,0.35)] transition hover:from-emerald-400 hover:to-emerald-500"
                >
                  Start your profile
                </Link>
                <a
                  href="#how"
                  className="inline-flex h-12 items-center justify-center rounded-full border border-white/15 bg-white/5 px-8 text-sm font-medium text-zinc-100 transition hover:border-white/25 hover:bg-white/10"
                >
                  See the workflow
                </a>
              </div>
              <dl className="grid gap-6 border-t border-white/10 pt-10 sm:grid-cols-3">
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                    Analysis depth
                  </dt>
                  <dd className="mt-1 text-2xl font-semibold tabular-nums text-white">Multi-sensor</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                    Practice output
                  </dt>
                  <dd className="mt-1 text-2xl font-semibold text-white">Prescriptive</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                    Bag intelligence
                  </dt>
                  <dd className="mt-1 text-2xl font-semibold text-white">Gapping-first</dd>
                </div>
              </dl>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="scroll-mt-20 border-t border-white/5 bg-zinc-950/50 px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="max-w-2xl">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-emerald-400/90">
                Capabilities
              </h2>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Built for players who already track the numbers — and want them to finally agree.
              </p>
            </div>
            <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((f) => (
                <li
                  key={f.title}
                  className="group rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-transparent p-6 transition hover:border-emerald-500/30 hover:shadow-[0_0_0_1px_rgba(16,185,129,0.15)]"
                >
                  <div className="mb-4 h-px w-10 bg-gradient-to-r from-emerald-400/80 to-transparent transition group-hover:w-14" />
                  <h3 className="text-lg font-semibold text-white">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-400">{f.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="scroll-mt-20 px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-xl">
                <h2 className="text-sm font-semibold uppercase tracking-widest text-emerald-400/90">
                  How it works
                </h2>
                <p className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  From raw capture to a practice plan you can hit this weekend.
                </p>
              </div>
              <p className="max-w-md text-sm leading-relaxed text-zinc-400 lg:text-right">
                No black-box tips. Every insight ties back to your video, ball flight, and the clubs in your
                trunk.
              </p>
            </div>
            <ol className="mt-16 grid gap-8 lg:grid-cols-3">
              {steps.map((s, i) => (
                <li
                  key={s.step}
                  className="relative rounded-2xl border border-white/10 bg-zinc-900/40 p-8 pt-12"
                >
                  <span className="absolute left-8 top-0 -translate-y-1/2 rounded-full border border-white/10 bg-zinc-950 px-3 py-1 text-xs font-mono text-emerald-400/90">
                    {s.step}
                  </span>
                  {i < steps.length - 1 ? (
                    <span
                      aria-hidden
                      className="absolute -right-4 top-1/2 hidden h-px w-8 bg-gradient-to-r from-emerald-500/40 to-transparent lg:block"
                    />
                  ) : null}
                  <h3 className="text-xl font-semibold text-white">{s.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-zinc-400">{s.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Pricing preview */}
        <section
          id="pricing"
          className="scroll-mt-20 border-t border-white/5 bg-gradient-to-b from-zinc-900/30 to-zinc-950 px-4 py-20 sm:px-6 lg:px-8"
        >
          <div className="mx-auto max-w-6xl">
            <div className="text-center">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-emerald-400/90">Pricing</h2>
              <p className="mx-auto mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Invest like your handicap depends on it — because it does.
              </p>
              <p className="mx-auto mt-4 max-w-lg text-sm text-zinc-400">
                Preview rates for individuals. Annual billing saves two months on Player and Competitor.
              </p>
            </div>
            <div className="mt-14 grid gap-6 lg:grid-cols-3">
              {plans.map((p) => (
                <div
                  key={p.name}
                  className={
                    p.featured
                      ? "relative flex flex-col rounded-2xl border border-emerald-500/40 bg-gradient-to-b from-emerald-500/10 to-zinc-950/80 p-8 shadow-[0_0_60px_rgba(16,185,129,0.12)]"
                      : "flex flex-col rounded-2xl border border-white/10 bg-zinc-900/25 p-8"
                  }
                >
                  {p.featured ? (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-emerald-500 px-3 py-0.5 text-xs font-semibold text-zinc-950">
                      Most popular
                    </span>
                  ) : null}
                  <h3 className="text-lg font-semibold text-white">{p.name}</h3>
                  <p className="mt-2 text-sm text-zinc-400">{p.blurb}</p>
                  <p className="mt-6 flex items-baseline gap-1">
                    <span className="text-4xl font-semibold tracking-tight text-white">{p.price}</span>
                    {p.period ? (
                      <span className="text-sm text-zinc-500">{p.period}</span>
                    ) : null}
                  </p>
                  <ul className="mt-8 flex flex-1 flex-col gap-3 text-sm text-zinc-300">
                    {p.highlights.map((h) => (
                      <li key={h} className="flex gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500/80" />
                        {h}
                      </li>
                    ))}
                  </ul>
                  <a
                    href="#cta"
                    className={
                      p.featured
                        ? "mt-8 inline-flex h-11 items-center justify-center rounded-full bg-white text-sm font-semibold text-zinc-950 transition hover:bg-zinc-100"
                        : "mt-8 inline-flex h-11 items-center justify-center rounded-full border border-white/15 bg-white/5 text-sm font-medium text-white transition hover:border-white/25 hover:bg-white/10"
                    }
                  >
                    {p.name === "Academy" ? "Talk to us" : "Join waitlist"}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section
          id="cta"
          className="scroll-mt-20 px-4 py-24 sm:px-6 lg:px-8"
        >
          <div className="mx-auto max-w-6xl">
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900/80 via-zinc-950 to-emerald-950/40 px-6 py-16 text-center sm:px-12 sm:py-20">
              <div
                aria-hidden
                className="pointer-events-none absolute -left-20 top-0 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute -right-20 bottom-0 h-64 w-64 rounded-full bg-amber-400/10 blur-3xl"
              />
              <h2 className="relative text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Ready to see your swing the way the data does?
              </h2>
              <p className="relative mx-auto mt-4 max-w-xl text-sm leading-relaxed text-zinc-400 sm:text-base">
                We are onboarding a limited cohort of committed players and coaches. Request access and we will
                match you to the right workspace.
              </p>
              <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <a
                  href="mailto:hello@swingdna.app"
                  className="inline-flex h-12 min-w-[200px] items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 px-8 text-sm font-semibold text-zinc-950 shadow-[0_0_40px_rgba(16,185,129,0.3)] transition hover:from-emerald-400 hover:to-emerald-500"
                >
                  Request access
                </a>
                <a
                  href="#features"
                  className="text-sm font-medium text-zinc-400 underline-offset-4 transition hover:text-white hover:underline"
                >
                  Explore features
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/5 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 sm:flex-row">
          <p className="text-sm text-zinc-500">
            © {new Date().getFullYear()} SwingDNA. Built for golfers who keep receipts.
          </p>
          <div className="flex gap-6 text-sm text-zinc-500">
            <a href="#" className="transition hover:text-zinc-300">
              Privacy
            </a>
            <a href="#" className="transition hover:text-zinc-300">
              Terms
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
