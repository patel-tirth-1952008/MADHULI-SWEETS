import type { Metadata } from "next";
import AboutClient from "@/components/about/AboutClient";

export const metadata: Metadata = {
  title: "Our Story — A woman's kitchen in Nikol",
  description:
    "How Madhuli Namkeen & Sweets started with three nani-approved recipes, and why every batch is still made in pure peanut oil.",
};

export default function AboutPage() {
  return <AboutClient />;
}
