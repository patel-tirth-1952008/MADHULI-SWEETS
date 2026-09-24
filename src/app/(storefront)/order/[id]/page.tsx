import type { Metadata } from "next";
import OrderTrackClient from "@/components/order/OrderTrackClient";

export const metadata: Metadata = { title: "Track Your Order" };

export default function OrderPage() {
  return <OrderTrackClient />;
}
