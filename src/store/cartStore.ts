import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  nameGu?: string;
  price: number;
  unit: string;
  quantity: number;
  image?: string;
}

interface CartState {
  items: CartItem[];
  cartOpen: boolean;
  bump: number;
  recentOrderIds: string[];
  add: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  setQty: (productId: string, qty: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
  setCartOpen: (open: boolean) => void;
  addOrder: (orderId: string) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      cartOpen: false,
      bump: 0,
      recentOrderIds: [],
      add: (item, qty = 1) =>
        set((s) => {
          const existing = s.items.find((i) => i.productId === item.productId);
          const items = existing
            ? s.items.map((i) =>
                i.productId === item.productId
                  ? { ...i, quantity: Math.min(i.quantity + qty, 50) }
                  : i
              )
            : [...s.items, { ...item, quantity: Math.min(qty, 50) }];
          return { items, bump: s.bump + 1 };
        }),
      setQty: (productId, qty) =>
        set((s) => ({
          items:
            qty <= 0
              ? s.items.filter((i) => i.productId !== productId)
              : s.items.map((i) =>
                  i.productId === productId ? { ...i, quantity: Math.min(qty, 50) } : i
                ),
        })),
      remove: (productId) =>
        set((s) => ({ items: s.items.filter((i) => i.productId !== productId) })),
      clear: () => set({ items: [] }),
      setCartOpen: (cartOpen) => set({ cartOpen }),
      addOrder: (orderId) =>
        set((s) => ({
          recentOrderIds: [orderId, ...s.recentOrderIds.filter((o) => o !== orderId)].slice(0, 12),
        })),
    }),
    {
      name: "madhuli-cart",
      partialize: (s) =>
        ({ items: s.items, recentOrderIds: s.recentOrderIds }) as unknown as CartState,
    }
  )
);

export const selectCount = (s: CartState): number =>
  s.items.reduce((n, i) => n + i.quantity, 0);

export const selectSubtotal = (s: CartState): number =>
  s.items.reduce((n, i) => n + i.price * i.quantity, 0);
