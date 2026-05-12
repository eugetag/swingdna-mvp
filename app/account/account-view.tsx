"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthPageShell } from "@/components/auth-page-shell";
import { supabase } from "@/lib/supabaseClient";

export function AccountView({ email }: { email: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignOut() {
    setError(null);
    setLoading(true);
    try {
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) {
        setError(signOutError.message);
        return;
      }
      router.refresh();
      router.push("/");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthPageShell title="Your account" subtitle="Signed in with Supabase Auth.">
      <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-zinc-950/40 p-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Email</p>
        <p className="mt-2 break-all font-mono text-sm text-white">{email || "—"}</p>
      </div>

      {error ? (
        <div className="mt-5 rounded-xl border border-red-500/35 bg-red-500/10 px-4 py-3 text-sm text-red-100" role="alert">
          {error}
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => void handleSignOut()}
        disabled={loading}
        className="mt-8 w-full rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-100 disabled:opacity-50"
      >
        {loading ? "Signing out…" : "Log out"}
      </button>
    </AuthPageShell>
  );
}
