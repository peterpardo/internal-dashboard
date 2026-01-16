import { getSessionRecord } from "@/lib/auth/session";
import { getSessionCookie } from "@/lib/auth/session-cookies";
import { NextRequest, NextResponse } from "next/server";

const protectedRoutePrefixes = [
  "/dashboard",
  "/projects",
  "/users",
  "/reports",
  "/api/service-requests",
  "/api/users",
];
const publicRoutes = ["/sign-in", "/"];

function isProtected(path: string) {
  return protectedRoutePrefixes.some((p) => path.startsWith(p));
}

export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isProtectedRoute = isProtected(path);
  const isPublicRoute = publicRoutes.includes(path);

  const sessionId = (await getSessionCookie()) as string;
  const session = sessionId ? await getSessionRecord(sessionId) : null;

  if (isPublicRoute && session) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL("/sign-in", req.nextUrl));
  }

  if (isProtectedRoute && session) {
    const newHeaders = new Headers(req.headers);
    newHeaders.set("x-user-id", session.user_id);
    newHeaders.set("x-tenant-id", session.tenant_id);

    return NextResponse.next({
      request: {
        headers: newHeaders,
      },
    });
  }

  return NextResponse.next();
}

// Routes Proxy should not run on
export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\.png$).*)"],
};
