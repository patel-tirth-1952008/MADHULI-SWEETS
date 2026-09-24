"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  UtensilsCrossed,
  ClipboardList,
  Settings,
  ExternalLink,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/menu", label: "Menu Items", icon: UtensilsCrossed },
  { href: "/admin/orders", label: "Orders", icon: ClipboardList },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Login page renders standalone (no sidebar)
  if (pathname === "/admin/login") return <>{children}</>;

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-line bg-white md:flex">
        <div className="flex items-center gap-2.5 border-b border-line px-5 py-5">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-jalebi shadow-warm">
            <span className="font-gu text-lg font-bold text-cocoa" lang="gu">
              મા
            </span>
          </span>
          <div className="leading-tight">
            <p className="font-display text-sm font-bold text-ink">Madhuli Sweets</p>
            <p className="text-xs font-semibold text-golddark">Admin Panel</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {NAV.map((n) => {
            const active = pathname.startsWith(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition",
                  active ? "bg-warm text-deepgold ring-1 ring-linemed" : "text-ink2 hover:bg-cream"
                )}
              >
                <n.icon size={18} /> {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="space-y-1 border-t border-line p-3">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-ink2 transition hover:bg-cream"
          >
            <ExternalLink size={18} /> View Storefront
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-ink2 transition hover:bg-bad/10 hover:text-bad"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-40 border-b border-line bg-white md:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-jalebi">
              <span className="font-gu text-sm font-bold text-cocoa" lang="gu">
                મા
              </span>
            </span>
            <p className="font-display text-sm font-bold text-ink">Admin Panel</p>
          </div>
          <div className="flex items-center gap-1">
            <Link href="/" className="rounded-full p-2 text-ink2" aria-label="Storefront">
              <ExternalLink size={17} />
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/admin/login" })}
              className="rounded-full p-2 text-ink2"
              aria-label="Logout"
            >
              <LogOut size={17} />
            </button>
          </div>
        </div>
        <nav className="no-scrollbar flex gap-1 overflow-x-auto px-3 pb-2">
          {NAV.map((n) => {
            const active = pathname.startsWith(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                className={cn(
                  "shrink-0 rounded-full px-4 py-2 text-xs font-bold transition",
                  active ? "bg-gold text-cocoa" : "bg-cream text-ink2"
                )}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>
      </header>

      <main className="min-w-0 flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
    </div>
  );
}
