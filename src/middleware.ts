import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth-token")?.value;
  const { pathname } = request.nextUrl;

  const publicPaths = ["/login", "/signup"];
  const isPublicPath = publicPaths.includes(pathname);

  if (!token && !isPublicPath && pathname !== "/") {
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
