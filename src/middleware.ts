import { NextRequest, NextResponse } from "next/server";

function isTokenValid(token: string) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false;
    
    let base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4) {
      base64 += "=";
    }
    
    const payload = JSON.parse(atob(base64));
    if (payload.exp && payload.exp * 1000 < Date.now()) return false;
    return true;
  } catch (error) {
    return false;
  }
}

export function middleware(request: NextRequest) {
  const cookieToken = request.cookies.get("auth-token")?.value;

  // Also accept Authorization: Bearer <token> header
  const authHeader = request.headers.get("authorization");
  const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  const token = cookieToken || bearerToken;
  const isValidToken = token ? isTokenValid(token) : false;

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
