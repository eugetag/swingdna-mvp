"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function LoginRequiredNotice() {
  const pathname = usePathname();
  const next = encodeURIComponent(pathname || "/");

  return (
    <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-6 py-8 text-center">
      <p className="text-base font-semibold text-white">Sign in required</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-amber-100/90">
        Log in to save and view your profile, bag, sessions, and report. Your data is stored per Supabase account.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link
          href={`/login?next=${next}`}
          className="rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 px-5 py-2.5 text-sm font-semibold text-zinc-950 shadow-[0_0_24px_-8px_rgba(52,211,153,0.45)] transition hover:from-emerald-400 hover:to-emerald-500"
        >
          Log in
        </Link>
        <Link
          href="/signup"
          className="rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-white/10"
        >
          Sign up
        </Link>
      </div>
    </div>
  );
}
