import Link from "next/link";
import { OpenBetaSignupButton } from "@/components/founding-golfer-beta/open-beta-signup-button";
import { SUBSCRIPTION_PLAN_CARDS } from "@/lib/subscriptionTier";

export function SubscriptionPricingSection() {
  return (
    <section
      id="pricing"
      className="scroll-mt-20 border-t border-white/5 bg-gradient-to-b from-zinc-900/30 to-zinc-950 px-4 py-20 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-400/90">Membership</h2>
          <p className="mx-auto mt-3 max-w-2xl text-pretty text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Three tiers. One intelligence stack.
          </p>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-zinc-400">
            Pricing shown for planning — billing is not live yet. Join the beta to lock early rates.
          </p>
        </div>
        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {SUBSCRIPTION_PLAN_CARDS.map((p) => (
            <div
              key={p.tier}
              className={
                p.featured
                  ? "relative flex flex-col rounded-2xl border border-emerald-500/45 bg-gradient-to-b from-emerald-500/[0.14] to-zinc-950/90 p-8 shadow-[0_0_60px_rgba(16,185,129,0.14)]"
                  : "flex flex-col rounded-2xl border border-white/10 bg-zinc-900/25 p-8"
              }
            >
              {p.featured ? (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-emerald-400 px-3 py-0.5 text-xs font-semibold text-zinc-950">
                  Most popular
                </span>
              ) : null}
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">{p.tier}</p>
              <h3 className="mt-2 text-lg font-semibold text-white">{p.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">{p.blurb}</p>
              <p className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-semibold tracking-tight text-white">{p.price}</span>
                <span className="text-sm text-zinc-500">{p.period}</span>
              </p>
              <ul className="mt-8 flex flex-1 flex-col gap-3 text-sm text-zinc-300">
                {p.highlights.map((h) => (
                  <li key={h} className="flex gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500/80" />
                    {h}
                  </li>
                ))}
              </ul>
              <OpenBetaSignupButton
                className={
                  p.featured
                    ? "mt-8 inline-flex h-11 w-full items-center justify-center rounded-full bg-white text-sm font-semibold text-zinc-950 transition hover:bg-zinc-100"
                    : "mt-8 inline-flex h-11 w-full items-center justify-center rounded-full border border-white/15 bg-white/5 text-sm font-medium text-white transition hover:border-white/25 hover:bg-white/10"
                }
              >
                Request access
              </OpenBetaSignupButton>
              <Link
                href="/how-it-works"
                className="mt-3 text-center text-xs font-medium text-zinc-500 underline-offset-4 transition hover:text-zinc-300 hover:underline"
              >
                How it works
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
