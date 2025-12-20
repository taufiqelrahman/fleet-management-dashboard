import { NextRequest, NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { getToken } from "next-auth/jwt";
import { locales } from "./i18n";

const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale: "en",
  localePrefix: "always",
});

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Handle auth routes - don't check authentication
  if (
    pathname.match(/^\/(en|id|ar)\/login/) ||
    pathname.match(/^\/api\/auth/)
  ) {
    return intlMiddleware(request);
  }

  // Check if route requires authentication
  const isDashboardRoute = pathname.match(/^\/(en|id|ar)\/dashboard/);

  if (isDashboardRoute) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      // Get locale from pathname
      const locale = pathname.split("/")[1] || "en";
      const loginUrl = new URL(`/${locale}/login`, request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
