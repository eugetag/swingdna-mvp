import Link from "next/link";

export type UpgradePromptKind = "advanced-ai" | "swing-analysis";

const copy: Record<
  UpgradePromptKind,
  { title: string; body: string }
> = {
  "advanced-ai": {
    title: "Advanced AI limit reached",
    body: "You have used all advanced AI coach runs for this month on your current plan. Upgrade to Elite for unlimited analysis, or wait until your monthly window resets (UTC).",
  },
  "swing-analysis": {
    title: "Swing analysis limit reached",
    body: "You have reached your monthly swing photo and video analysis allowance. Upgrade to Elite for unlimited uploads, or try again next month.",
  },
};

type Props = {
  kind: UpgradePromptKind;
  className?: string;
};

export function UpgradePrompt({ kind, className = "" }: Props) {
  const { title, body } = copy[kind];
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/[0.12] via-zinc-950/80 to-zinc-950 p-5 shadow-[0_0_40px_-12px_rgba(245,158,11,0.25)] sm:p-6 ${className}`}
      role="status"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 top-0 h-32 w-32 rounded-full bg-amber-400/15 blur-2xl"
      />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-200/80">Upgrade</p>
          <h3 className="mt-2 text-lg font-semibold tracking-tight text-white">{title}</h3>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-400">{body}</p>
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:items-end">
          <Link
            href="/#pricing"
            className="inline-flex h-10 items-center justify-center rounded-full bg-white px-5 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-100"
          >
            View plans
          </Link>
          <p className="text-center text-[10px] text-zinc-600 sm:text-right">Stripe checkout coming soon</p>
        </div>
      </div>
    </div>
  );
}
