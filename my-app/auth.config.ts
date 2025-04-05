import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  providers: [],
  pages: {
    signIn: "/signin",
  },
  callbacks: {
    // TODO: このままではログインしたあとにdashboard意外から動けないためリファクタリングを行う
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
      const isOnSignIn = nextUrl.pathname.startsWith("/signin");
      if (isOnDashboard) {
        if (isLoggedIn) return true;

        return false;
      } else if (isLoggedIn) {
        return Response.redirect(new URL("/dashboard", nextUrl));
      } else {
        if (isOnSignIn) return true;

        return Response.redirect(new URL("/signin", nextUrl));
      }
    },
  },
};
