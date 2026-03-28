import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Paths that don't require authentication
  if (pathname.startsWith("/auth/") || pathname.startsWith("/_next") || pathname === "/favicon.ico") {
    return NextResponse.next();
  }

  // Check for Better Auth session cookie
  // Since we used cookiePrefix: "afc-sear", the cookie name will be "afc-sear.session_token"
  const sessionToken = request.cookies.get("afc-sear.session_token");

  if (!sessionToken) {
    const loginUrl = new URL("/auth/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|images).*)",
  ],
};
