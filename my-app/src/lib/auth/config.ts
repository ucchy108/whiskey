// import type { NextAuthConfig } from "next-auth";
import { NextAuthConfig } from "next-auth";

const publicRoutes: string[] = [];
const authRoutes: string[] = ["/signin", "/signup"];
const defaultLoginRedirect = "/";

export const authConfig: NextAuthConfig = {
  providers: [],
  pages: {
    signIn: "/signin",
  },
  session: {
    strategy: "jwt",
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
    jwt({ token, user }) {
      // ユーザー情報をJWTトークンに保存
      if (user) {
        token.id = user.id;
        token.name = user.name;
      }

      return token;
    },
    session({ session, token }) {
      // JWTトークンからセッションにユーザー情報を移行
      session.user.id = token.id as string;
      session.user.name = token.name as string;

      return session;
    },
  },
} satisfies NextAuthConfig;
