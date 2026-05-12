"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { AuthPageShell } from "@/components/auth-page-shell";
import { supabase } from "@/lib/supabaseClient";

function safeInternalPath(next: string | null): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return "/account";
  return next;
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = safeInternalPath(searchParams.get("next"));

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { error: signError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (signError) {
        setError(signError.message);
        return;
      }
      router.refresh();
      router.push(nextPath);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthPageShell
      title="Log in"
      subtitle="Access your SwingDNA workspace with the email and password you used at signup."
    >
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
          <label htmlFor="login-email" className="block text-xs font-medium uppercase tracking-wider text-zinc-500">
            Email
          </label>
          <input
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full rounded-xl border border-white/10 bg-zinc-900/80 px-4 py-3 text-sm text-white outline-none ring-emerald-500/0 transition placeholder:text-zinc-600 focus:border-emerald-500/40 focus:ring-2 focus:ring-emerald-500/20"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label htmlFor="login-password" className="block text-xs font-medium uppercase tracking-wider text-zinc-500">
            Password
          </label>
          <input
            id="login-password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 w-full rounded-xl border border-white/10 bg-zinc-900/80 px-4 py-3 text-sm text-white outline-none focus:border-emerald-500/40 focus:ring-2 focus:ring-emerald-500/20"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 px-5 py-3 text-sm font-semibold text-zinc-950 shadow-[0_0_28px_-8px_rgba(52,211,153,0.5)] transition hover:from-emerald-400 hover:to-emerald-500 disabled:opacity-50"
        >
          {loading ? "Signing in…" : "Log in"}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-zinc-500">
        New here?{" "}
        <Link href="/signup" className="font-medium text-emerald-400/90 hover:text-emerald-300">
          Create an account
        </Link>
      </p>
    </AuthPageShell>
  );
}
