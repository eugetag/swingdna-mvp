"use client";

import { useEffect, useId, useRef, useState } from "react";

type FormState = {
  name: string;
  email: string;
  handicap: string;
  launch_monitor: string;
  golf_goal: string;
};

const initialForm: FormState = {
  name: "",
  email: "",
  handicap: "",
  launch_monitor: "",
  golf_goal: "",
};

const inputClass =
  "w-full rounded-xl border border-white/10 bg-zinc-950/80 px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none transition focus:border-emerald-500/45 focus:ring-2 focus:ring-emerald-500/25";

const labelClass = "mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function FoundingGolferBetaModal({ open, onClose }: Props) {
  const titleId = useId();
  const descId = useId();
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const [phase, setPhase] = useState<"form" | "success">("form");
  const [form, setForm] = useState<FormState>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(() => firstFieldRef.current?.focus());
    return () => cancelAnimationFrame(id);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/beta-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          handicap: form.handicap,
          launch_monitor: form.launch_monitor,
          golf_goal: form.golf_goal,
        }),
      });
      const data: unknown = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg =
          typeof data === "object" && data !== null && "error" in data && typeof (data as { error: unknown }).error === "string"
            ? (data as { error: string }).error
            : "Something went wrong.";
        setError(msg);
        return;
      }
      setPhase("success");
    } catch {
      setError("Network error. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[110] flex items-end justify-center sm:items-center"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="absolute inset-0 bg-zinc-950/75 backdrop-blur-md"
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={phase === "form" ? descId : undefined}
        className="relative z-[1] flex max-h-[min(92dvh,900px)] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl border border-white/10 bg-gradient-to-b from-zinc-900/98 to-zinc-950 shadow-[0_-8px_48px_rgba(0,0,0,0.45)] sm:mx-4 sm:max-h-[90vh] sm:rounded-2xl sm:shadow-2xl"
      >
        <div className="pointer-events-none absolute -left-24 top-0 h-48 w-48 rounded-full bg-emerald-500/15 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -right-16 bottom-0 h-40 w-40 rounded-full bg-amber-400/10 blur-3xl" aria-hidden />

        <div className="relative flex shrink-0 items-start justify-between gap-4 border-b border-white/[0.07] px-5 pb-4 pt-5 sm:px-6 sm:pt-6">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald-400/90">Founding Golfer Beta</p>
            <h2 id={titleId} className="mt-1.5 text-xl font-semibold tracking-tight text-white sm:text-2xl">
              {phase === "form" ? "Join the inner circle" : "You are in"}
            </h2>
            {phase === "form" ? (
              <p id={descId} className="mt-2 max-w-sm text-sm leading-relaxed text-zinc-400">
                Limited spots. Tell us about your game — we will tailor your workspace when your invite lands.
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg border border-white/10 p-2 text-zinc-400 transition hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
            aria-label="Close"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6 sm:py-6">
          {phase === "success" ? (
            <div className="flex flex-col items-center py-4 text-center sm:py-8">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 ring-1 ring-emerald-500/35">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-emerald-400" aria-hidden>
                  <path
                    d="M20 6L9 17l-5-5"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <p className="mt-6 max-w-sm text-base font-medium leading-relaxed text-zinc-100 sm:text-lg">
                You&apos;re on the list. Welcome to the Founding Golfer Beta.
              </p>
              <p className="mt-3 max-w-sm text-sm text-zinc-500">
                Watch your inbox — we will reach out with next steps.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-8 inline-flex h-11 min-w-[160px] items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-100"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="flex flex-col gap-4">
              <div>
                <label htmlFor="beta-name" className={labelClass}>
                  Full name
                </label>
                <input
                  ref={firstFieldRef}
                  id="beta-name"
                  name="name"
                  autoComplete="name"
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className={inputClass}
                  placeholder="Jordan Smith"
                />
              </div>
              <div>
                <label htmlFor="beta-email" className={labelClass}>
                  Email
                </label>
                <input
                  id="beta-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className={inputClass}
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label htmlFor="beta-handicap" className={labelClass}>
                  Handicap
                </label>
                <input
                  id="beta-handicap"
                  name="handicap"
                  required
                  value={form.handicap}
                  onChange={(e) => setForm((f) => ({ ...f, handicap: e.target.value }))}
                  className={inputClass}
                  placeholder="e.g. 12, scratch, +1.2"
                />
              </div>
              <div>
                <label htmlFor="beta-lm" className={labelClass}>
                  Launch monitor used
                </label>
                <input
                  id="beta-lm"
                  name="launch_monitor"
                  required
                  value={form.launch_monitor}
                  onChange={(e) => setForm((f) => ({ ...f, launch_monitor: e.target.value }))}
                  className={inputClass}
                  placeholder="Trackman, GCQuad, FlightScope, none yet…"
                />
              </div>
              <div>
                <label htmlFor="beta-goal" className={labelClass}>
                  Biggest golf goal
                </label>
                <textarea
                  id="beta-goal"
                  name="golf_goal"
                  required
                  rows={4}
                  value={form.golf_goal}
                  onChange={(e) => setForm((f) => ({ ...f, golf_goal: e.target.value }))}
                  className={`${inputClass} min-h-[108px] resize-y`}
                  placeholder="What would change everything for your game this season?"
                />
              </div>

              {error ? (
                <p className="rounded-xl border border-red-500/25 bg-red-500/10 px-3 py-2 text-sm text-red-200" role="alert">
                  {error}
                </p>
              ) : null}

              <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="order-2 inline-flex h-11 items-center justify-center rounded-full border border-white/12 bg-transparent px-5 text-sm font-medium text-zinc-300 transition hover:border-white/20 hover:bg-white/[0.04] hover:text-white sm:order-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="order-1 inline-flex h-11 items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 text-sm font-semibold text-zinc-950 shadow-[0_0_28px_rgba(16,185,129,0.28)] transition enabled:hover:from-emerald-400 enabled:hover:to-emerald-500 disabled:cursor-not-allowed disabled:opacity-60 sm:order-2"
                >
                  {submitting ? "Sending…" : "Request my spot"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
