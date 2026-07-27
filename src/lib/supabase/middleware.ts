import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Routes that don't require a signed-in user.
const PUBLIC_ROUTES = ["/", "/login", "/signup"];
// /api is intentionally excluded from redirect-based protection: an
// unauthenticated fetch() to a protected API route should get back a JSON
// 401 (each route handler enforces this itself), not a redirect to /login's
// HTML page, which would break `res.json()` on the caller.
const PUBLIC_PREFIXES = ["/auth", "/api", "/_next", "/favicon.ico"];

function isPublicRoute(pathname: string) {
  if (PUBLIC_ROUTES.includes(pathname)) return true;
  return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

/**
 * Refreshes the Supabase auth session on every request and redirects
 * unauthenticated users away from protected app routes. Runs in `proxy.ts`.
 *
 * IMPORTANT: this must always return the `supabaseResponse` object (or a
 * NextResponse built from `request` that carries its cookies forward) —
 * short-circuiting without doing so silently breaks session refresh, which
 * would randomly log users out.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Do not add logic between `createServerClient` and `getUser()` — this
  // call refreshes an expired token and must run on every request.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname, search } = request.nextUrl;

  if (!user && !isPublicRoute(pathname)) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("next", pathname + search);
    return NextResponse.redirect(redirectUrl);
  }

  if (user && (pathname === "/login" || pathname === "/signup")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return supabaseResponse;
}
