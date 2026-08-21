import { NextResponse, type NextRequest } from "next/server";
import { verifySessionToken } from "@/lib/session-token";
import { SESSION_COOKIE } from "@/lib/auth";

export default async function proxy(request: NextRequest) {
  const response = NextResponse.next();

  // Basic security headers on every response.
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  const { pathname } = request.nextUrl;

  const isProtectedAdminRoute = pathname.startsWith("/admin") && pathname !== "/admin/login";

  if (isProtectedAdminRoute) {
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    const session = token ? await verifySessionToken(token) : null;
    if (!session) {
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
