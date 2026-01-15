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
const publicRoutes = ["/"];

export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.includes(path);
  const isPublicRoute = publicRoutes.includes(path);

  const sessionId = (await getSessionCookie()) as string;
  if (isProtectedRoute && !sessionId) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  const session = await getSessionRecord(sessionId);
  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  if (isPublicRoute && session && !req.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  return NextResponse.next();
}

// Routes Proxy should not run on
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
