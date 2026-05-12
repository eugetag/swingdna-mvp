"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export type AuthUserState =
  | { status: "loading" }
  | { status: "signed_out" }
  | { status: "signed_in"; userId: string };

/**
 * Tracks the current Supabase Auth user in Client Components.
 */
export function useAuthUser(): AuthUserState {
  const [state, setState] = useState<AuthUserState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    async function sync() {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (cancelled) return;
      if (error || !user?.id) {
        setState({ status: "signed_out" });
        return;
      }
      setState({ status: "signed_in", userId: user.id });
    }

    void sync();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (cancelled) return;
      const uid = session?.user?.id;
      if (!uid) {
        setState({ status: "signed_out" });
        return;
      }
      setState({ status: "signed_in", userId: uid });
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  return state;
}

/** Resolve the current user id for a write — call immediately before insert. */
export async function getCurrentUserIdForWrite(): Promise<string | null> {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user?.id) return null;
  return user.id;
}
