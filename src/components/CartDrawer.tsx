"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import CartContent from "./cart/CartContent";
import { useCartStore } from "@/store/cartStore";

/** Desktop slide-in cart drawer. */
export default function CartDrawer() {
  const open = useCartStore((s) => s.cartOpen);
  const setOpen = useCartStore((s) => s.setCartOpen);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-50 bg-ink/25"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />
          <motion.aside
            key="drawer"
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-elevated"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 280 }}
            role="dialog"
            aria-label="Your cart"
          >
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <h2 className="font-display text-xl font-bold text-ink">
                🛒 <span className="font-gu" lang="gu">તમારી થાળી</span>
              </h2>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close cart"
                className="grid h-9 w-9 place-items-center rounded-full border border-line text-ink2 transition hover:border-gold hover:bg-warm"
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <CartContent inDrawer />
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
