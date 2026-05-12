/** Shared public Supabase configuration (browser + Edge middleware). */
import { trimStringish } from "@/lib/trimStringish";

export function getSupabasePublicEnv(): { url: string; anonKey: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!trimStringish(url)) {
    throw new Error("Missing environment variable: NEXT_PUBLIC_SUPABASE_URL");
  }
  if (!trimStringish(anonKey)) {
    throw new Error("Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }
  return { url: trimStringish(url), anonKey: trimStringish(anonKey) };
}
