import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase client for use in the browser (Client Components, event handlers,
 * effects). Reads/writes the auth session via cookies so it stays in sync
 * with the server client and proxy.ts.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
