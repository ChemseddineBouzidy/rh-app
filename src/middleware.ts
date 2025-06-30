import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default withAuth(
  function middleware(req: NextRequest) {
    const token = req.nextauth.token;

    const pathname = req.nextUrl.pathname;
    const role = token?.role;

    if (!token) {
      return NextResponse.redirect(new URL("/auth/signin", req.url));
    }

    if (pathname.startsWith("/admin") && role !== "admin") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    if (pathname.startsWith("/employe") && role !== "employe") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    if (pathname.startsWith("/manager") && role !== "manager") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    if (pathname.startsWith("/rh") && role !== "rh") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    return NextResponse.next();
  },
  {
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
      signIn: "/auth/signin",
    },
  }
);

export const config = {
  matcher: ["/admin/:path*", "/employe/:path*", "/manager/:path*", "/rh/:path*"],
};
