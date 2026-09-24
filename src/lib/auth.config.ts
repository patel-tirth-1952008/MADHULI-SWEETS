import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe Auth.js config used by the middleware (no Prisma, no Node APIs).
 * The full server config (with the Credentials provider) lives in auth.ts.
 */
export const authConfig = {
  // Required behind a proxy (Vercel, this preview, any reverse proxy):
  // trust the incoming Host header for cookie/CSRF validation.
  trustHost: true,
  pages: { signIn: "/admin/login" },
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnAdmin = nextUrl.pathname.startsWith("/admin");
      if (isOnAdmin && !isLoggedIn && nextUrl.pathname !== "/admin/login") {
        return false; // → redirects to /admin/login
      }
      return true;
    },
  },
} satisfies NextAuthConfig;
