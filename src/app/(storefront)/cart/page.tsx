import type { Metadata } from "next";
import CartContent from "@/components/cart/CartContent";

export const metadata: Metadata = { title: "Your Thali — Cart" };

export default function CartPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-10 lg:px-8">
      <CartContent />
    </div>
  );
}
