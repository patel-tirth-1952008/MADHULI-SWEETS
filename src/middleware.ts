import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

// Protects /admin/* (except /admin/login). JWT-only check — no DB on the edge.
export default NextAuth(authConfig).auth;

export const config = {
  matcher: ["/admin/:path*"],
};
