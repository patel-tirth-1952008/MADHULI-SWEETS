"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import CartContent from "@/components/cart/CartContent";

export default function CartDrawer() {
  const cartOpen = useCartStore((s) => s.cartOpen);
  const setCartOpen = useCartStore((s) => s.setCartOpen);

  // Close drawer on Escape key
  useEffect(() => {
    if (!cartOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setCartOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cartOpen, setCartOpen]);

  if (!cartOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden">
      {/* Dark Overlay Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 transition-opacity"
        onClick={() => setCartOpen(false)}
      />

      {/* Slide-over flex wrapper */}
      <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
        <aside
          role="dialog"
          aria-modal="true"
          aria-label="Shopping Cart"
          className="pointer-events-auto flex h-full w-screen max-w-md flex-col bg-white shadow-2xl"
        >
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between border-b border-line px-5 py-4">
            <h2 className="font-display text-xl font-bold text-ink flex items-center gap-2">
              🛒 <span className="font-gu" lang="gu">તમારી થાળી</span>
            </h2>
            <button
              type="button"
              onClick={() => setCartOpen(false)}
              aria-label="Close cart"
              className="grid h-8 w-8 place-items-center rounded-full border border-line text-ink2 hover:bg-warm hover:text-ink"
            >
              <X size={18} />
            </button>
          </div>

          {/* Native Scroll Container */}
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4">
            <CartContent inDrawer />
          </div>
        </aside>
      </div>
    </div>
  );
}