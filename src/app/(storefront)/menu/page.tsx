import type { Metadata } from "next";
import { Suspense } from "react";
import MenuClient from "@/components/menu/MenuClient";
import { BrandSpinner } from "@/components/ui";

export const metadata: Metadata = {
  title: "Menu — Sweets, Namkeen & Farsan",
  description:
    "Browse the full menu at Madhuli Namkeen & Sweets, Nikol — sweets, namkeen, farsan and seasonal specials. Fresh daily in pure peanut oil.",
};

export default function MenuPage() {
  return (
    <Suspense fallback={<BrandSpinner label="મેન્યૂ લોડ થાય છે…" />}>
      <MenuClient />
    </Suspense>
  );
}
