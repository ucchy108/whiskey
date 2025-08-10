import type { NextAuthConfig } from "next-auth";

const publicRoutes: string[] = [];
const authRoutes: string[] = ["/signin", "/signup"];
const defaultLoginRedirect = "/";

export const authConfig: NextAuthConfig = {
  providers: [],
  pages: {
    signIn: "/signin",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;

      const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
      const isAuthRoute = authRoutes.includes(nextUrl.pathname);
      if (isAuthRoute) {
        if (isLoggedIn) {
          return Response.redirect(new URL(defaultLoginRedirect, nextUrl));
        }

        return true;
      }

      if (!isLoggedIn && !isPublicRoute) {
        return Response.redirect(new URL("/signin", nextUrl));
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
