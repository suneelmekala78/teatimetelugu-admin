import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login"];

// Admin-only routes — writers cannot access these
const ADMIN_ONLY_PATHS = ["/home-config", "/users", "/notifications", "/settings"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Check for role cookie (set by the frontend on login).
  // The httpOnly refreshToken cookie is on the API domain, not readable here
  // in dev (cross-origin). The client-side useAuth hook provides the real
  // auth guard; this middleware is a first line of defence.
  const role = request.cookies.get("role")?.value;
  if (!role) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Check role for admin-only routes
  if (ADMIN_ONLY_PATHS.some((p) => pathname.startsWith(p))) {
    if (role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - api (proxied to backend via rewrites)
     * - _next/static, _next/image (Next.js internals)
     * - favicon.ico, images, icons, fonts (static assets)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|images|icons|fonts).*)",
  ],
};
