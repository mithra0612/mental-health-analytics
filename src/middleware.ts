import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

export function middleware(request: NextRequest) {
  const cookieToken = request.cookies.get("auth-token")?.value;

  // Also accept Authorization: Bearer <token> header
  const authHeader = request.headers.get("authorization");
  const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  const token = cookieToken || bearerToken;
  const isValidToken = token ? verifyToken(token) !== null : false;

  const { pathname } = request.nextUrl;

  const publicPaths = ["/login", "/signup"];
  const isPublicPath = publicPaths.includes(pathname);

  if (!isValidToken && !isPublicPath && pathname !== "/") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/chat/:path*",
    "/settings/:path*",
    "/onboarding/:path*",
  ],
};
