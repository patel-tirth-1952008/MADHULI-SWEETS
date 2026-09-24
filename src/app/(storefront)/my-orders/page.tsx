import type { Metadata } from "next";
import MyOrdersClient from "@/components/order/MyOrdersClient";

export const metadata: Metadata = { title: "My Orders" };

export default function MyOrdersPage() {
  return <MyOrdersClient />;
}
