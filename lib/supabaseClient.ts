import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

/**
 * Browser Supabase client (anon key, cookie-backed session via @supabase/ssr).
 * Use in Client Components only.
 */
export const supabase = createBrowserSupabaseClient();
