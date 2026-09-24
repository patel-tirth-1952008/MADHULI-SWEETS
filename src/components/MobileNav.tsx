"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, UtensilsCrossed, ShoppingCart, ClipboardList } from "lucide-react";
import { useCartStore, selectCount } from "@/store/cartStore";
import { useLangStore } from "@/store/langStore";
import { useT } from "@/i18n";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/", key: "nav.home", guLabel: "હોમ", enLabel: "Home" },
  { href: "/menu", key: "nav.menu", guLabel: "મેન્યૂ", enLabel: "Menu" },
  { href: "/cart", key: "cart.title", guLabel: "થાળી", enLabel: "Cart" },
  { href: "/my-orders", key: "nav.orders", guLabel: "મારા ઓર્ડર", enLabel: "My Orders" },
];

export default function MobileNav() {
  const pathname = usePathname();
  const count = useCartStore(selectCount);
  const t = useT();
  const lang = useLangStore((s) => s.lang);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white pb-[env(safe-area-inset-bottom)] md:hidden">
      <div className="grid grid-cols-4">
        {ITEMS.map(({ href, key, guLabel, enLabel }) => {
          const Icon =
            href === "/"
              ? House
              : href === "/menu"
                ? UtensilsCrossed
                : href === "/cart"
                  ? ShoppingCart
                  : ClipboardList;
          const active = pathname === href || (href !== "/" && pathname.startsWith(href));
          const translated = t(key);
          const label = translated === key ? (lang === "gu" ? guLabel : enLabel) : translated;

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "relative flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold transition-colors",
                active ? "text-deepgold" : "text-mute"
              )}
            >
              <span className="relative">
                <Icon size={20} strokeWidth={active ? 2.4 : 2} />
                {href === "/cart" && count > 0 && (
                  <span className="absolute -right-2.5 -top-1.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-gold px-1 text-[10px] font-extrabold text-cocoa">
                    {count}
                  </span>
                )}
              </span>
              <span className={lang === "gu" ? "font-gu" : ""} lang={lang === "gu" ? "gu" : undefined}>
                {label}
              </span>
              {active && <span className="absolute -top-px h-0.5 w-8 rounded-full bg-gold" />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}