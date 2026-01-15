import { getSessionRecord } from "@/lib/auth/session";
import { getSessionCookie } from "@/lib/auth/session-cookies";
import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = [
  "/dashboard",
  "/projects",
  "/users",
  "/reports",
  "/api/projects",
  "/api/users",
];
const publicRoutes = ["/sign-in", "/"];

export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.includes(path);
  const isPublicRoute = publicRoutes.includes(path);

  const sessionId = (await getSessionCookie()) as string;
  if (isProtectedRoute && !sessionId) {
    return NextResponse.redirect(new URL("/sign-in", req.nextUrl));
  }

  const session = await getSessionRecord(sessionId);
  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL("/sign-in", req.nextUrl));
  }

  if (isPublicRoute && session && !req.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  const newHeaders = new Headers(req.headers);
  newHeaders.set("x-user-id", session.user_id);
  newHeaders.set("x-tenant-id", session.tenant_id);

  return NextResponse.next({
    request: {
      headers: newHeaders,
    },
  });
}

// Routes Proxy should not run on
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
