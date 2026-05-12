"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthPageShell } from "@/components/auth-page-shell";
import { supabase } from "@/lib/supabaseClient";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sentConfirm, setSentConfirm] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const { error: signError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: origin ? `${origin}/account` : undefined,
        },
      });
      if (signError) {
        setError(signError.message);
        return;
      }
      setSentConfirm(true);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthPageShell
      title="Create account"
      subtitle="Email and password — same Supabase project as your performance data."
    >
      {sentConfirm ? (
        <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 px-5 py-6 text-sm leading-relaxed text-emerald-100">
          <p className="font-medium text-white">Check your inbox</p>
          <p className="mt-2 text-emerald-100/90">
            If email confirmation is enabled for this project, follow the link in the email to activate your account.
            Otherwise you can log in now.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/15"
          >
            Go to log in
          </Link>
        </div>
      ) : (
        <form onSubmit={(ev) => void handleSubmit(ev)} className="space-y-5">
          {error ? (
            <div
              className="rounded-xl border border-red-500/35 bg-red-500/10 px-4 py-3 text-sm text-red-100"
              role="alert"
            >
              {error}
            </div>
          ) : null}

          <div>
            <label htmlFor="signup-email" className="block text-xs font-medium uppercase tracking-wider text-zinc-500">
              Email
            </label>
            <input
              id="signup-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-zinc-900/80 px-4 py-3 text-sm text-white outline-none focus:border-emerald-500/40 focus:ring-2 focus:ring-emerald-500/20"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="signup-password"
              className="block text-xs font-medium uppercase tracking-wider text-zinc-500"
            >
              Password
            </label>
            <input
              id="signup-password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-zinc-900/80 px-4 py-3 text-sm text-white outline-none focus:border-emerald-500/40 focus:ring-2 focus:ring-emerald-500/20"
              placeholder="At least 6 characters"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 px-5 py-3 text-sm font-semibold text-zinc-950 shadow-[0_0_28px_-8px_rgba(52,211,153,0.5)] transition hover:from-emerald-400 hover:to-emerald-500 disabled:opacity-50"
          >
            {loading ? "Creating account…" : "Sign up"}
          </button>
        </form>
      )}

      <p className="mt-8 text-center text-sm text-zinc-500">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-emerald-400/90 hover:text-emerald-300">
          Log in
        </Link>
      </p>
    </AuthPageShell>
  );
}
