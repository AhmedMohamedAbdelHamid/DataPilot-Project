import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Supabase client for use on the server (Server Components, Server Actions,
 * Route Handlers). Must be created fresh per request — it reads/writes
 * cookies from the current request's cookie store.
 *
 * Calling `.set()` here only works inside a Server Action or Route Handler;
 * calls made during Server Component rendering are caught and ignored
 * because the response has already started streaming (session refresh for
 * that case is handled by `proxy.ts` instead).
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component during render — safe to ignore
            // because proxy.ts refreshes the session on every request.
          }
        },
      },
    }
  );
}
